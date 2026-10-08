import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo-07.png'; // Importing your logo

export default function YudleFeedbackForm() {
  const [issueType, setIssueType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [email, setEmail] = useState('adsuriya0707@gmail.com');

  const issueTypes = [
    'Bug Report',
    'Feature Request',
    'Performance Issue',
    'User Interface Problem',
    'Documentation Issue',
    'Other',
  ];

  const handleSubmit = () => {
    console.log('Feedback submitted:', { issueType, issueDescription, email });
    alert('Thank you for your feedback!');
  };

  return (
    <div className="bg-gray-50 overflow-y-auto h-screen">
      {/* Fixed Header with Logo */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10">
        <div className="px-8 py-4">
          <div className="flex items-center">
            <Link to="/chat">
              <img
                src={logo}
                alt="Yudle Logo"
                className="w-8 h-8 rounded object-contain"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="min-h-screen pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Form Header */}
            <div className="px-8 py-8 border-b border-gray-100">
              <h1 className="text-3xl font-semibold text-gray-800">Feedback</h1>
            </div>

            {/* Form Content */}
            <div className="px-8 py-8">
              {/* Issue Type */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue type
                </label>
                <div className="relative">
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="">Please select an issue type</option>
                    {issueTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Issue Description */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue description
                </label>
                <div className="relative">
                  <textarea
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="Please tell us what you were trying to do, what unexpected behavior you noticed, and whether you saw any error messages along the way."
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <button
                    type="button"
                    className="absolute bottom-4 left-4 w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-8 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Send
              </button>

              {/* Contact Info (Always Open) */}
              <div className="mt-8 pt-4 border-t border-gray-100">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Contact us</h3>
                <p className="text-sm text-gray-600 mb-2">
                  You can also contact us via email.
                </p>
                <a
                  href="mailto:support@yudle.im"
                  className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                >
                  support@yudle.im
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}