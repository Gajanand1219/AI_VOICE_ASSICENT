import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import VoiceAssistant from "./VoiceAssistant";
import History from "./History";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h2>🎙️ VoiceAI Assistant</h2>
        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? "active-link" : ""}>
            Start
          </NavLink>
          <NavLink to="/assistant" className={({ isActive }) => isActive ? "active-link" : ""}>
            Assistant
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => isActive ? "active-link" : ""}>
            History
          </NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/assistant" element={<VoiceAssistant />} />
        <Route path="/history" element={<History />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

function StartPage() {
  const navigate = useNavigate();
  return (
    <div className="center-page">
      <h2>Welcome to VoiceAI</h2>
      <p>
        VoiceAI is your personal voice-powered assistant. Speak naturally and let AI handle tasks, answer questions, and assist you with smart conversation.
      </p>
      <ul className="features-list">
        <li>🎙️ Speak and get instant AI responses</li>
        <li>🧠 Powered by Azure OpenAI & Deepgram</li>
        <li>📄 All conversations saved in history</li>
        <li>👁️ Animated voice avatar for interaction</li>
        <li>🔁 Continuous listening with smart restart</li>
      </ul>
      <button onClick={() => navigate("/assistant")}>Start Conversation</button>
    </div>
  );
}

function NotFound() {
  return (
    <div className="center-page">
      <h2>404 - Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <button onClick={() => window.history.back()}>Go Back</button>
    </div>
  );
}

export default App;
