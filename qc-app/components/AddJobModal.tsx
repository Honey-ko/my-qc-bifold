import React, { useState, useEffect } from 'react';

interface AddJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (jobNumber: string) => void;
}

const AddJobModal: React.FC<AddJobModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [jobNumber, setJobNumber] = useState('');

    useEffect(() => {
        if (isOpen) {
            setJobNumber(''); // Reset on open
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (jobNumber.trim()) {
            onSubmit(jobNumber.trim());
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-job-modal-title"
        >
            <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-md"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                <div className="p-6">
                    <h2 id="add-job-modal-title" className="text-xl font-bold text-gray-900 mb-4">
                        Add New Job
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="job-number" className="block text-sm font-medium text-gray-700">
                                Job Number
                            </label>
                            <input
                                type="text"
                                id="job-number"
                                value={jobNumber}
                                onChange={(e) => setJobNumber(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="e.g., BIFOLD-999"
                                autoFocus
                            />
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                Add Job
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddJobModal;