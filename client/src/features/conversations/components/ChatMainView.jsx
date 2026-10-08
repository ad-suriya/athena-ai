import React from 'react';
import ChatInputForm from './ChatInputForm.jsx';
import ChatCategoriesPanel from './ChatCategoriesPanel.jsx';
import ChatMessageList from './ChatMessageList.jsx';
import UpcomingEvents from '../../calendar/components/UpcomingEvents.jsx';
import VoiceRecordingAnimation from './VoiceRecordingAnimation.jsx';
import { X } from 'lucide-react';

export const ChatMainView = ({
  messages,
  user,
  chatInputProps,
  categoryProps,
  messageListProps,
  errorMessage,
  setErrorMessage,
  recordingError,
  setRecordingError,
  isRecording,
  audioLevel
}) => {
  return (
    <div className="flex flex-col h-full overflow-hidden w-full">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col items-center">
        <div className="w-full max-w-4xl">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <h1 className="text-2xl md:text-4xl font-semibold mb-2 bg-gradient-to-r from-[#E65C52] to-[#E14C42] bg-clip-text text-transparent">
                Hi, {user?.displayName?.split(' ')[0] || 'there'}!
              </h1>
              <p className="text-gray-600 text-lg md:text-xl mb-8">
                How can I assist you today?
              </p>

              <ChatInputForm isAbsolute={true} {...chatInputProps} />

              <div className="w-full max-w-2xl mt-6">
                <ChatCategoriesPanel isAbsolute={true} {...categoryProps} />

                <div className="w-full mt-6">
                  <UpcomingEvents userId={user?.uid} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8 py-2 md:py-4">
              <ChatMessageList {...messageListProps} messages={messages} />
            </div>
          )}
        </div>
      </div>

      {messages.length > 0 && (
        <div className="sticky bottom-0 p-4 bg-transparent w-full">
          <div className="max-w-4xl mx-auto w-full">
            {errorMessage && (
              <div className="bg-[#F5D9D1]/90 border-2 border-[#E65C52]/20 rounded-lg p-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#E14C42]">{errorMessage}</span>
                </div>
                <button
                  className="text-[#E65C52] hover:text-[#E14C42]"
                  onClick={() => setErrorMessage(null)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {recordingError && (
              <div className="bg-[#F5D9D1]/90 border-2 border-[#E65C52]/20 rounded-lg p-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#E14C42]">{recordingError}</span>
                </div>
                <button
                  className="text-[#E65C52] hover:text-[#E14C42]"
                  onClick={() => setRecordingError(null)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <ChatCategoriesPanel isAbsolute={false} {...categoryProps} />

            <ChatInputForm isAbsolute={false} {...chatInputProps} />
            
            {isRecording && (
              <div className="mt-2 text-center">
                <VoiceRecordingAnimation audioLevel={audioLevel} />
                <p className="text-sm text-[#E14C42] mt-1">Recording... Speak now</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
