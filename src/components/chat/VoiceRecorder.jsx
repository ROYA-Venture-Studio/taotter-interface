import React, { useRef, useState } from "react";

export default function VoiceRecorder({ onRecordComplete, disabled, voiceBlob, voiceDuration }) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [duration, setDuration] = useState(0);
  const durationRef = useRef(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    setRecording(true);
    setDuration(0);
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new window.MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
mediaRecorderRef.current.onstop = () => {
  const blob = new Blob(chunksRef.current, { type: "audio/webm" });
  setAudioBlob(blob);
  setAudioUrl(URL.createObjectURL(blob));
  // Ensure duration is at least 1 second for short recordings
  if (durationRef.current < 1) durationRef.current = 1;
  console.log("VoiceRecorder onstop, calling onRecordComplete", { blob, duration: durationRef.current, onRecordComplete });
  console.log("onRecordComplete function string:", onRecordComplete && onRecordComplete.toString());
  console.log("onstop durationRef.current:", durationRef.current);
  if (onRecordComplete) onRecordComplete(blob, durationRef.current);
};
      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration(d => {
          // console.log("Recording duration:", d + 1);
          return d + 1;
        });
      }, 1000);
      mediaRecorderRef.current.start();
    } catch (err) {
      alert("Microphone access denied.");
      setRecording(false);
    }
  };

  const stopRecording = () => {
    setRecording(false);
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    setRecording(false);
    clearInterval(timerRef.current);
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  // Reset preview when voiceBlob is cleared by parent
  React.useEffect(() => {
    if (typeof voiceBlob !== "undefined" && voiceBlob === null) {
      setAudioBlob(null);
      setAudioUrl(null);
      setDuration(0);
    }
  }, [voiceBlob]);

  return (
    <div className="voice-recorder" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {recording && (
        <>
          <div style={{
            color: "#EB5E28",
            fontWeight: "bold",
            fontSize: 15,
            marginRight: 8,
            display: "flex",
            alignItems: "center"
          }}>
            <span>Recording...</span>
            <span style={{ marginLeft: 6 }}>{duration}s</span>
          </div>
          <button
            onClick={stopRecording}
            disabled={disabled}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              padding: 0,
              cursor: "pointer"
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
        </>
      )}
      {!recording && !audioUrl && (
        <button
          onClick={startRecording}
          disabled={disabled}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            color: "#000"
          }}
        >
          <img src="/assets/icons/microphone.svg" alt="Record" style={{ filter: "invert(0%)", width: 24, height: 24 }} />
        </button>
      )}
      {audioUrl && (
        <div className="voice-recorder-preview" style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          maxWidth: 180,
          overflow: "hidden"
        }}>
          <audio controls src={audioUrl} style={{ width: 120 }} />
          <button onClick={cancelRecording} style={{ background: "none", border: "none", color: "#000", cursor: "pointer" }}>
            <img src="/assets/icons/close.svg" alt="Delete" style={{ filter: "invert(0%)", width: 20, height: 20 }} />
          </button>
        </div>
      )}
    </div>
  );
}
