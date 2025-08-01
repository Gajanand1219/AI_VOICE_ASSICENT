import { useEffect, useState } from "react";

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch("https://voice-backend-950d.onrender.com/history")
      .then((res) => res.json())
      .then((data) => setHistory(data.history || []))
      .catch(console.error);
  }, []);

  const clearHistory = async () => {
    await fetch("https://voice-backend-950d.onrender.com/history", { method: "DELETE" });
    setHistory([]);
  };

  return (
    <div className="page">
      <h2>Chat History</h2>
      <button onClick={clearHistory}>Clear History</button>
      <ul>
        {history.map((entry, index) => (
          <li key={index}>
            <strong>You:</strong> {entry.user}<br />
            <strong>AI:</strong> {entry.assistant}
            {entry.audio_url && (
              <audio controls style={{ marginTop: '10px', width: '100%' }}>
                <source src={`https://voice-backend-950d.onrender.com${entry.audio_url}`} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
