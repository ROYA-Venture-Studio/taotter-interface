import React from "react";
import "./MessageBubble.css";

// Utility to convert URLs in text to clickable links
function linkifyText(text) {
  if (!text) return text;
  const urlRegex = /((https?:\/\/|www\.)[^\s<]+)/gi;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    const { index } = match;
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }
    let url = match[0];
    let href = url.startsWith("http") ? url : "https://" + url;
    parts.push(
      <a
        key={index}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#2563eb", textDecoration: "underline", wordBreak: "break-all" }}
      >
        {url}
      </a>
    );
    lastIndex = index + url.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

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
        <div className="message-bubble-text">{linkifyText(content)}</div>
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
