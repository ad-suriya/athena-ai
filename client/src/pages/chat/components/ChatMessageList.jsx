import React from 'react';
import { Tooltip } from './ChatUIComponents.jsx';
import CopyButton1 from '../../../components/CopyButton1.jsx';
import { Edit, MoreVertical } from 'lucide-react';
import MessageEditor from '../../../components/MessageEditor';
import CopyButton from '../../../components/CopyButton';
import ReadAloudButton from '../../../components/ReadAloudButton.jsx';

const ChatMessageList = ({
  messages,
  formatMessageContent,
  extractUrls,
  linkPreviews,
  editingMessageId,
  handleEditMessage,
  handleSaveEdit,
  handleCancelEdit,
  handleRegenerate,
  messageRatings,
  handleRateMessage,
  activeAction,
  setActiveAction,
  handleReportIssue,
  exportToPDF,
  isLoading,
  messagesEndRef,
}) => {
  return (
    <>
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex animate-fade duration-300 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-full md:max-w-4xl rounded-2xl ${
              message.role === 'user'
                ? 'bg-gradient-to-r from-[#E65C52] to-[#E14C42] text-white p-3 md:p-5 shadow-lg'
                : 'bg-white border-2 border-[#E65C52]/20 shadow-md p-3 md:p-5 relative'
            }`}
          >
            {message.role === 'user' ? (
              <div className="flex flex-col gap-3">
                <div className="text-sm whitespace-pre-wrap">
                  {formatMessageContent(message.content)}
                </div>
                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-white/20">
                  <Tooltip text="Copy">
                    <CopyButton1
                      text={message.content}
                      onCopy={() =>
                        console.log('Copy clicked for user message index:', index)
                      }
                    />
                  </Tooltip>
                  <Tooltip text="Edit">
                    <button
                      className={`p-1.5 rounded-md transition-colors ${
                        editingMessageId === index
                          ? 'text-white bg-white/20'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                      onClick={() => {
                        console.log('Edit clicked for user message index:', index);
                        handleEditMessage(index);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </Tooltip>
                </div>
                {editingMessageId === index && (
                  <div className="mt-4">
                    <MessageEditor
                      content={message.content}
                      onSave={(newContent) => handleSaveEdit(index, newContent)}
                      onCancel={handleCancelEdit}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 pr-4">
                    <div className="text-sm whitespace-pre-wrap">
                      {formatMessageContent(message.content)}
                    </div>
                    {extractUrls(message.content).map((url) => {
                      const preview = linkPreviews[url];
                      return preview ? (
                        <div
                          key={url}
                          className="mt-2 p-4 border-2 border-[#E65C52]/10 rounded-lg bg-[#F5D9D1]/20 max-w-full"
                        >
                          {preview.image && (
                            <img
                              src={preview.image}
                              alt={preview.title}
                              className="w-full h-32 sm:h-48 md:h-64 object-cover rounded-lg"
                            />
                          )}
                          <div className="p-4">
                            <h4 className="text-base font-bold text-[#E14C42] link-preview-text">
                              {preview.title}
                            </h4>
                            <p className="text-sm text-gray-600 link-preview-text">
                              {preview.description}
                            </p>
                            <a
                              href={preview.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-[#E65C52] hover:text-[#E14C42] link-preview-text"
                            >
                              {preview.url}
                            </a>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-[#E65C52]/10">
                  <Tooltip text="Regenerate">
                    <button
                      className={`p-1.5 rounded-md text-[#E65C52] hover:bg-[#F5D9D1] hover:text-[#E14C42] transition-colors ${
                        index === 0 || messages[index - 1].role !== 'user'
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                      onClick={() => {
                        console.log('Regenerate clicked for index:', index);
                        handleRegenerate(index);
                      }}
                      disabled={index === 0 || messages[index - 1].role !== 'user'}
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
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M8 16H3v5" />
                      </svg>
                    </button>
                  </Tooltip>
                  <Tooltip text="Copy">
                    <CopyButton
                      text={message.content}
                      onCopy={() => console.log('Copy clicked for index:', index)}
                    />
                  </Tooltip>
                  <Tooltip text="Read Aloud">
                    <ReadAloudButton
                      text={message.content}
                      onStart={() =>
                        console.log('Read Aloud started for index:', index)
                      }
                    />
                  </Tooltip>
                  <Tooltip text="Like">
                    <button
                      className={`p-1.5 rounded-md transition-colors ${
                        messageRatings[index] === 'positive'
                          ? 'text-[#E14C42] bg-[#F5D9D1]'
                          : messageRatings[index] === 'negative'
                          ? 'hidden'
                          : 'text-gray-400 hover:text-[#E65C52] hover:bg-[#F5D9D1]'
                      }`}
                      onClick={() => {
                        console.log('Like clicked for index:', index);
                        handleRateMessage(index, true);
                      }}
                      disabled={editingMessageId === index}
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
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                    </button>
                  </Tooltip>
                  <Tooltip text="Unlike">
                    <button
                      className={`p-1.5 rounded-md transition-colors ${
                        messageRatings[index] === 'negative'
                          ? 'text-[#E14C42] bg-[#F5D9D1]'
                          : messageRatings[index] === 'positive'
                          ? 'hidden'
                          : 'text-gray-400 hover:text-[#E65C52] hover:bg-[#F5D9D1]'
                      }`}
                      onClick={() => {
                        console.log('Unlike clicked for index:', index);
                        handleRateMessage(index, false);
                      }}
                      disabled={editingMessageId === index}
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
                        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                      </svg>
                    </button>
                  </Tooltip>
                  <Tooltip text="More options">
                    <button
                      className="p-1.5 rounded-md text-gray-400 hover:text-[#E65C52] hover:bg-[#F5D9D1] transition-colors"
                      onClick={() => {
                        setActiveAction(
                          activeAction === `options-${index}` ? null : `options-${index}`
                        );
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </Tooltip>
                  {activeAction === `options-${index}` && (
                    <div
                      className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl py-1 z-50 border-2 border-[#E65C52]/20 more-options-dropdown"
                      style={{ minWidth: '200px' }}
                    >
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F5D9D1] transition-colors flex items-center"
                        onClick={() => handleReportIssue(index)}
                      >
                        <span>Report Issue</span>
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F5D9D1] transition-colors flex items-center"
                        onClick={() => {
                          exportToPDF(message.content);
                          setActiveAction(null);
                        }}
                      >
                        <span>Export to PDF</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start animate-fade duration-300">
          <div className="max-w-full md:max-w-4xl p-3 md:p-5 rounded-2xl bg-white border-2 border-[#E65C52]/20 shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#E65C52] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[#E65C52] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-[#E65C52] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </>
  );
};

export default ChatMessageList;
