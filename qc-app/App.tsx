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

  const { getJobById, addJob } = useJobs();

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