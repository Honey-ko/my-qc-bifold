
import React, { useState, useRef } from 'react';
import type { ChecklistItem as ChecklistItemType, ChecklistItemImage } from '../types';
import { ChecklistStatus } from '../types';
import { CheckIcon, XIcon, SparklesIcon, CameraIcon } from './Icons';
import ImageUploader from './ImageUploader';
import { supabase } from '../lib/supabase';

interface ChecklistItemProps {
  item: ChecklistItemType;
  onUpdate: (updatedItem: ChecklistItemType) => void;
  isViewer: boolean;
  jobId: string;
}

const StatusIcon: React.FC<{ status: ChecklistStatus }> = ({ status }) => {
    switch (status) {
        case ChecklistStatus.PASS:
            return <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center"><CheckIcon className="w-4 h-4 text-white" /></div>;
        case ChecklistStatus.FAIL:
            return <div className="w-6 h-6 rounded-full bg-danger flex items-center justify-center"><XIcon className="w-4 h-4 text-white" /></div>;
        default:
            return <div className="w-6 h-6 rounded-full bg-gray-300" />;
    }
};

async function urlToBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const blob = await response.blob();
  const mimeType = blob.type;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
          return reject(new Error("Failed to read file as data URL"));
      }
      const base64 = reader.result.split(',')[1];
      resolve({ base64, mimeType });
    };
    reader.readAsDataURL(blob);
  });
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onUpdate, isViewer, jobId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [analyzingImageId, setAnalyzingImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headingId = `${item.id}-heading`;

  const handleStatusChange = (newStatus: ChecklistStatus) => {
    if(isViewer) return;
    const isUnchecking = item.status === newStatus;
    onUpdate({ ...item, status: isUnchecking ? ChecklistStatus.UNCHECKED : newStatus });
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if(isViewer) return;
    onUpdate({ ...item, comment: e.target.value });
  };

  const handleAddImageClick = () => {
    if (isViewer || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${jobId}/${item.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('qc-images')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }
        
        const { data } = supabase.storage
            .from('qc-images')
            .getPublicUrl(filePath);

        if (!data.publicUrl) {
            throw new Error("Could not get public URL for uploaded file.");
        }

        const newImage: ChecklistItemImage = {
            id: `img-${Date.now()}`,
            url: data.publicUrl,
        };
        onUpdate({ ...item, images: [...item.images, newImage] });
    } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image.");
    } finally {
        setIsUploading(false);
    }
    
    e.target.value = ''; // Reset file input
  };
  
  const handleRemoveImage = async (id: string, url: string) => {
    if (isViewer) return;

    try {
        const filePath = new URL(url).pathname.split('/qc-images/')[1];
        if (!filePath) {
            throw new Error("Could not determine file path from URL.");
        }
        
        const { error } = await supabase.storage.from('qc-images').remove([filePath]);
        if(error) throw error;

        const updatedImages = item.images.filter(image => image.id !== id);
        onUpdate({ ...item, images: updatedImages });
    } catch(error) {
        console.error("Error deleting image:", error);
        alert("Failed to delete image.");
    }
  };

  const handleAnalyzeImage = async (imageId: string, imageUrl: string) => {
    setAnalyzingImageId(imageId);
    try {
      const { GoogleGenAI } = await import('@google/genai');
      // IMPORTANT: This relies on the API_KEY environment variable being set in your Vercel project settings.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      const { base64, mimeType } = await urlToBase64(imageUrl);

      const imagePart = {
        inlineData: {
          data: base64,
          mimeType: mimeType,
        },
      };

      const textPart = {
        text: `Analyze this image for a quality control inspection. The checklist item is "${item.name}". Describe any defects or issues you see. Be concise and professional.`,
      };
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
      });

      const text = response.text.trim();
      if (text) {
        onUpdate({ ...item, comment: text });
      } else {
        throw new Error('No content generated.');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Could not analyze the image. Please check your API key and network connection.');
    } finally {
      setAnalyzingImageId(null);
    }
  };

  const getStatusBgColor = () => {
    switch (item.status) {
      case ChecklistStatus.PASS: return 'bg-success/5';
      case ChecklistStatus.FAIL: return 'bg-danger/5';
      default: return 'bg-white';
    }
  };

  return (
    <div className={`rounded-lg transition-colors duration-200 overflow-hidden shadow-sm border ${item.status === ChecklistStatus.FAIL ? 'border-danger/50' : 'border-gray-200'} ${getStatusBgColor()}`}>
      <div 
        id={headingId}
        className="w-full flex justify-between items-center p-4 text-left"
      >
        <span className="font-semibold text-gray-800 pr-2">{item.name}</span>
        <div className="flex items-center gap-3">
          <StatusIcon status={item.status} />
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
          {!isViewer && (
            <div className="flex items-center gap-2 mb-4">
               <button
                onClick={() => handleStatusChange(ChecklistStatus.PASS)}
                aria-label={`Mark ${item.name} as pass`}
                className={`flex-1 py-2 px-3 text-sm font-semibold flex items-center justify-center gap-2 rounded-md transition-colors border ${item.status === ChecklistStatus.PASS ? 'bg-success text-white border-success' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
              >
                <CheckIcon className="w-5 h-5" /> Pass
              </button>
              <button
                onClick={() => handleStatusChange(ChecklistStatus.FAIL)}
                aria-label={`Mark ${item.name} as fail`}
                className={`flex-1 py-2 px-3 text-sm font-semibold flex items-center justify-center gap-2 rounded-md transition-colors border ${item.status === ChecklistStatus.FAIL ? 'bg-danger text-white border-danger' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
              >
                <XIcon className="w-5 h-5" /> Fail
              </button>
              <button
                onClick={handleAddImageClick}
                className="p-2.5 flex items-center justify-center rounded-md bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Add image"
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CameraIcon className="w-5 h-5" />
                )}
              </button>
              <input
                type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden"
                accept="image/*" capture="environment"
              />
            </div>
          )}
          
          <div className="relative">
            <textarea
              value={item.comment}
              onChange={handleCommentChange}
              readOnly={isViewer}
              placeholder={isViewer ? "No comment" : "Add comments..."}
              aria-labelledby={headingId}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-primary focus:border-primary read-only:bg-gray-100 read-only:cursor-not-allowed"
              rows={isViewer && !item.comment ? 1 : 3}
            />
          </div>

          <ImageUploader 
            images={item.images} 
            onRemoveImage={handleRemoveImage} 
            onAnalyzeImage={handleAnalyzeImage}
            isViewer={isViewer}
            isFailState={item.status === ChecklistStatus.FAIL}
            analyzingImageId={analyzingImageId}
          />
        </div>
    </div>
  );
};

export default ChecklistItem;
