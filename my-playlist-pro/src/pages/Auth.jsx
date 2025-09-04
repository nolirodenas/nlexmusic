import React from 'react';
import AuthForm from '../components/AuthForm';
import { useNavigate } from 'react-router-dom';

export default function Auth({ initialMode = 'login', onAuth = () => {} }) {
  const navigate = useNavigate();
  
  const handleAuth = (user) => {
    onAuth(user);
    navigate('/dashboard');
  };
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans">
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-gray-950 via-violet-900/70 to-teal-900/70" aria-hidden="true" />
      <svg className="fixed z-0 opacity-10 w-96 h-96 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 200 200" fill="none">
        <g>
          <ellipse cx="100" cy="100" rx="90" ry="90" fill="#6366f1" />
          <path d="M120 60v60a20 20 0 1 1-8-16V60h8z" fill="#38bdf8" />
          <circle cx="112" cy="140" r="12" fill="#f472b6" />
        </g>
      </svg>
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center justify-center">
        <div className="mb-6 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-teal-400 drop-shadow-xl" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-2v13" />
            <circle cx="6" cy="18" r="3" fill="#14b8a6" />
            <circle cx="18" cy="16" r="3" fill="#6366f1" />
          </svg>
        </div>
        <AuthForm initialMode={initialMode} onAuth={handleAuth} />
      </div>
    </div>
  );
}
