import React from 'react';

const LandingPage = ({ onGetStarted }) => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div className="glass-panel animate-fade-in" style={{ maxWidth: '900px', textAlign: 'center' }}>
                <h1 style={{
                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    LinguaFlow
                </h1>
                <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', opacity: 0.9, marginBottom: '2rem' }}>
                    Break Language Barriers with AI-Powered Multimodal Translation
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem',
                    textAlign: 'left'
                }}>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌍</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>30+ Languages</h3>
                        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                            12 Indian languages + romanized versions + international languages
                        </p>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎭</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Multimodal</h3>
                        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                            Text, voice, and image translation in one app
                        </p>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔊</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Voice Features</h3>
                        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                            Voice input, text-to-speech, and pronunciation guides
                        </p>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤖</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>AI-Powered</h3>
                        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                            Google Gemini 2.5 Flash for accurate translations
                        </p>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>100% Free</h3>
                        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                            No API costs, no usage limits, completely free
                        </p>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Smart Features</h3>
                        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                            History, favorites, language detection, and more
                        </p>
                    </div>
                </div>

                <button
                    className="btn-primary"
                    onClick={onGetStarted}
                    style={{
                        fontSize: '1.2rem',
                        padding: '1rem 3rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        marginTop: '1rem'
                    }}
                >
                    Get Started →
                </button>

                <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', opacity: 0.6 }}>
                    Perfect for travelers, students, businesses, and government offices
                </p>
            </div>
        </div>
    );
};

export default LandingPage;
