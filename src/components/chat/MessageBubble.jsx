import React from "react";
import "./MessageBubble.css";

export default function MessageBubble({ message, isOwn }) {
  const {
    messageType,
    content,
    fileUrl,
    imageUrl,
    fileName,
    voiceUrl,
    voiceDuration,
    createdAt
  } = message;

  return (
    <div className={`message-bubble${isOwn ? " own" : ""}`}>
      {messageType === "text" && (
        <div className="message-bubble-text">{content}</div>
      )}
      {messageType === "image" && imageUrl && (
        <div className="message-bubble-image">
          <a href={imageUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={imageUrl}
              alt="chat-img"
              style={{
                width: 226,
                height: 150,
                objectFit: "cover",
                borderRadius: 8,
                padding: 4,
                background: "#fff"
              }}
            />
          </a>
        </div>
      )}
      {messageType === "file" && fileUrl && (
        <div className="message-bubble-file">
          <a href={fileUrl} download={fileName || "file"}>
            <img src="/assets/icons/attachment.svg" alt="File" style={{ width: 20, marginRight: 6 }} />
            {fileName || "Download file"}
          </a>
        </div>
      )}
      {messageType === "voice" && voiceUrl && (
        <div className="message-bubble-voice">
          <audio controls src={voiceUrl} />
        </div>
      )}
      <div className="message-bubble-meta">
        <span>{new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
    </div>
  );
}
