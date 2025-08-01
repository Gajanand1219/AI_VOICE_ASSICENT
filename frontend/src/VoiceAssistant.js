import { useState, useRef, useEffect } from "react";

export default function VoiceAssistant() {
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [listening, setListening] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);

  const mediaChunksRef = useRef([]);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    if (isProcessing) {
      setIsAISpeaking(false);
      setIsUserSpeaking(false);
    }
  }, [isProcessing]);

  const startRecording = async () => {
    setTranscript("");
    setResponse("");
    mediaChunksRef.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        mediaChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(mediaChunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");

      try {
        setIsProcessing(true);

        const res = await fetch("https://voice-backend-950d.onrender.com/transcribe", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        const text = data.transcript?.trim();

        if (!text || text.length < 2) {
          console.log("User didn't say anything. Skipping AI response.");
          setIsProcessing(false);
          stream.getTracks().forEach((track) => track.stop());
          if (!isStopped) {
            setTimeout(() => startRecording(), 1000);
          }
          return;
        }

        setTranscript(text);

        let finalText = "";
        const streamRes = await fetch("https://voice-backend-950d.onrender.com/chat-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        const reader = streamRes.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          finalText += chunk;
          setResponse((prev) => prev + chunk);
        }

        await fetch("https://voice-backend-950d.onrender.com/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: text, assistant: finalText }),
        });

        setTimeout(() => setIsAISpeaking(true), 1500);
        const ttsRes = await fetch("https://voice-backend-950d.onrender.com/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: finalText }),
        });

        const audioBlob = await ttsRes.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          setIsAISpeaking(false);

          if (!finalText.toLowerCase().includes("bye") && !isStopped) {
            setTimeout(() => startRecording(), 1000);
          } else {
            setListening(false);
          }
        };

        audio.play();
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setIsProcessing(false);
        stream.getTracks().forEach((track) => track.stop());
      }
    };

    mediaRecorderRef.current = recorder;

    setIsUserSpeaking(true);
    recorder.start();
    setTimeout(() => recorder.stop(), 5000);
  };

  const handleStart = () => {
    setIsStopped(false);
    setListening(true);
    startRecording();
  };

  const handleReset = () => {
    setIsStopped(true);
    setTranscript("");
    setResponse("");
    setIsProcessing(false);
    setListening(false);
    setIsAISpeaking(false);
    setIsUserSpeaking(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="voice-assistant-page">
      <main className="assistant-content">
        <div className="avatar-section">
          <div className="avatar-wrapper">
            {listening && !isProcessing && (
              <div className="voice-bars">
                {[...Array(5)].map((_, i) => <span key={i} className="bar" />)}
              </div>
            )}

            {isAISpeaking ? (
              <video
                src="/talk.mp4"
                autoPlay
                muted
                loop
                width="140"
                height="140"
                className="avatar-img"
              />
            ) : isUserSpeaking ? (
              <video
                src="/listen.mp4"
                autoPlay
                muted
                loop
                width="140"
                height="140"
                className="avatar-img"
              />
            ) : (
              <video
                src="/prcessing.mp4"
                autoPlay
                muted
                loop
                width="140"
                height="140"
                className="avatar-img"
              />
            )}

            {listening && !isProcessing && (
              <div className="voice-bars">
                {[...Array(5)].map((_, i) => <span key={i} className="bar" />)}
              </div>
            )}
          </div>
        </div>

        <div className="controls">
          {!listening ? (
            <button onClick={handleStart} className="start-btn">🎤 Start</button>
          ) : (
            <button onClick={handleReset} className="stop-btn">⏹️ Stop</button>
          )}
          <p className="status-text">{isProcessing ? "Processing..." : "Listening"}</p>
        </div>

        <div className="chat-box">
          {transcript && <p><b>You:</b> {transcript}</p>}
          {response && <p><b>AI:</b> {response}</p>}
        </div>
      </main>
    </div>
  );
}
