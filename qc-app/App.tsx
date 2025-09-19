
import React, { useState, useMemo } from 'react';
import type { UserRole } from './types';
import { JobProvider, useJobs } from './context/JobContext';
import Header from './components/Header';
import JobListView from './components/JobListView';
import JobDetailsView from './components/JobDetailsView';

const AppContent: React.FC = () => {
  const [role, setRole] = useState<UserRole>('supervisor');
  const [currentView, setCurrentView] = useState<'list' | 'details'>('list');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const { getJobById, addJob, isLoading } = useJobs();

  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setCurrentView('details');
  };

  const handleAddNewJob = async (jobNumber: string) => {
    if (!jobNumber || !jobNumber.trim()) {
      alert('Job number cannot be empty.');
      return;
    }
    const newJob = await addJob(jobNumber.trim());
    if (newJob) {
        handleSelectJob(newJob.id);
    }
  };

  const handleBackToList = () => {
    setSelectedJobId(null);
    setCurrentView('list');
  };

  const selectedJob = useMemo(() => {
    return selectedJobId ? getJobById(selectedJobId) : null;
  }, [selectedJobId, getJobById]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-semibold text-gray-700">Loading Jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <Header currentRole={role} onRoleChange={setRole} />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {currentView === 'list' && (
            <JobListView onSelectJob={handleSelectJob} onAddNewJob={handleAddNewJob} />
          )}
          {currentView === 'details' && selectedJob && (
            <JobDetailsView 
                job={selectedJob} 
                isViewer={role === 'viewer'}
                onBack={handleBackToList}
                onFinalize={handleBackToList}
            />
          )}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
    return (
        <JobProvider>
            <AppContent />
        </JobProvider>
    )
}

export default App;
