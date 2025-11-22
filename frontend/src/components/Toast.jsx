import React, { useState, useEffect } from 'react';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'rgba(0, 255, 0, 0.2)' :
        type === 'error' ? 'rgba(255, 0, 0, 0.2)' :
            'rgba(100, 100, 255, 0.2)';

    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: bgColor,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            zIndex: 9999,
            animation: 'slideIn 0.3s ease-out',
            maxWidth: '300px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                <span style={{ color: 'white', fontSize: '0.9rem' }}>{message}</span>
            </div>
        </div>
    );
};

export default Toast;
