import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import LiveTranslator from './components/LiveTranslator';
import LandingPage from './components/LandingPage';
import Toast from './components/Toast';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showLanding, setShowLanding] = useState(!localStorage.getItem('hasVisited'));
  const [toast, setToast] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('darkMode') !== 'false');

  useEffect(() => {
    if (token) {
      localStorage.setItem('hasVisited', 'true');
      setShowLanding(false);
    }
  }, [token]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    showToast('Logged out successfully', 'success');
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleGetStarted = () => {
    setShowLanding(false);
    localStorage.setItem('hasVisited', 'true');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    showToast(isDarkMode ? 'Light mode activated ☀️' : 'Dark mode activated 🌙', 'info');
  };

  if (showLanding && !token) {
    return (
      <>
        <LandingPage onGetStarted={handleGetStarted} />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </>
    );
  }

  return (
    <div className="container">
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{
          background: 'linear-gradient(to right, #6366f1, #ec4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          margin: 0
        }}>
          LinguaFlow
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={toggleDarkMode}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '1.2rem'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          {token && (
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid var(--glass-border)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {!token ? (
        <Login setToken={setToken} showToast={showToast} />
      ) : (
        <LiveTranslator token={token} showToast={showToast} />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
