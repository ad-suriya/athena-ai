import React from 'react';
import { Tooltip } from './ChatUIComponents.jsx';
import { Paperclip, FileText, ImageIcon, Globe, StopCircle, Send, X, Mic } from 'lucide-react';
import ToggleButtons from './ToggleButtons';

const ChatInputForm = ({
  handleSubmit,
  inputRef,
  inputValue,
  setInputValue,
  isLoading,
  attachmentPanelRef,
  activeUploadPanel,
  toggleUploadPanel,
  handleFilesUpload,
  handleImagesUpload,
  setActiveUploadPanel,
  setActiveMode,
  modelDropdownRef,
  showSearchOptions,
  setShowSearchOptions,
  searchOptions,
  setActiveAction,
  isRecording,
  stopRecording,
  permissionState,
  requestPermissionAgain,
  toggleRecording,
  isAbsolute = false,
  onShareClick,
  activeAction,
  currentConversationId,
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
          <Tooltip text="Share">
            <button
              type="button"
              className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-brand-50 hover:text-brand-500"
              onClick={onShareClick}
              aria-label="Share"
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
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
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

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="relative" ref={attachmentPanelRef}>
              <Tooltip text="Attach files">
                <button
                  type="button"
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors attachment-button ${
                    activeUploadPanel === 'attachment'
                      ? 'bg-brand-100 text-brand-600'
                      : 'bg-[#F3F1F1] text-ink-muted hover:bg-brand-50 hover:text-brand-500'
                  }`}
                  aria-label="Attach files"
                  onClick={() => toggleUploadPanel('attachment')}
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </Tooltip>
              {activeUploadPanel === 'attachment' && (
                <div className="absolute bottom-full left-0 z-10 mb-2 w-48 rounded-2xl border border-line bg-white p-1.5 shadow-card">
                  <div className="flex flex-col gap-1">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink hover:bg-brand-50">
                      <FileText className="h-4 w-4 text-brand-500" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          handleFilesUpload(e.target.files);
                          setActiveUploadPanel(null);
                        }}
                        multiple
                      />
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink hover:bg-brand-50">
                      <ImageIcon className="h-4 w-4 text-brand-500" />
                      <span>Upload Image</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          handleImagesUpload(e.target.files);
                          setActiveUploadPanel(null);
                        }}
                        multiple
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            <ToggleButtons onModeChange={setActiveMode} />
          </div>

          <div className="flex items-center gap-2">
            {isAbsolute && (
              <div className="relative" ref={modelDropdownRef}>
                <Tooltip text="Search options">
                  <button
                    type="button"
                    onClick={() => setShowSearchOptions(!showSearchOptions)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F1F1] text-ink transition-colors hover:bg-brand-50"
                    aria-label="Search options"
                  >
                    <Globe className="w-5 h-5" />
                  </button>
                </Tooltip>

                {showSearchOptions && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-line bg-white shadow-card">
                    <div className="border-b border-line px-4 py-3">
                      <h3 className="text-sm font-semibold text-ink">Search options</h3>
                    </div>
                    <div className="p-2">
                      {searchOptions?.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.id}
                            className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-brand-50"
                            onClick={() => {
                              setActiveAction('search');
                              setInputValue(`[${option.label}] `);
                              setShowSearchOptions(false);
                              if (inputRef && inputRef.current) inputRef.current.focus();
                            }}
                          >
                            <div className="rounded-lg bg-brand-50 p-1.5 text-brand-500">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-ink">{option.label}</div>
                              <div className="text-xs text-ink-faint">{option.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {renderInputButton()}
          </div>
        </div>
      </div>
    </form>
  );
};

export default ChatInputForm;
