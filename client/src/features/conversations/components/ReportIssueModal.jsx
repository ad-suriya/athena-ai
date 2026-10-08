import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

const ReportIssueModal = ({ isOpen, onClose }) => {
  const [selectedType, setSelectedType] = useState('');
  const [feedback, setFeedback] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const reportTypes = [
    'Bug Report',
    'Feature Request', 
    'Performance Issue',
    'Content Issue',
    'Other'
  ];

  const handleSubmit = () => {
    if (selectedType && feedback.trim()) {
      console.log('Report submitted:', { type: selectedType, feedback });
      onClose(); // Close the modal by calling the parent's onClose function
    } else {
      alert('Please select a report type and provide feedback.');
    }
  };

  const handleCancel = () => {
    onClose(); // Close the modal by calling the parent's onClose function
  };

  if (!isOpen) return null; // Render nothing if not open

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Report an issue</h2>
          <button 
            onClick={handleCancel}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Feedback type
            </label>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full px-4 py-3 text-left bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <span className={selectedType ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedType || 'Select report type'}
                </span>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </button>
              
              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                  {reportTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedType(type);
                        setDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors"
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Feedback Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Your feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Please describe any issues or feedback you have for Yudle."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              rows={6}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100">
          <button
            onClick={handleCancel}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportIssueModal;