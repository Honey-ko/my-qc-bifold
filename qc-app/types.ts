export enum ChecklistStatus {
  UNCHECKED = 'UNCHECKED',
  PASS = 'PASS',
  FAIL = 'FAIL',
}

export enum JobStatus {
  PENDING = 'Inspection Pending',
  IN_PROGRESS = 'In Progress',
  PASSED = 'QC Passed',
  FAILED = 'QC Failed',
  REWORK = 'Rework Required',
}

export interface ChecklistItemImage {
  id: string;
  url: string;
}

export interface ChecklistItem {
  id: string;
  name: string;
  status: ChecklistStatus;
  comment: string;
  images: ChecklistItemImage[];
  isOptional?: boolean;
}

export interface Job {
  id: string;
  jobNumber: string;
  status: JobStatus;
  checklist: ChecklistItem[];
  lastUpdated: string;
  updatedBy: string;
}

export type UserRole = 'supervisor' | 'viewer';