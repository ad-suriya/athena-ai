import React from 'react';
import { Tooltip } from './ChatUIComponents.jsx';
import { Paperclip, FileText, ImageIcon, Globe, StopCircle, Send, X, Mic } from 'lucide-react';
import ToggleButtons from '../../../components/ToggleButtons';

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
            className="p-2 rounded-full text-[#E14C42] hover:text-[#E14C42]/80 bg-[#F5D9D1] transition-colors"
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
            className="p-2 rounded-full bg-gradient-to-r from-[#E65C52] to-[#E14C42] text-white hover:shadow-lg hover:shadow-[#E65C52]/30 transition-all"
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
          className={`p-2 rounded-full transition-colors ${
            permissionState === 'denied' ? 
              'text-[#E14C42] bg-[#F5D9D1]' :
              'text-[#E65C52] hover:text-[#E14C42] hover:bg-[#F5D9D1]'
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
      className={`w-full ${isAbsolute ? 'max-w-2xl mx-auto' : ''} bg-white border-2 border-[#E65C52]/20 rounded-xl px-4 py-4 shadow-lg hover:shadow-xl hover:shadow-[#E65C52]/10 transition-all relative`}
    >
      {!isAbsolute && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <Tooltip text="Share">
            <button
              type="button"
              className="p-1.5 rounded-md text-[#E65C52] hover:bg-[#F5D9D1] transition-colors"
              onClick={onShareClick}
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
                className="p-1.5 rounded-md text-[#E65C52] hover:bg-[#F5D9D1] transition-colors"
                onClick={() => setActiveAction(activeAction === 'message-options' ? null : 'message-options')}
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
              <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-xl py-1 z-10 border-2 border-[#E65C52]/20 w-40">
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F5D9D1] flex items-center gap-2"
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
                  className="w-full text-left px-4 py-2 text-sm text-[#E14C42] hover:bg-[#F5D9D1] flex items-center gap-2"
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
          className="w-full bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 text-base min-h-[40px] py-2"
          disabled={isLoading}
          autoFocus
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative" ref={attachmentPanelRef}>
              <Tooltip text="Attach files">
                <button
                  type="button"
                  className={`p-2 rounded-lg transition-colors attachment-button ${
                    activeUploadPanel === 'attachment'
                      ? 'text-[#E14C42] bg-[#F5D9D1] border-2 border-[#E65C52]/40 shadow-lg shadow-[#E65C52]/20'
                      : 'text-[#E65C52] hover:text-[#E14C42] hover:bg-[#F5D9D1] hover:border-2 hover:border-[#E65C52]/20'
                  }`}
                  onClick={() => toggleUploadPanel('attachment')}
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </Tooltip>
              {activeUploadPanel === 'attachment' && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border-2 border-[#E65C52]/20 p-2 z-10 w-48">
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#F5D9D1] rounded cursor-pointer">
                      <FileText className="w-4 h-4 text-[#E65C52]" />
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
                    <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-[#F5D9D1] rounded cursor-pointer">
                      <ImageIcon className="w-4 h-4 text-[#E65C52]" />
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
                    className="p-2 rounded-lg text-[#E65C52] hover:text-[#E14C42] hover:bg-[#F5D9D1] transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                  </button>
                </Tooltip>

                {showSearchOptions && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-50 border-2 border-[#E65C52]/20">
                    <div className="p-3 border-b-2 border-[#E65C52]/10 bg-gradient-to-r from-[#F5D9D1]/30 to-white">
                      <h3 className="text-sm font-medium text-[#E14C42]">Search options</h3>
                    </div>
                    <div className="p-2">
                      {searchOptions?.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.id}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-[#F5D9D1] rounded-md flex items-start gap-3 transition-colors"
                            onClick={() => {
                              setActiveAction('search');
                              setInputValue(`[${option.label}] `);
                              setShowSearchOptions(false);
                              if (inputRef && inputRef.current) inputRef.current.focus();
                            }}
                          >
                            <div className="p-1.5 rounded-md bg-[#F5D9D1] text-[#E65C52]">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{option.label}</div>
                              <div className="text-xs text-gray-500">{option.description}</div>
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
