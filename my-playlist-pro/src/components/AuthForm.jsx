import React, { useState } from 'react';
import { register, login } from '../api';

export default function AuthForm({ onAuth, initialMode = 'login' }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (isLogin) {
        res = await login({ email: form.email, password: form.password });
      } else {
        res = await register({ username: form.username, email: form.email, password: form.password });
      }
      if (res && res.success) {
        onAuth(res.username || form.username);
      } else {
        setError((res && res.error) || 'Unexpected response');
      }
    } catch (err) {
      setError(err.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

    return (
      <div className="max-w-md mx-auto mt-12 p-8 bg-black/80 rounded-3xl shadow-2xl border border-violet-700/40 backdrop-blur-lg">
        <h2 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-violet-400 via-violet-600 to-teal-400 bg-clip-text text-transparent drop-shadow-lg flex items-center justify-center gap-2">
          {isLogin ? (
            <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21v-2a4 4 0 00-8 0v2" /><circle cx="12" cy="7" r="4" fill="#6366f1" /></svg>
          ) : (
            <svg className="w-7 h-7 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          )}
          {isLogin ? 'Sign In to Playlist Pro' : 'Create Your Account'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400">
                <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5.121 17.804A9 9 0 1112 21a8.96 8.96 0 01-6.879-3.196z' /><circle cx='12' cy='9' r='4' fill='#6366f1' /></svg>
              </span>
              <input
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                className="block w-full pl-10 pr-4 py-3 bg-black/70 border-2 border-violet-700 text-violet-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder-gray-400 transition"
                onFocus={() => setError('')}
                required
              />
            </div>
          )}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400">
              <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 12l-4 4-4-4m8-4H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2v-8a2 2 0 00-2-2z' /></svg>
            </span>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="block w-full pl-10 pr-4 py-3 bg-black/70 border-2 border-violet-700 text-violet-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-gray-400 transition"
              onFocus={() => setError('')}
              required
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400">
              <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 0v2m0 4h.01M17 16v-1a4 4 0 00-8 0v1m8 0a4 4 0 01-8 0' /></svg>
            </span>
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="block w-full pl-10 pr-4 py-3 bg-black/70 border-2 border-violet-700 text-violet-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-400 transition"
              onFocus={() => setError('')}
              required
            />
          </div>
          {error && <div className="flex items-center justify-center gap-2 text-red-500 text-center font-semibold mb-2"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" /><circle cx="12" cy="12" r="10" /></svg>{error}</div>}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-violet-400 to-teal-300 hover:from-violet-300 hover:to-teal-200 text-violet-900 font-bold rounded-2xl shadow-lg transition text-lg border-2 border-transparent hover:border-teal-400 disabled:opacity-60 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="#6366f1" strokeWidth={4} fill="none" /><path d="M12 2a10 10 0 0110 10" stroke="#14b8a6" strokeWidth={4} /></svg>
            ) : (
              isLogin ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21v-2a4 4 0 00-8 0v2" /><circle cx="12" cy="7" r="4" fill="#6366f1" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            )}
            {loading ? (isLogin ? 'Signing in...' : 'Registering...') : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        <button
          className="w-full mt-4 text-violet-500 hover:text-teal-500 underline text-sm font-semibold transition flex items-center justify-center gap-2"
          onClick={() => setIsLogin(!isLogin)}
          onDoubleClick={() => setForm({ username: '', email: '', password: '' })}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </div>
    );
}
