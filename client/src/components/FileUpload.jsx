import { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, File, Check } from 'lucide-react';

const FileUpload = ({ onFilesSelected, type = 'file' }) => {
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types for images
    if (type === 'image') {
      const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        alert('Please select only image files (JPEG, PNG, GIF, etc.)');
        return;
      }
    }

    setSelectedFiles(files);
    setUploadComplete(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current.value = ''; // Reset to allow selecting same file again
    fileInputRef.current.click();
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    
    // Remove progress for deleted file
    const newProgress = {...uploadProgress};
    delete newProgress[index];
    setUploadProgress(newProgress);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    // Simulate file upload progress
    const uploadSimulation = selectedFiles.map((file, index) => {
      return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 10;
          if (progress >= 100) {
            clearInterval(interval);
            setUploadProgress(prev => ({ ...prev, [index]: 100 }));
            resolve();
          } else {
            setUploadProgress(prev => ({ ...prev, [index]: progress }));
          }
        }, 200);
      });
    });

    await Promise.all(uploadSimulation);
    setUploadComplete(true);
    onFilesSelected(selectedFiles);
    
    // Reset after 2 seconds
    setTimeout(() => {
      setSelectedFiles([]);
      setUploadProgress({});
      setUploadComplete(false);
    }, 2000);
  };

  const getFileIcon = (file) => {
    if (type === 'image') {
      return (
        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
          <ImageIcon className="w-4 h-4 text-gray-500" />
        </div>
      );
    }

    const extension = file.name.split('.').pop().toLowerCase();
    return (
      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
        <File className="w-4 h-4 text-gray-500" />
        <span className="text-xs text-gray-500 ml-1">{extension}</span>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={type === 'image' ? 'image/*' : '*'}
        multiple
      />
      
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={triggerFileInput}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          {type === 'image' ? <ImageIcon className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
          {type === 'image' ? 'Select Images' : 'Select Files'}
        </button>

        {selectedFiles.length > 0 && !uploadComplete && (
          <button
            type="button"
            onClick={handleUpload}
            className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'}
          </button>
        )}

        {uploadComplete && (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <Check className="w-4 h-4" />
            <span>Uploaded!</span>
          </div>
        )}
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                    {uploadProgress[index] !== undefined && ` • ${Math.round(uploadProgress[index])}%`}
                  </p>
                </div>
              </div>
              
              {uploadProgress[index] === 100 ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  disabled={uploadProgress[index] !== undefined}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-1">
        {type === 'image' 
          ? 'Supports JPG, PNG, GIF up to 10MB' 
          : 'Supports all file types up to 50MB'}
      </p>
    </div>
  );
};

export default FileUpload;