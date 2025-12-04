import React from 'react';
import { FileText, Image, Code, Link, X } from 'lucide-react';

const FileCategoryPanel = ({ onClose, onSelectFile }) => {
  const [activeTab, setActiveTab] = React.useState('all');
  
  const files = {
    all: [
      { name: 'Project_Report.pdf', type: 'document', size: '2.4 MB', date: '2023-05-15' },
      { name: 'Screenshot.png', type: 'image', size: '1.2 MB', date: '2023-05-10' },
      { name: 'index.html', type: 'code', size: '12 KB', date: '2023-05-08' },
      { name: 'styles.css', type: 'code', size: '8 KB', date: '2023-05-08' },
      { name: 'Project_Link.txt', type: 'link', size: '1 KB', date: '2023-05-05' }
    ],
    images: [
      { name: 'Screenshot.png', type: 'image', size: '1.2 MB', date: '2023-05-10' },
      { name: 'Diagram.jpg', type: 'image', size: '3.1 MB', date: '2023-04-28' }
    ],
    code: [
      { name: 'index.html', type: 'code', size: '12 KB', date: '2023-05-08' },
      { name: 'styles.css', type: 'code', size: '8 KB', date: '2023-05-08' },
      { name: 'app.js', type: 'code', size: '24 KB', date: '2023-05-03' }
    ],
    links: [
      { name: 'Project_Link.txt', type: 'link', size: '1 KB', date: '2023-05-05' },
      { name: 'Reference_URL.txt', type: 'link', size: '1 KB', date: '2023-04-30' }
    ]
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'image': return <Image className="w-5 h-5 text-blue-500" />;
      case 'code': return <Code className="w-5 h-5 text-purple-500" />;
      case 'link': return <Link className="w-5 h-5 text-green-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFileClick = (file, e) => {
    e.stopPropagation();
    onSelectFile && onSelectFile(file);
    onClose();
  };

  const handleTabClick = (tab, e) => {
    e.stopPropagation();
    setActiveTab(tab);
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  const handleSelectClick = (file, e) => {
    e.stopPropagation();
    onSelectFile && onSelectFile(file);
    onClose();
  };

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[100] bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col"
        onClick={handleModalContentClick}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Files</h2>
          <button
            onClick={handleCloseClick}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            type="button"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex px-6 -mb-px space-x-8">
            <button
              onClick={(e) => handleTabClick('all', e)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              type="button"
            >
              <FileText className="w-4 h-4" />
              All Documents
            </button>
            <button
              onClick={(e) => handleTabClick('images', e)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'images'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              type="button"
            >
              <Image className="w-4 h-4" />
              Images
            </button>
            <button
              onClick={(e) => handleTabClick('code', e)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'code'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              type="button"
            >
              <Code className="w-4 h-4" />
              Code files
            </button>
            <button
              onClick={(e) => handleTabClick('links', e)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'links'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              type="button"
            >
              <Link className="w-4 h-4" />
              Links
            </button>
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {files[activeTab].length > 0 ? (
            <div className="space-y-4">
              {files[activeTab].map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => handleFileClick(file, e)}
                >
                  <div className="flex-shrink-0 mr-4">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.size} • {file.date}</p>
                  </div>
                  <button 
                    className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-500"
                    onClick={(e) => handleSelectClick(file, e)}
                    type="button"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
              <p className="mt-1 text-sm text-gray-500">Upload files to see them here</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            onClick={handleCloseClick}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default FileCategoryPanel;