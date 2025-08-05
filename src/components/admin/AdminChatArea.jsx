import React, { useRef, useEffect, useState } from "react";
import MessageBubble from "../chat/MessageBubble";
import MessageInput from "../chat/MessageInput";
import VoiceRecorder from "../chat/VoiceRecorder";
import "./AdminChatArea.css";

export default function AdminChatArea({
  contact,
  messages,
  onSend,
  value,
  onChange,
  onAttach,
  onMic,
  onEmoji,
  isTyping,
  isLoading,
  error
}) {
  const messagesEndRef = useRef(null);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceDuration, setVoiceDuration] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleRecordComplete = (blob, duration) => {
    setVoiceBlob(blob);
    setVoiceDuration(duration);
  };

  const handleSend = async (msg, file, duration) => {
    if (!contact.id) {
      alert("Cannot send message: Invalid chat selected");
      return;
    }
    if (voiceBlob) {
      await onSend("", voiceBlob, voiceDuration);
      setVoiceBlob(null);
      setVoiceDuration(null);
    } else if ((msg && msg.trim()) || file) {
      await onSend(msg, file, duration);
      if (onChange) onChange({ target: { value: "" } });
    }
  };

  return (
    <section className="admin-chat-area">
      <div className="admin-chat-area__header">
        <div className="admin-chat-area__user">
          <div className="admin-chat-area__avatar-wrap">
            <img src={contact.avatar} alt={contact.name} className="admin-chat-area__avatar" />
            <span
              className={`admin-chat-area__status admin-chat-area__status--${contact.status}`}
              title={contact.status}
            />
          </div>
          <span className="admin-chat-area__name">{contact.name}</span>
        </div>
        <div className="admin-chat-area__actions">
          <button className="admin-chat-area__icon-btn" aria-label="Menu">
            <svg width="4" height="16" fill="none" viewBox="0 0 4 16">
              <path d="M2.18262 12.2588C3.06529 12.3482 3.75391 13.0937 3.75391 14C3.75391 14.9063 3.06529 15.6518 2.18262 15.7412L2.00391 15.75H1.99414C1.02764 15.75 0.244141 14.9665 0.244141 14C0.244141 13.0335 1.02764 12.25 1.99414 12.25H2.00391L2.18262 12.2588ZM2.18262 6.25879C3.06529 6.34819 3.75391 7.09375 3.75391 8C3.75391 8.90625 3.06529 9.65181 2.18262 9.74121L2.00391 9.75H1.99414C1.02764 9.75 0.244141 8.9665 0.244141 8C0.244141 7.0335 1.02764 6.25 1.99414 6.25H2.00391L2.18262 6.25879ZM2.18262 0.258789C3.06529 0.348189 3.75391 1.09375 3.75391 2C3.75391 2.90625 3.06529 3.65181 2.18262 3.74121L2.00391 3.75H1.99414C1.02764 3.75 0.244141 2.9665 0.244141 2C0.244141 1.0335 1.02764 0.25 1.99414 0.25H2.00391L2.18262 0.258789Z" fill="#344054" />
            </svg>
          </button>
        </div>
      </div>
      <div className="admin-chat-area__messages">
        {isLoading ? (
          <div className="admin-chat-area__loading">Loading messages...</div>
        ) : error ? (
          <div className="admin-chat-area__error">Failed to load messages</div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble
              key={msg.id || i}
              message={msg}
              isOwn={msg.mine}
            />
          ))
        )}
        {isTyping && <div className="admin-chat-area__typing">Typing...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div
        className="admin-chat-area__input-row"
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: "12px",
          background: "#fff",
          padding: "12px 16px",
          borderTop: "1px solid #eee"
        }}
      >
        <div style={{ flex: 1 }}>
          <MessageInput
            chatId={contact.id}
            forceSendEnabled={true}
            content={value}
            onChange={onChange}
            onSend={handleSend}
            showMic={false}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <VoiceRecorder
            onRecordComplete={handleRecordComplete}
            disabled={false}
          />
        </div>
      </div>
    </section>
  );
}
