import React from 'react';
import type { ChecklistItemImage } from '../types';
import { TrashIcon } from './Icons';

interface ImageUploaderProps {
    images: ChecklistItemImage[];
    onRemoveImage: (id: string, url: string) => void;
    isViewer: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onRemoveImage, isViewer }) => {
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
                         <button
                            onClick={() => onRemoveImage(image.id, image.url)}
                            className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                            aria-label="Remove image"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ImageUploader;