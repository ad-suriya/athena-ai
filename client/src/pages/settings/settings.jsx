import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="flex-1 p-8">
      <button 
        onClick={handleGoBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>return to Chat</span>
      </button>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Settings</h1>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-lg border p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-medium mb-2">Account Settings</h2>
              <p className="text-gray-600">Manage your account preferences</p>
            </div>
            
            <div>
              <h2 className="text-xl font-medium mb-2">Notifications</h2>
              <p className="text-gray-600">Configure your notification settings</p>
            </div>
            
            <div>
              <h2 className="text-xl font-medium mb-2">Privacy</h2>
              <p className="text-gray-600">Control your privacy settings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;