import type { ChecklistItem } from './types';
import { ChecklistStatus } from './types';

export const CHECKLIST_TEMPLATE: { id: string; name: string; isOptional?: boolean; }[] = [
    { id: 'configuration', name: 'Configuration' },
    { id: 'opening-direction', name: 'Opening Direction' },
    { id: 'colour', name: 'Colour' },
    { id: 'handle-colour', name: 'Handle Colour' },
    { id: 'cill', name: 'Cill' },
    { id: 'cill-end-caps', name: 'Cill End Caps' },
    { id: 'threshold', name: 'Threshold' },
    { id: 'drainage', name: 'Drainage' },
    { id: 'trickle-vents', name: 'Trickle Vents' },
    { id: 'kitform', name: 'Kitform (if requested)', isOptional: true },
    { id: 'kitform-hardware', name: 'Kitform Hardware', isOptional: true },
    { id: 'door-master-work', name: 'Door Master Work' },
    { id: 'bifold-smooth-operation', name: 'Bifold Smooth Operation' },
    { id: 'frame-joints-alignment', name: 'Frame Joints Alignment' },
    { id: 'sash-joints-alignment', name: 'Sash Joints Alignment' },
    { id: 'panel-alignment', name: 'Panel Alignment / Consistent Gaps' },
    { id: 'magnets', name: 'Magnets' },
    { id: 'overall-finish', name: 'Overall Finish (Scratches / Dents / Marks)' },
];

export const generateChecklist = (): ChecklistItem[] => {
  return CHECKLIST_TEMPLATE.map(item => ({
    ...item,
    status: ChecklistStatus.UNCHECKED,
    comment: '',
    images: [],
  }));
};