import React from 'react';
import ReportIssueModal from '../../../components/ReportIssueModal';
import FileCategoryPanel from '../../../components/FileCategoryPanel';

export const ChatModals = ({
  isReportModalOpen,
  setIsReportModalOpen,
  messages,
  selectedMessageIndex,
  showFileCategoryPanel,
  setShowFileCategoryPanel,
  setInputValue
}) => {
  return (
    <>
      {isReportModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <ReportIssueModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            message={messages[selectedMessageIndex]?.content || ''}
          />
        </div>
      )}

      {showFileCategoryPanel && (
        <div className="fixed inset-0 z-[100]">
          <FileCategoryPanel 
            onClose={() => setShowFileCategoryPanel(false)}
            onSelectFile={(file) => {
              setInputValue(`[File] ${file.name}`);
              setShowFileCategoryPanel(false);
            }}
          />
        </div>
      )}
    </>
  );
};
