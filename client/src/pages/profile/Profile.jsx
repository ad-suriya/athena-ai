import React from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from './hooks/useProfile';

const Profile = ({ onBack }) => {
  const navigate = useNavigate();
  const { name, email, memberSince, lastActive, totalChats, memoryEnabled, savingMemory, setMemoryEnabled } = useProfile();
  return (
    <div className="flex-1 p-8">
      <button 
        onClick={() => navigate("/chat")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Return to Chat</span>
      </button>
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Profile</h1>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg border p-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-gray-500" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{name}</h2>
              <p className="text-gray-500">{email}</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Account Information</h3>
              <div className="space-y-2">
                <p className="text-gray-700"><span className="font-medium">Email:</span> {email}</p>
                <p className="text-gray-700"><span className="font-medium">Member since:</span> {memberSince}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Activity</h3>
              <div className="space-y-2">
                <p className="text-gray-700"><span className="font-medium">Last active:</span> {lastActive}</p>
                <p className="text-gray-700"><span className="font-medium">Total chats:</span> {totalChats}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Memory</h3>
              <div className="flex items-start justify-between gap-4">
                <p className="text-gray-700">
                  Athena remembers short summaries of your past conversations, so you can pick up where you left off.
                  Turning this off deletes what Athena remembers.
                </p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={memoryEnabled === true}
                  aria-label="Remember past conversations"
                  disabled={memoryEnabled === null || savingMemory}
                  onClick={() => setMemoryEnabled(!memoryEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${memoryEnabled ? 'bg-brand-500' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${memoryEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;