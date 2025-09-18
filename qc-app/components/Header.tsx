import React from 'react';
import type { UserRole } from '../types';
import { SupervisorIcon, ViewerIcon, AppIcon } from './Icons';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange }) => {
  const activeClass = 'bg-primary text-white';
  const inactiveClass = 'bg-white text-gray-600 hover:bg-gray-200';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center gap-3">
            <AppIcon className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-gray-800 tracking-tight">
              QC Dashboard
            </span>
          </div>
          <div role="radiogroup" aria-label="Switch user role" className="flex items-center space-x-1 bg-gray-200 p-1 rounded-lg">
            <button
              role="radio"
              aria-checked={currentRole === 'supervisor'}
              onClick={() => onRoleChange('supervisor')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${currentRole === 'supervisor' ? activeClass : inactiveClass}`}
            >
              <SupervisorIcon className="w-5 h-5" />
              Supervisor
            </button>
            <button
              role="radio"
              aria-checked={currentRole === 'viewer'}
              onClick={() => onRoleChange('viewer')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${currentRole === 'viewer' ? activeClass : inactiveClass}`}
            >
              <ViewerIcon className="w-5 h-5" />
              Viewer
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;