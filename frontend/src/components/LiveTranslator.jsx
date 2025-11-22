import React, { useState, useRef, useEffect } from 'react';
import API_URL from '../config';

const LiveTranslator = ({ token }) => {
    const [mode, setMode] = useState('text');
    const [inputText, setInputText] = useState('');
    const [targetLang, setTargetLang] = useState('Hindi');
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pronunciation, setPronunciation] = useState(null);
    const [detectedLang, setDetectedLang] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [recentTranslations, setRecentTranslations] = useState([]);

    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const handleTranslateText = async () => {
        setIsLoading(true);
        setPronunciation(null);
        setDetectedLang(null);
        try {
            const formData = new FormData();
            formData.append('text', inputText);
            formData.append('target_language', targetLang);

            const response = await fetch(`${API_URL}/translate/text`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();
            setResult(data.translated_text);
            addToRecent(inputText, data.translated_text, targetLang);
        } catch (error) {
            console.error("Translation error", error);
            alert('Translation failed. Check if backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const formData = new FormData();
                formData.append('file', audioBlob, 'recording.wav');
                formData.append('target_language', targetLang);

                setIsLoading(true);
                try {
                    const response = await fetch(`${API_URL}/translate/voice`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: formData
                    });
                    const data = await response.json();
                    setResult(`${data.transcript} -> ${data.translated_text}`);
                } catch (error) {
                    console.error("Voice translation error", error);
                } finally {
                    setIsLoading(false);
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera", err);
        }
    };

    const captureImage = async () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

            canvas.toBlob(async (blob) => {
                const formData = new FormData();
                formData.append('file', blob, 'capture.jpg');
                formData.append('target_language', targetLang);

                setIsLoading(true);
                try {
                    const response = await fetch(`${API_URL}/translate/image`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: formData
                    });
                    const data = await response.json();
                    setResult(data.analysis);
                } catch (error) {
                    console.error("Image translation error", error);
                } finally {
                    setIsLoading(false);
                }
            }, 'image/jpeg');
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await fetch(`${API_URL}/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setHistory(data);
            setShowHistory(true);
        } catch (error) {
            console.error("Error fetching history", error);
        }
    };

    const handlePlayAudio = async () => {
        if (!result) return;
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('text', result);
            formData.append('language', targetLang);

            const response = await fetch(`${API_URL}/tts`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const blob = await response.blob();
                const audioUrl = URL.createObjectURL(blob);
                const audio = new Audio(audioUrl);
                audio.play();
            } else {
                console.error("TTS failed");
            }
        } catch (error) {
            console.error("TTS error", error);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadHistory = () => {
        if (!history.length) return;

        const headers = ["Date", "Type", "Original", "Translated"];
        const csvContent = [
            headers.join(","),
            ...history.map(item => {
                const date = new Date(item.timestamp).toLocaleString().replace(/,/g, "");
                const original = `"${item.original_content.replace(/"/g, '""')}"`;
                const translated = `"${item.translated_content.replace(/"/g, '""')}"`;
                return `${date},${item.input_type},${original},${translated}`;
            })
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'translation_history.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const copyToClipboard = () => {
        if (result) {
            navigator.clipboard.writeText(result);
            alert('Copied to clipboard!');
        }
    };

    const detectLanguage = async () => {
        if (!inputText) return;
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('text', inputText);

            const response = await fetch(`${API_URL}/detect-language`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();
            setDetectedLang(data.detected_language);
        } catch (error) {
            console.error("Language detection error", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getPronunciation = async () => {
        if (!result) return;
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('text', result);
            formData.append('target_language', targetLang);

            const response = await fetch(`${API_URL}/pronunciation`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();
            setPronunciation(data.pronunciation);
        } catch (error) {
            console.error("Pronunciation error", error);
        } finally {
            setIsLoading(false);
        }
    };

    const startVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice input not supported in this browser. Try Chrome!');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        // Enable continuous recognition
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        let finalTranscript = '';

        recognition.onstart = () => {
            setIsListening(true);
            finalTranscript = '';
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            // Update text field with both final and interim results
            setInputText(finalTranscript + interimTranscript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            if (event.error !== 'no-speech') {
                setIsListening(false);
                showToast && showToast('Voice input error. Please try again.', 'error');
            }
        };

        recognition.onend = () => {
            // Only stop if user manually stopped it
            if (isListening) {
                setIsListening(false);
            }
        };

        // Store recognition instance for stopping later
        window.currentRecognition = recognition;
        recognition.start();
    };

    const stopVoiceInput = () => {
        if (window.currentRecognition) {
            window.currentRecognition.stop();
            setIsListening(false);
        }
    };

    const addToRecent = (original, translated, lang) => {
        const newRecent = { original, translated, language: lang, timestamp: Date.now() };
        setRecentTranslations(prev => [newRecent, ...prev.slice(0, 4)]);
    };

    const useRecentTranslation = (item) => {
        setInputText(item.original);
        setResult(item.translated);
        setTargetLang(item.language);
    };

    useEffect(() => {
        if (mode === 'image') {
            startCamera();
        } else {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        }
    }, [mode]);

    return (
        <div className="glass-panel animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Live Multimodal Translator</h2>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button className={`btn-primary ${mode === 'text' ? '' : 'opacity-50'}`} onClick={() => setMode('text')}>Text</button>
                <button className={`btn-primary ${mode === 'voice' ? '' : 'opacity-50'}`} onClick={() => setMode('voice')}>Voice</button>
                <button className={`btn-primary ${mode === 'image' ? '' : 'opacity-50'}`} onClick={() => setMode('image')}>Image</button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Target Language:</label>
                <select className="input-field" value={targetLang} onChange={(e) => setTargetLang(e.target.value)} style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="Hinglish">Hinglish (Hindi in English)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                    <option value="Romanized Marathi">Romanized Marathi</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                    <option value="Romanized Bengali">Romanized Bengali</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Romanized Tamil">Romanized Tamil</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Romanized Telugu">Romanized Telugu</option>
                    <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                    <option value="Romanized Gujarati">Romanized Gujarati</option>
                    <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                    <option value="Romanized Kannada">Romanized Kannada</option>
                    <option value="Malayalam">Malayalam (മലയാളം)</option>
                    <option value="Romanized Malayalam">Romanized Malayalam</option>
                    <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                    <option value="Romanized Punjabi">Romanized Punjabi</option>
                    <option value="Urdu">Urdu (اردو)</option>
                    <option value="Romanized Urdu">Romanized Urdu</option>
                    <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
                    <option value="Romanized Odia">Romanized Odia</option>
                    <option value="Assamese">Assamese (অসমীয়া)</option>
                    <option value="Romanized Assamese">Romanized Assamese</option>
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Romanized Japanese">Romanized Japanese (Romaji)</option>
                </select>
            </div>

            {recentTranslations.length > 0 && (
                <div style={{ marginBottom: '1rem', padding: '0.5rem', background: 'rgba(100,100,255,0.1)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>📌 Recent Translations:</div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {recentTranslations.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => useRecentTranslation(item)}
                                style={{
                                    padding: '0.3rem 0.6rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    color: 'white'
                                }}
                            >
                                {item.original.substring(0, 20)}... → {item.language}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {mode === 'text' && (
                <div>
                    <textarea className="input-field" rows="4" placeholder="Enter text to translate..." value={inputText} onChange={(e) => setInputText(e.target.value)} />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button className="btn-primary" onClick={handleTranslateText} disabled={isLoading} style={{ flex: 1 }}>
                            {isLoading ? 'Translating...' : 'Translate'}
                        </button>
                        {!isListening ? (
                            <button className="btn-primary" onClick={startVoiceInput} style={{ background: 'rgba(255,100,100,0.3)' }}>
                                🎤 Voice
                            </button>
                        ) : (
                            <button className="btn-primary" onClick={stopVoiceInput} style={{ background: 'red', animation: 'pulse 1.5s infinite' }}>
                                ⏹️ Stop
                            </button>
                        )}
                        <button className="btn-primary" onClick={detectLanguage} disabled={isLoading} style={{ background: 'rgba(100,100,255,0.3)' }}>
                            🔍 Detect
                        </button>
                    </div>
                    {isListening && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(255,0,0,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                            🎤 <strong>Listening...</strong> Speak now. Click Stop when done.
                        </div>
                    )}
                    {detectedLang && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(0,255,0,0.1)', borderRadius: '8px' }}>
                            Detected: <strong>{detectedLang}</strong>
                        </div>
                    )}
                </div>
            )}

            {mode === 'voice' && (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎙️</div>
                    {!isRecording ? (
                        <button className="btn-primary" onClick={startRecording}>Start Recording</button>
                    ) : (
                        <button className="btn-primary" style={{ background: 'red' }} onClick={stopRecording}>Stop Recording</button>
                    )}
                    {isLoading && <p>Processing audio...</p>}
                </div>
            )}

            {mode === 'image' && (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem', border: '2px solid var(--glass-border)' }}>
                        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '500px' }} />
                    </div>
                    <button className="btn-primary" onClick={captureImage} disabled={isLoading}>
                        {isLoading ? 'Analyzing...' : 'Capture & Translate'}
                    </button>
                </div>
            )}

            {result && (
                <div className="glass-panel" style={{ marginTop: '2rem', background: 'rgba(0,0,0,0.3)' }}>
                    <h3>Result:</h3>
                    <p style={{ whiteSpace: 'pre-wrap', fontSize: '1.2rem', marginBottom: '1rem' }}>{result}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button className="btn-primary" style={{ fontSize: '0.9rem' }} onClick={handlePlayAudio}>
                            🔊 Play Audio
                        </button>
                        <button className="btn-primary" style={{ fontSize: '0.9rem', background: 'rgba(100,200,100,0.3)' }} onClick={copyToClipboard}>
                            📋 Copy
                        </button>
                        <button className="btn-primary" style={{ fontSize: '0.9rem', background: 'rgba(200,100,200,0.3)' }} onClick={getPronunciation}>
                            📖 Pronunciation
                        </button>
                    </div>
                    {pronunciation && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,0,0.1)', borderRadius: '8px' }}>
                            <strong>How to pronounce:</strong>
                            <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>{pronunciation}</p>
                        </div>
                    )}
                </div>
            )}

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--glass-border)' }} onClick={() => showHistory ? setShowHistory(false) : fetchHistory()}>
                    {showHistory ? 'Hide History' : 'View History'}
                </button>
            </div>

            {showHistory && (
                <div className="glass-panel animate-fade-in" style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Translation History</h3>
                        <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }} onClick={downloadHistory}>
                            📥 Download CSV
                        </button>
                    </div>
                    {history.map((item) => (
                        <div key={item.id} style={{ borderBottom: '1px solid var(--glass-border)', padding: '0.5rem 0' }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{new Date(item.timestamp).toLocaleString()} - {item.input_type}</div>
                            <div style={{ fontWeight: 'bold' }}>{item.original_content}</div>
                            <div style={{ color: 'var(--secondary-color)' }}>{item.translated_content}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LiveTranslator;
