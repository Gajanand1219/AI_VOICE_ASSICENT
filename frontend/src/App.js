import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import VoiceAssistant from "./VoiceAssistant";
import History from "./History";
import "./App.css";

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-container">
          <div className="logo">🎙️ VoiceAI</div>
          
          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <Link to="/">Start</Link>
            <Link to="/assistant">Assistant</Link>
            <Link to="/history">History</Link>
          </nav>

          {/* Mobile Hamburger */}
          <button 
            className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <span class="hi" >☰</span>
           
          </button>
        </div>
        <div 
          className={`mobile-nav-overlay ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        ></div>

        {/* Mobile Navigation */}
        <nav className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="nav-link">
            <span>🏠</span> Start
          </Link>
          <Link to="/assistant" onClick={() => setMobileMenuOpen(false)} className="nav-link">
            <span>🎤</span> Assistant
          </Link>
          <Link to="/history" onClick={() => setMobileMenuOpen(false)} className="nav-link">
            <span>📚</span> History
          </Link>
        </nav>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/assistant" element={<VoiceAssistant />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </div>
  );
}

function StartPage() {
  const navigate = useNavigate();
  return (
    
    <div className="start-page">
      <h2>Welcome to VoiceAI</h2>
      <p>
        Your personal voice-powered assistant for natural conversations and smart task handling.
      </p>
      <div className="features">
        <ul>
          <li>🎙️ Voice-controlled interactions</li>
          <li>🧠 AI-powered responses</li>
          <li>📚 Conversation history</li>
          <li>🗣️ Text-to-speech</li>
        </ul>
      </div>
      <button onClick={() => navigate("/assistant")}>Get Started</button>
    </div>
  );
}

export default App;
