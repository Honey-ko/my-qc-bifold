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

const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onUpdate, isViewer, jobId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
        e.target.value = ''; // Reset file input
    }
  };
  
  const handleRemoveImage = async (id: string, url: string) => {
    if (isViewer) return;

    try {
        const filePath = url.substring(url.indexOf(`qc-images/`) + `qc-images/`.length);
        const { error } = await supabase.storage.from('qc-images').remove([filePath]);
        if(error) throw error;

        const updatedImages = item.images.filter(image => image.id !== id);
        onUpdate({ ...item, images: updatedImages });
    } catch(error) {
        console.error("Error deleting image:", error);
        alert("Failed to delete image.");
    }
  };

  const handleGenerateComment = async () => {
    setIsGenerating(true);
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `Generate a brief, professional quality control failure comment for the checklist item: "${item.name}". The comment should be a concise description of a potential issue.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text.trim();
      if (text) {
        onUpdate({ ...item, comment: text });
      } else {
        throw new Error('No content generated.');
      }
    } catch (error) {
      console.error('Error generating comment:', error);
      alert('Could not generate a suggestion. Please check your API key and network connection.');
    } finally {
      setIsGenerating(false);
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
            {!isViewer && item.status === ChecklistStatus.FAIL && (
                <button
                    onClick={handleGenerateComment}
                    disabled={isGenerating}
                    className="absolute bottom-2 right-2 p-1.5 bg-warning text-yellow-900 rounded-full hover:bg-yellow-500 transition-colors disabled:bg-gray-300 disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-yellow-500"
                    title="Suggest a comment with AI"
                    aria-label="Suggest a comment with AI"
                >
                    {isGenerating ? (
                        <div className="w-4 h-4 border-2 border-yellow-900 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <SparklesIcon className="w-4 h-4" />
                    )}
                </button>
            )}
          </div>

          <ImageUploader 
            images={item.images} 
            onRemoveImage={handleRemoveImage} 
            isViewer={isViewer} 
          />
        </div>
    </div>
  );
};

export default ChecklistItem;