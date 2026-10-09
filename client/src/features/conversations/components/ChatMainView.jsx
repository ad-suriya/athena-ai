import React from 'react';
import ChatInputForm from './ChatInputForm.jsx';
import ChatCategoriesPanel from './ChatCategoriesPanel.jsx';
import ChatMessageList from './ChatMessageList.jsx';
import UpcomingEvents from '../../calendar/components/UpcomingEvents.jsx';
import VoiceRecordingAnimation from './VoiceRecordingAnimation.jsx';
import { X } from 'lucide-react';
import logo from '../../../assets/logo-07.png';

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
              <img src={logo} alt="" className="mb-4 h-14 w-14 object-contain" />
              <h1 className="text-balance text-3xl font-bold tracking-[-0.02em] text-ink md:text-[40px]">
                Hi, <span className="text-brand-500">{user?.displayName?.split(' ')[0] || 'there'}</span>
              </h1>
              <p className="mb-8 mt-2 text-lg text-ink-muted">
                How can I help you today?
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
            <div className="space-y-5 py-2 md:py-4">
              <ChatMessageList {...messageListProps} messages={messages} />
            </div>
          )}
        </div>
      </div>

      {messages.length > 0 && (
        <div className="sticky bottom-0 w-full bg-gradient-to-t from-white via-white/95 to-transparent px-4 pb-4 pt-6">
          <div className="max-w-4xl mx-auto w-full">
            {errorMessage && (
              <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3" role="alert">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-brand-700">{errorMessage}</span>
                </div>
                <button
                  aria-label="Dismiss"
                  className="rounded-md p-1 text-brand-500 hover:bg-brand-100"
                  onClick={() => setErrorMessage(null)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {recordingError && (
              <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3" role="alert">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-brand-700">{recordingError}</span>
                </div>
                <button
                  aria-label="Dismiss"
                  className="rounded-md p-1 text-brand-500 hover:bg-brand-100"
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
                <p className="mt-1 text-sm text-brand-600">Recording… speak now</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
