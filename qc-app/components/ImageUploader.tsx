import React from 'react';
import type { ChecklistItemImage } from '../types';
import { TrashIcon, SparklesIcon } from './Icons';

interface ImageUploaderProps {
    images: ChecklistItemImage[];
    onRemoveImage: (id: string, url: string) => void;
    onAnalyzeImage: (id: string, url: string) => void;
    isViewer: boolean;
    isFailState: boolean;
    analyzingImageId: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onRemoveImage, onAnalyzeImage, isViewer, isFailState, analyzingImageId }) => {
    if (images.length === 0) {
        return null;
    }

    return (
        <div className="pt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map(image => (
                <div key={image.id} className="relative group aspect-square">
                    <img
                        src={image.url}
                        alt="QC inspection"
                        className="w-full h-full object-cover rounded-lg shadow-sm border border-gray-200"
                    />
                    {!isViewer && (
                         <div className="absolute top-1.5 right-1.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                            <button
                                onClick={() => onRemoveImage(image.id, image.url)}
                                className="bg-black bg-opacity-60 text-white rounded-full p-1.5 transition-colors hover:bg-opacity-80"
                                aria-label="Remove image"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                             {isFailState && (
                                <button
                                    onClick={() => onAnalyzeImage(image.id, image.url)}
                                    disabled={analyzingImageId !== null}
                                    className="bg-yellow-500 bg-opacity-90 text-yellow-900 rounded-full p-1.5 transition-colors hover:bg-yellow-400 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    aria-label="Analyze image with AI"
                                    title="Analyze image with AI"
                                >
                                    {analyzingImageId === image.id ? (
                                        <div className="w-4 h-4 border-2 border-yellow-900 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <SparklesIcon className="w-4 h-4" />
                                    )}
                                </button>
                            )}
                         </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ImageUploader;