import React, { useState } from 'react';
import API_URL from '../config';

const Login = ({ setToken, showToast }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const endpoint = isLogin ? `${API_URL}/token` : `${API_URL}/users`;

        try {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Authentication failed');
            }

            if (isLogin) {
                const data = await response.json();
                setToken(data.access_token);
                localStorage.setItem('token', data.access_token);
                showToast && showToast('Login successful! Welcome back 🎉', 'success');
            } else {
                showToast && showToast('Signup successful! Please login.', 'success');
                setIsLogin(true);
                setPassword('');
            }
        } catch (err) {
            setError(err.message);
            showToast && showToast(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ maxWidth: '400px', margin: '4rem auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>

            {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    className="input-field"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    className="input-field"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                    {isLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1rem', opacity: 0.8 }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span
                    style={{ color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => setIsLogin(!isLogin)}
                >
                    {isLogin ? 'Sign Up' : 'Login'}
                </span>
            </p>
        </div>
    );
};

export default Login;
