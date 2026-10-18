import React from 'react';
import SideBar from 'C:/Yudle-Platform/client/src/components/SideBar.jsx';

const Notification = () => {
  return (
    <div className="flex">
      <SideBar />
      <div className="p-4">
        <h2 className="text-xl font-bold">Notifications</h2>
        <div className="mt-4">
          <div className="bg-gray-100 p-3 rounded-lg mb-2">
            <p className="text-sm">Jun 18, 2025</p>
            <p className="text-gray-700">Summary of AI Industry News</p>
            <button className="text-blue-500 text-xs mt-1">View Details</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;