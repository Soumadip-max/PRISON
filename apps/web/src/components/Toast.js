'use client';
import { useState, useEffect } from 'react';

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const toast = { id: Date.now(), ...e.detail };
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toast.id)), 4000);
    };
    window.addEventListener('prison:toast', handler);
    return () => window.removeEventListener('prison:toast', handler);
  }, []);

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type || 'info'}`}>
          <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export function toast(message, type = 'info') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('prison:toast', { detail: { message, type } }));
  }
}
