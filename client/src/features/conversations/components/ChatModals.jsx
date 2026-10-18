import PropTypes from 'prop-types';
import ReportIssueModal from './ReportIssueModal';
import FileCategoryPanel from './FileCategoryPanel';

export const ChatModals = ({
  isReportModalOpen,
  setIsReportModalOpen,
  messages,
  conversationId,
  selectedMessageIndex,
  showFileCategoryPanel,
  setShowFileCategoryPanel,
  setInputValue
}) => {
  return (
    <>
      {isReportModalOpen && (
        <ReportIssueModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          conversationId={conversationId}
          messageId={messages[selectedMessageIndex]?.id}
        />
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

ChatModals.propTypes = {
  isReportModalOpen: PropTypes.bool.isRequired,
  setIsReportModalOpen: PropTypes.func.isRequired,
  messages: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, content: PropTypes.string })).isRequired,
  conversationId: PropTypes.string,
  selectedMessageIndex: PropTypes.number,
  showFileCategoryPanel: PropTypes.bool.isRequired,
  setShowFileCategoryPanel: PropTypes.func.isRequired,
  setInputValue: PropTypes.func.isRequired,
};
