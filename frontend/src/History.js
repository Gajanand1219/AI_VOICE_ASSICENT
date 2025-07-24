import { useEffect, useState } from "react";

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/history")
      .then((res) => res.json())
      .then((data) => setHistory(data.history || []))
      .catch(console.error);
  }, []);

  const clearHistory = async () => {
    await fetch("http://localhost:8000/history", { method: "DELETE" });
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
          <source src={`http://localhost:8000${entry.audio_url}`} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
    </li>
  ))}
</ul>
 <ul>
        {history.map((entry, index) => (
          <li key={index}>
            <strong>You:</strong> {entry.user}<br />
            <strong>AI:</strong> {entry.assistant}
    <source src={`http://localhost:8000${entry.audio_url}`} type="audio/mpeg" />

          </li>
        ))}
        
        

      </ul>
    </div>
  );
}
