import React, { useState } from "react";
import ChatContainer from "./ChatContainer";
import MessageInput from "./MessageInput";
import VoiceRecorder from "./VoiceRecorder";
import { useGetChatListQuery } from "../../store/api/chatApi";
import "./ChatPage.css";

export default function ChatPage({ userId }) {
  const { data, isLoading } = useGetChatListQuery();
  const chats = data?.chats || [];
  const [selectedChatId, setSelectedChatId] = useState(chats[0]?._id || null);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceDuration, setVoiceDuration] = useState(null);

  const handleRecordComplete = (blob, duration) => {
    setVoiceBlob(blob);
    setVoiceDuration(duration);
  };

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <h3>Chats</h3>
        {isLoading ? (
          <div>Loading chats...</div>
        ) : (
          <ul>
            {chats.map(chat => (
              <li
                key={chat._id}
                className={chat._id === selectedChatId ? "active" : ""}
                onClick={() => setSelectedChatId(chat._id)}
              >
                {chat.startupId?.profile?.companyName ||
                  chat.adminId?.profile?.firstName ||
                  "Chat"}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="chat-main">
        {selectedChatId ? (
          <>
            <ChatContainer chatId={selectedChatId} userId={userId} />
            <MessageInput
              chatId={selectedChatId}
              voiceBlob={voiceBlob}
              voiceDuration={voiceDuration}
            />
            <VoiceRecorder
              onRecordComplete={handleRecordComplete}
              disabled={false}
            />
          </>
        ) : (
          <div className="chat-empty">Select a chat to start messaging.</div>
        )}
      </div>
    </div>
  );
}
