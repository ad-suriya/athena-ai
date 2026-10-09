import PropTypes from 'prop-types';
import { Tooltip } from './ChatUIComponents.jsx';
import { Paperclip, FileText, ImageIcon, Globe, StopCircle, Send, X, Mic, Copy, Check } from 'lucide-react';
import { ATTACHMENT_ACCEPT, MAX_ATTACHMENTS } from '../utils/attachments';

const formatSize = (bytes) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

const ChatInputForm = ({
  handleSubmit,
  inputRef,
  inputValue,
  setInputValue,
  isLoading,
  attachmentPanelRef,
  handleFilesUpload,
  attachments = [],
  removeAttachment,
  attachmentError,
  searchOn,
  toggleSearch,
  setActiveAction,
  isRecording,
  stopRecording,
  permissionState,
  requestPermissionAgain,
  toggleRecording,
  isAbsolute = false,
  onCopyChat,
  chatCopied,
  activeAction,
  onArchive,
  onDelete,
}) => {
  const renderInputButton = () => {
    if (isRecording) {
      return (
        <Tooltip text="Stop recording">
          <button
            type="button"
            onClick={stopRecording}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-600 transition-colors hover:bg-brand-200"
          >
            <StopCircle className="w-5 h-5" />
          </button>
        </Tooltip>
      );
    }

    if (inputValue.trim()) {
      return (
        <Tooltip text="Send message">
          <button
            type="submit"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white shadow-[0_6px_16px_rgba(230,92,82,0.35)] transition-colors hover:bg-brand-600"
          >
            <Send className="w-5 h-5" />
          </button>
        </Tooltip>
      );
    }

    return (
      <Tooltip text={permissionState === 'denied' ? 
        "Microphone blocked - click to manage permissions" : 
        "Voice input"}>
        <button
          type="button"
          onClick={permissionState === 'denied' ? requestPermissionAgain : toggleRecording}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
            permissionState === 'denied' ?
              'bg-brand-100 text-brand-600' :
              'bg-[#F3F1F1] text-ink hover:bg-brand-50'
          }`}
        >
          {permissionState === 'denied' ? (
            <X className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
      </Tooltip>
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative w-full ${isAbsolute ? 'mx-auto max-w-2xl' : ''} rounded-2xl border border-line bg-white px-4 py-4 shadow-card transition-shadow focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100`}
    >
      {!isAbsolute && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <Tooltip text={chatCopied ? 'Copied' : 'Copy chat'}>
            <button
              type="button"
              className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-500"
              onClick={onCopyChat}
              aria-label={chatCopied ? 'Conversation copied' : 'Copy conversation'}
            >
              {chatCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </Tooltip>

          <div className="relative">
            <Tooltip text="More options">
              <button
                type="button"
                className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-500"
                onClick={() => setActiveAction(activeAction === 'message-options' ? null : 'message-options')}
                aria-label="Conversation options"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
              </button>
            </Tooltip>

            {activeAction === 'message-options' && (
              <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-2xl border border-line bg-white p-1.5 shadow-card">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-ink hover:bg-brand-50"
                  onClick={onArchive}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="10" x2="15" y2="10"></line>
                    <line x1="9" y1="14" x2="15" y2="14"></line>
                  </svg>
                  <span>Archive</span>
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-brand-600 hover:bg-brand-50"
                  onClick={onDelete}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask anything..."
          className="min-h-[40px] w-full bg-transparent px-1 py-2 pr-16 text-[16px] text-ink placeholder:text-ink-faint focus:outline-none"
          aria-label="Message Athena"
          disabled={isLoading}
          autoFocus
        />

        {(attachments.length > 0 || attachmentError) && (
          <div className="flex flex-wrap items-center gap-2" aria-label="Attachments">
            {attachments.map((file, index) => (
              <span key={`${file.name}-${index}`} className="flex max-w-[16rem] items-center gap-1.5 rounded-lg border border-line bg-[#FFFAF9] py-1 pl-2 pr-1 text-xs text-ink">
                {file.mimeType.startsWith('image/') ? <ImageIcon className="h-3.5 w-3.5 shrink-0 text-brand-500" /> : <FileText className="h-3.5 w-3.5 shrink-0 text-brand-500" />}
                <span className="truncate">{file.name}</span>
                <span className="shrink-0 text-ink-faint">{formatSize(file.size)}</span>
                <button type="button" onClick={() => removeAttachment(index)} className="rounded p-0.5 text-ink-faint hover:bg-brand-50 hover:text-brand-500" aria-label={`Remove ${file.name}`}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            {attachmentError && <span className="text-xs text-brand-700" role="alert">{attachmentError}</span>}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div ref={attachmentPanelRef}>
              <Tooltip text="Attach images, PDFs or text files">
                <label
                  className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors attachment-button ${
                    attachments.length >= MAX_ATTACHMENTS
                      ? 'cursor-not-allowed bg-[#F3F1F1] text-ink-faint'
                      : 'bg-[#F3F1F1] text-ink-muted hover:bg-brand-50 hover:text-brand-500'
                  }`}
                  aria-label="Attach files"
                >
                  <Paperclip className="w-5 h-5" />
                  <input
                    type="file"
                    className="hidden"
                    accept={ATTACHMENT_ACCEPT}
                    multiple
                    disabled={attachments.length >= MAX_ATTACHMENTS || isLoading}
                    onChange={(e) => {
                      handleFilesUpload(e.target.files);
                      e.target.value = ''; // allow picking the same file again
                    }}
                    data-testid="attach-input"
                  />
                </label>
              </Tooltip>
            </div>

            <Tooltip text={searchOn ? 'Web search is on for this message' : 'Search the web for this message'}>
              <button
                type="button"
                onClick={toggleSearch}
                aria-pressed={searchOn}
                className={`flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors ${
                  searchOn ? 'bg-brand-500 text-white' : 'bg-[#F3F1F1] text-ink-muted hover:bg-brand-50 hover:text-brand-500'
                }`}
              >
                <Globe className="h-4 w-4" />
                Search
              </button>
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            {renderInputButton()}
          </div>
        </div>
      </div>
    </form>
  );
};

ChatInputForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  inputRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
  inputValue: PropTypes.string.isRequired,
  setInputValue: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  attachmentPanelRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
  handleFilesUpload: PropTypes.func.isRequired,
  attachments: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    mimeType: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
  })),
  removeAttachment: PropTypes.func.isRequired,
  attachmentError: PropTypes.string,
  searchOn: PropTypes.bool,
  toggleSearch: PropTypes.func.isRequired,
  setActiveAction: PropTypes.func.isRequired,
  isRecording: PropTypes.bool,
  stopRecording: PropTypes.func,
  permissionState: PropTypes.string,
  requestPermissionAgain: PropTypes.func,
  toggleRecording: PropTypes.func,
  isAbsolute: PropTypes.bool,
  onCopyChat: PropTypes.func,
  chatCopied: PropTypes.bool,
  activeAction: PropTypes.string,
  onArchive: PropTypes.func,
  onDelete: PropTypes.func,
};

export default ChatInputForm;
