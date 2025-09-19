
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import type { Job } from '../types';
import { JobStatus } from '../types';
import { generateChecklist } from '../constants';
import { supabase } from '../lib/supabase';

interface JobContextType {
  jobs: Job[];
  getJobById: (id: string) => Job | undefined;
  updateJob: (updatedJob: Job) => Promise<void>;
  addJob: (jobNumber: string) => Promise<Job | null>;
  isLoading: boolean;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    const { data, error } = await supabase.from('jobs').select('*').order('lastUpdated', { ascending: false });
    if (error) {
      console.error('Error fetching jobs:', error.message || JSON.stringify(error));
      // In a real app, you might want to show a user-facing error message here
    } else {
      setJobs(data as Job[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();

    const channel = supabase
    .channel('realtime-jobs')
    .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        (payload) => {
        console.log('Change received!', payload);
        fetchJobs(); // Refetch all jobs on any change
        }
    )
    .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [fetchJobs]);

  const getJobById = useCallback((id: string) => {
    return jobs.find(job => job.id === id);
  }, [jobs]);

  const updateJob = useCallback(async (updatedJob: Job) => {
    const { error } = await supabase
      .from('jobs')
      .update(updatedJob)
      .eq('id', updatedJob.id);
    if (error) {
      console.error('Error updating job:', error.message || JSON.stringify(error));
    }
  }, []);

  const addJob = useCallback(async (jobNumber: string): Promise<Job | null> => {
    const { data: existingJobs, error: selectError } = await supabase
    .from('jobs')
    .select('id')
    .eq('jobNumber', jobNumber);

    if (selectError) {
    console.error('Error checking for duplicate job number:', selectError.message || JSON.stringify(selectError));
    return null;
    }

    if (existingJobs && existingJobs.length > 0) {
    alert('A job with this number already exists.');
    return null;
    }

    const newJobData = {
        jobNumber,
        status: JobStatus.PENDING,
        checklist: generateChecklist(),
        lastUpdated: new Date().toISOString(),
        updatedBy: 'System',
    };

    const { data, error } = await supabase
        .from('jobs')
        .insert(newJobData)
        .select();

    if (error) {
        console.error('Error adding job:', error.message || JSON.stringify(error));
        return null;
    }
    
    return data ? data[0] as Job : null;
  }, []);

  return (
    <JobContext.Provider value={{ jobs, getJobById, updateJob, addJob, isLoading }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = (): JobContextType => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};
