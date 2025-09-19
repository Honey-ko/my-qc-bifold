import type { Job } from './types';
import { JobStatus, ChecklistStatus } from './types';
import { generateChecklist } from './constants';

const sampleChecklist = generateChecklist();
sampleChecklist[0].status = ChecklistStatus.PASS;
sampleChecklist[1].status = ChecklistStatus.PASS;
sampleChecklist[2].status = ChecklistStatus.FAIL;
sampleChecklist[2].comment = "Incorrect handle colour detected. Handle is chrome, should be matte black.";

export const MOCK_JOBS: Job[] = [
  {
    id: 'mock-1',
    jobNumber: 'BIFOLD-DEMO-1',
    status: JobStatus.IN_PROGRESS,
    checklist: sampleChecklist,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'Offline User',
  },
  {
    id: 'mock-2',
    jobNumber: 'BIFOLD-DEMO-2',
    status: JobStatus.PENDING,
    checklist: generateChecklist(),
    lastUpdated: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedBy: 'Offline User',
  },
  {
    id: 'mock-3',
    jobNumber: 'BIFOLD-DEMO-3',
    status: JobStatus.PASSED,
    checklist: generateChecklist().map(item => ({...item, status: ChecklistStatus.PASS})),
    lastUpdated: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedBy: 'Offline User',
  }
];
