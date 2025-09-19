import React, { useState, useMemo } from 'react';
import { useJobs } from '../context/JobContext';
import { JobStatus, ChecklistStatus, Job } from '../types';
import AddJobModal from './AddJobModal';

interface JobCardProps {
    job: Job;
    onSelectJob: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onSelectJob }) => {
    const { total, checked } = useMemo(() => {
        const total = job.checklist.length;
        const checked = job.checklist.filter(item => item.status !== ChecklistStatus.UNCHECKED).length;
        return { total, checked };
    }, [job.checklist]);

    const progress = total > 0 ? (checked / total) * 100 : 0;

    const statusInfo = useMemo(() => {
        switch (job.status) {
            case JobStatus.PASSED: return { class: 'bg-success-light text-success-text', label: 'QC Passed' };
            case JobStatus.FAILED: return { class: 'bg-danger-light text-danger-text', label: 'QC Failed' };
            case JobStatus.REWORK: return { class: 'bg-warning-light text-warning-text', label: 'Rework Required' };
            case JobStatus.IN_PROGRESS: return { class: 'bg-primary-light text-primary-text', label: 'In Progress' };
            case JobStatus.PENDING: return { class: 'bg-secondary-light text-secondary-text', label: 'Pending' };
            default: return { class: 'bg-gray-100 text-gray-800', label: 'Unknown' };
        }
    }, [job.status]);

    return (
        <button 
            onClick={() => onSelectJob(job.id)} 
            className="w-full text-left bg-white p-5 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
            <div className="flex justify-between items-start">
                <span className="font-bold text-lg text-gray-800">{job.jobNumber}</span>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusInfo.class}`}>{statusInfo.label}</span>
            </div>
            <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-500">Progress</span>
                    <span className="text-xs font-medium text-gray-500">{checked} / {total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            <div className="mt-4 border-t border-gray-100 pt-3">
                 <p className="text-xs text-gray-400">
                    Last update: {new Date(job.lastUpdated).toLocaleDateString()}
                </p>
            </div>
        </button>
    );
};

interface JobListViewProps {
    onSelectJob: (jobId: string) => void;
    onAddNewJob: (jobNumber: string) => void;
}

const JobListView: React.FC<JobListViewProps> = ({ onSelectJob, onAddNewJob }) => {
    const { jobs } = useJobs();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredJobs = useMemo(() => {
        return jobs
            .filter(job => job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    }, [jobs, searchTerm]);

    const handleAddNewJobSubmit = (jobNumber: string) => {
        onAddNewJob(jobNumber);
        setIsModalOpen(false);
    }

    return (
        <div className="relative">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                 <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    All Jobs
                </h1>
                <div className="w-full sm:w-auto">
                    <label htmlFor="job-search" className="sr-only">Search jobs by number</label>
                    <input
                        id="job-search"
                        type="text"
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
                    />
                </div>
            </div>

            {filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredJobs.map(job => (
                        <JobCard key={job.id} job={job} onSelectJob={onSelectJob} />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800">No jobs found</h3>
                    <p className="mt-1 text-gray-500">
                        No jobs match your search term, or no jobs have been created yet.
                    </p>
                 </div>
            )}
            
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary-hover transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                aria-label="Add new job"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </button>
            <AddJobModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddNewJobSubmit}
            />
        </div>
    );
};

export default JobListView;