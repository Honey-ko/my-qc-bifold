import React, { useMemo } from 'react';
import type { Job, ChecklistItem as ChecklistItemType, JobStatus } from '../types';
import { useJobs } from '../context/JobContext';
import ChecklistItem from './ChecklistItem';
import { JobStatus as JobStatusEnum, ChecklistStatus } from '../types';

interface ChecklistProps {
  job: Job;
  isViewer: boolean;
  updated?: boolean;
  onFinalize: () => void;
}

const Checklist: React.FC<ChecklistProps> = ({ job, isViewer, updated, onFinalize }) => {
  const { updateJob } = useJobs();

  const handleItemUpdate = (updatedItem: ChecklistItemType) => {
    const updatedChecklist = job.checklist.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    );
    updateJob({
      ...job,
      checklist: updatedChecklist,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Supervisor A',
    });
  };

  const handleFinalize = () => {
    const mandatoryItems = job.checklist.filter(item => !item.isOptional);
    const hasFail = mandatoryItems.some(item => item.status === ChecklistStatus.FAIL);
    const allPass = mandatoryItems.length > 0 && mandatoryItems.every(item => item.status === ChecklistStatus.PASS);

    let newStatus: JobStatus;
    if (hasFail) {
        newStatus = JobStatusEnum.REWORK;
    } else if (allPass) {
        newStatus = JobStatusEnum.PASSED;
    } else {
        newStatus = JobStatusEnum.IN_PROGRESS;
    }

    updateJob({
      ...job,
      status: newStatus,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Supervisor A',
    });

    onFinalize();
  };
  
  const statusInfo = useMemo(() => {
    switch (job.status) {
      case JobStatusEnum.PASSED: return { class: 'bg-success-light text-success-text', label: 'QC Passed' };
      case JobStatusEnum.FAILED: return { class: 'bg-danger-light text-danger-text', label: 'QC Failed' };
      case JobStatusEnum.REWORK: return { class: 'bg-warning-light text-warning-text', label: 'Rework Required' };
      case JobStatusEnum.IN_PROGRESS: return { class: 'bg-primary-light text-primary-text', label: 'In Progress' };
      case JobStatusEnum.PENDING: return { class: 'bg-secondary-light text-secondary-text', label: 'Inspection Pending' };
      default: return { class: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    }
  }, [job.status]);

  return (
    <div className={`bg-white rounded-xl shadow-lg transition-all duration-500 transform ${updated ? 'scale-[1.01] shadow-2xl' : 'scale-100'}`}>
        <div className={`p-6 border-b border-gray-200 transition-colors duration-500 ${updated ? 'bg-yellow-50' : ''}`}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{job.jobNumber}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Last updated by {job.updatedBy} on {new Date(job.lastUpdated).toLocaleString()}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                     <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.class}`}>
                        {statusInfo.label}
                    </span>
                </div>
            </div>
        </div>

      <div className="p-4 sm:p-6 space-y-3 bg-gray-50/50">
        {job.checklist.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            onUpdate={handleItemUpdate}
            isViewer={isViewer}
            jobId={job.id}
          />
        ))}
      </div>
      {!isViewer && (
        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <button 
                onClick={handleFinalize}
                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary text-base">
                Finalize and Submit Report
            </button>
        </div>
      )}
    </div>
  );
};

export default Checklist;