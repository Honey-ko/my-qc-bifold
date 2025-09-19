import React from 'react';

const ConfigWarningBanner: React.FC = () => {
  return (
    <div className="bg-yellow-400 text-yellow-900 text-sm font-semibold text-center p-2 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p>
          <strong>Offline Mode:</strong> Supabase is not configured. Your data will not be saved. 
          Set <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code> env variables for full functionality.
        </p>
      </div>
    </div>
  );
};

export default ConfigWarningBanner;