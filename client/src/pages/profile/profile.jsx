import React from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = ({ onBack }) => {
  const navigate = useNavigate();
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
              <h2 className="text-2xl font-semibold">Sai</h2>
              <p className="text-gray-500">Administrator</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Account Information</h3>
              <div className="space-y-2">
                <p className="text-gray-700"><span className="font-medium">Email:</span> sai@example.com</p>
                <p className="text-gray-700"><span className="font-medium">Member since:</span> January 2023</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Activity</h3>
              <div className="space-y-2">
                <p className="text-gray-700"><span className="font-medium">Last active:</span> 2 hours ago</p>
                <p className="text-gray-700"><span className="font-medium">Total chats:</span> 142</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;