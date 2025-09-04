import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';

function RequireAuth({ user, children }) {
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function AppRouter() {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    window.location.href = '/';
  };
  
  return (
    <Routes> 
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth initialMode="login" onAuth={setUser} />} />
      <Route path="/login" element={<Auth initialMode="login" onAuth={setUser} />} />
      <Route path="/register" element={<Auth initialMode="register" onAuth={setUser} />} />
      <Route path="/dashboard" element={
        <RequireAuth user={user}>
          <Dashboard user={user} onLogout={handleLogout} />
        </RequireAuth>
      } />
      <Route path="/account" element={
        <RequireAuth user={user}>
          <Account user={user} onLogout={handleLogout} />
        </RequireAuth>
      } />
    </Routes>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <AppRouter />
      </div>
    </BrowserRouter>
  );
}
