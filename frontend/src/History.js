import { useEffect, useState } from "react";

export default function History() {
  const [history, setHistory] = useState([]);

  // Load and de-duplicate history
  useEffect(() => {
    fetch("https://voice-backend-950d.onrender.com/history")
      .then((res) => res.json())
      .then((data) => {
        const uniqueMap = new Map();
        (data.history || []).forEach((entry) => {
          const key = entry.user.trim().toLowerCase(); // Normalize to remove duplicate questions
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, entry);
          }
        });
        setHistory([...uniqueMap.values()]);
      })
      .catch(console.error);
  }, []);

  // Clear all history from backend and local state
  const clearHistory = async () => {
    await fetch("https://voice-backend-950d.onrender.com/history", { method: "DELETE" });
    setHistory([]);
  };

  return (
    <div className="page" style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>🕓 Chat History</h2>
      <button onClick={clearHistory} style={{ marginBottom: "20px" }}>
        Clear History
      </button>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {history.map((entry, index) => (
          <li
            key={index}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "10px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <p><strong>You:</strong> {entry.user}</p>
            <p><strong>AI:</strong> {entry.assistant}</p>
            {entry.audio_url && (
              <audio controls style={{ width: "100%", marginTop: "8px" }}>
                <source
                  src={`https://voice-backend-950d.onrender.com${entry.audio_url}`}
                  type="audio/mpeg"
                />
                Your browser does not support the audio element.
              </audio>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
