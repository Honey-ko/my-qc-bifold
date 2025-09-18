import React from 'react';
import type { Job } from '../types';
import Checklist from './Checklist';

interface JobDetailsViewProps {
    job: Job;
    isViewer: boolean;
    onBack: () => void;
    onFinalize: () => void;
}

const JobDetailsView: React.FC<JobDetailsViewProps> = ({ job, isViewer, onBack, onFinalize }) => {
    return (
        <div>
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to All Jobs
                </button>
            </div>
            <Checklist job={job} isViewer={isViewer} onFinalize={onFinalize} />
        </div>
    );
};

export default JobDetailsView;