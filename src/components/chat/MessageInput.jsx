import React, { useRef, useState } from "react";
import VoiceRecorder from "./VoiceRecorder";
import "./MessageInput.css";

export default function MessageInput({
  chatId,
  content = "",
  onChange,
  onSend,
  showMic = true,
  disabled = false,
  style,
  forceSendEnabled = false
}) {
  const [files, setFiles] = useState([]);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceDuration, setVoiceDuration] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef();

  // Drag & drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };
  const handleDragOver = (e) => e.preventDefault();

  // File picker
  const handleFileChange = (e) => {
    setFiles(prev => [...prev, ...Array.from(e.target.files)]);
  };

  // Remove file
  const removeFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  // Voice recording (placeholder, implement with Web Audio API)
  const handleRecordVoice = async () => {
    setIsRecording(true);
    // TODO: Start recording logic here
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // TODO: Stop recording logic and setVoiceBlob, setVoiceDuration
  };

  // Send message
  const handleSend = async () => {
    if (!chatId) {
      alert("Cannot send message: chatId is null or undefined");
      return;
    }
    if (!forceSendEnabled && !content.trim() && files.length === 0 && !voiceBlob) return;
    setUploading(true);
    try {
      if (onSend) {
        await onSend(content, voiceBlob || files[0], voiceDuration);
      }
      setFiles([]);
      setVoiceBlob(null);
      setVoiceDuration(null);
    } finally {
      setUploading(false);
    }
  };

  const isDisabled = disabled || uploading || !chatId;
  const [sendDisabled, setSendDisabled] = useState(true);

React.useEffect(() => {
  console.log("useEffect: isDisabled", isDisabled, "content", content, "files", files, "voiceBlob", voiceBlob, "voiceDuration", voiceDuration, "forceSendEnabled", forceSendEnabled);
  const hasFile = files.length > 0;
  const hasVoice = !!voiceBlob;
  setSendDisabled(isDisabled || (!forceSendEnabled && !content.trim() && !hasFile && !hasVoice));
}, [isDisabled, content, files, voiceBlob, voiceDuration, forceSendEnabled]);

  // Remove old isSendDisabled usage below and replace with sendDisabled

  return (
    <div className="message-input-container" style={style} onDrop={handleDrop} onDragOver={handleDragOver}>
      <div className="message-input-row" style={{ alignItems: "center", display: "flex", flexWrap: "nowrap" }}>
        {showMic && (
          <>
            {console.log("Passing onRecordComplete to VoiceRecorder")}
            <VoiceRecorder
              disabled={isDisabled}
              onRecordComplete={React.useCallback((blob, duration) => {
                console.log("VoiceRecorder onRecordComplete called", { blob, duration });
                setVoiceBlob(blob);
                setVoiceDuration(duration);
                console.log("setVoiceBlob called, blob:", blob, "duration:", duration);
              }, [])}
            />
          </>
        )}
        <input
          type="text"
          className="message-input-text"
          value={content}
          onChange={onChange}
          placeholder={isRecording ? "Recording..." : "Type a message..."}
          disabled={isDisabled}
          style={
            isRecording
              ? { width: "140px", transition: "width 0.2s" }
              : files.length > 0
                ? { width: "180px", marginLeft: showMic ? 8 : 0 }
                : { flex: 1, marginLeft: showMic ? 8 : 0 }
          }
        />
        {files.length > 0 && (
          <div className="message-input-files" style={{ display: "flex", alignItems: "center", marginLeft: 8, gap: 8 }}>
            {files.map((file, idx) => (
              <div key={idx} className="message-input-file-preview" style={{ display: "flex", alignItems: "center", background: "#f5f5f5", borderRadius: 4, padding: "2px 8px" }}>
                <span style={{ color: "#000", fontWeight: 500, fontSize: 14 }}>{file.name}</span>
                <button onClick={() => removeFile(idx)} style={{ marginLeft: 4, background: "none", border: "none", color: "#EB5E28", fontWeight: "bold", cursor: "pointer" }}>&times;</button>
              </div>
            ))}
          </div>
        )}
        {isRecording && (
          <div className="message-input-recording-indicator" style={{
            marginLeft: 8,
            color: "#EB5E28",
            fontWeight: "bold",
            fontSize: 15,
            display: "flex",
            alignItems: "center"
          }}>
            <span>Recording...</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            type="file"
            multiple
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
          />
          <button
            className="message-input-attach-btn"
            title="Attach files"
            onClick={() => fileInputRef.current.click()}
            disabled={isDisabled}
          >
            <img src="/assets/icons/attachment.svg" alt="Attach" />
          </button>
          <button
            className="message-input-send-btn"
            onClick={handleSend}
            disabled={sendDisabled}
          >
            Send
          </button>
          {isRecording && (
            <button
              className="message-input-stop-btn"
              title="Stop recording"
              onClick={handleStopRecording}
              style={{
                marginLeft: 8,
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#EB5E28",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none"
              }}
            >
              <img
                src="/assets/icons/stop.svg"
                alt="Stop"
                style={{
                  width: 24,
                  height: 24,
                  filter: "invert(38%) sepia(98%) saturate(746%) hue-rotate(355deg) brightness(97%) contrast(101%)"
                }}
              />
            </button>
          )}
        </div>
      </div>
      {isRecording && (
        <div className="message-input-recording-preview" style={{ marginTop: 8 }}>
          {/* TODO: Show audio preview here */}
          <span style={{ color: "#EB5E28", fontWeight: "bold" }}>Recording...</span>
        </div>
      )}
      {uploading && <div className="message-input-progress">Uploading...</div>}
    </div>
  );
}
