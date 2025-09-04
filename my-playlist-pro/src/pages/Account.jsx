import React, { useEffect, useState } from "react";
import { getPlaylists, changePassword, updatePlaylist, deletePlaylist } from "../api";
import { useNavigate } from "react-router-dom";

export default function Account({ user, onLogout }) {
  useEffect(() => {
    document.documentElement.classList.add('bg-gradient-to-br', 'from-violet-950', 'via-black', 'to-violet-900', 'min-h-screen');
    document.body.classList.add('bg-transparent', 'min-h-screen');
    return () => {
      document.documentElement.classList.remove('bg-gradient-to-br', 'from-violet-950', 'via-black', 'to-violet-900', 'min-h-screen');
      document.body.classList.remove('bg-transparent', 'min-h-screen');
    };
  }, []);

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const data = await getPlaylists();
      setPlaylists(Array.isArray(data) ? data : []);
    } catch (err) {
      setMsg(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleOpen = (id) => navigate("/dashboard");
  const handleToggleFavorite = async (pl) => {
    try {
      await updatePlaylist({ ...pl, favorite: pl.favorite ? 0 : 1 });
      load();
    } catch (err) {
      setMsg(err.message || "Failed to update favorite");
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this playlist?")) return;
    try {
      await deletePlaylist(id);
      load();
    } catch (err) {
      setMsg(err.message || "Failed to delete");
    }
  };

  return (
  <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-b from-black via-violet-900 to-black" style={{ margin: 0, padding: 0 }}>
    <header className="sticky top-0 z-30 w-full bg-transparent/80 backdrop-blur border-b border-violet-800/60 shadow-lg flex justify-center">
      <div className="w-full max-w-4xl px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="logo"
            className="w-12 h-12 drop-shadow-xl bg-gradient-to-br from-teal-700 to-white-700 rounded-full p-1 border-4 border-violet-400/30"
          />
          <div>
            <h1 className="text-3xl font-extrabold text-violet-200 tracking-tight drop-shadow">Cloud Music</h1>
            <p className="text-sm text-gray-300">
              Account: <span className="text-teal-300 font-semibold">{user || "User"}</span>
            </p>
          </div>
        </div>
      </div>
    </header>

      <section className="w-full border-y border-gray-700/30 bg-black/60 backdrop-blur-sm flex justify-center">
        <div className="w-full max-w-2xl px-4 py-8 flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-transparent-700 flex items-center justify-center shadow-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M12 2a9 9 0 100 18 9 9 0 000-18zm1 12h-2v-2h2v2zm0-4h-2V6h2v4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-xl">Account Settings</h2>
            <p className="text-base text-gray-300 mt-2">Manage your playlists, favorites and change your password.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/dashboard")} className="px-6 py-2 rounded-2xl bg-gradient-to-r from-teal-600 to-violet-600 text-white font-bold shadow-xl">← Dashboard</button>
            <button onClick={() => (onLogout ? onLogout() : navigate("/login"))} className="px-6 py-2 rounded-2xl bg-gradient-to-r from-red-600 to-pink-500 text-white font-bold shadow-xl">⍈ Logout</button>
          </div>
        </div>
      </section>

      <main className="w-full max-w-2xl px-4 sm:px-6 py-10 flex-1 flex flex-col items-center">
        <div className="w-full bg-gradient-to-br from-violet-900/60 via-black/40 to-transparent-900 border-2 border-violet-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
          {msg && (
            <div className="text-center text-white bg-teal-700/80 rounded-xl py-3 px-4 animate-pulse shadow">
              {msg}
            </div>
          )}

          <section className="bg-black/60 border border-violet-700/40 rounded-xl p-4 shadow-lg">
            <h3 className="text-2xl font-bold text-violet-200 mb-4 text-center">🎵 Your Playlists</h3>
            {loading ? (
              <div className="text-center text-gray-300">Loading…</div>
            ) : (
              <ul className="space-y-3">
                {playlists.length === 0 ? (
                  <li className="text-gray-400 text-center">You haven’t created any playlists yet.</li>
                ) : (
                  playlists.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-black/40 border border-violet-700/30 shadow">
                      <span className="flex-1 truncate text-white font-semibold">
                        {p.name} {p.favorite && <span className="text-yellow-400">★</span>}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => handleOpen(p.id)} className="px-3 py-1 rounded-xl bg-gradient-to-r from-teal-600 to-violet-600 text-white font-bold text-xs">▶ Play</button>
                        <button onClick={() => handleToggleFavorite(p)} className={`px-3 py-1 rounded-xl font-bold text-xs ${p.favorite ? "bg-yellow-400 text-yellow-900" : "bg-black/40 text-yellow-400"}`}>
                          {p.favorite ? "Unfavorite" : "Favorite"}
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="px-3 py-1 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-xs">🗑 Delete</button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </section>

          <section className="bg-yellow-50/90 border border-yellow-400/40 rounded-xl p-4 shadow-lg">
            <h3 className="text-2xl font-bold text-yellow-600 mb-4 text-center">⭐ Favorite Playlists</h3>
            {loading ? (
              <div className="text-center text-gray-600">Loading…</div>
            ) : (
              <ul className="space-y-3">
                {playlists.filter((p) => p.favorite).length === 0 ? (
                  <li className="text-gray-500 text-center">You have no favorite playlists.</li>
                ) : (
                  playlists.filter((p) => p.favorite).map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-yellow-100 border border-yellow-300 shadow">
                      <span className="flex-1 truncate font-semibold text-yellow-900">{p.name} <span className="text-yellow-500">★</span></span>
                      <div className="flex gap-2">
                        <button onClick={() => handleOpen(p.id)} className="px-3 py-1 rounded-xl bg-gradient-to-r from-teal-600 to-violet-600 text-white font-bold text-xs">▶ Play</button>
                        <button onClick={() => handleToggleFavorite(p)} className="px-3 py-1 rounded-xl bg-yellow-400 text-yellow-900 font-bold text-xs">Unfavorite</button>
                        <button onClick={() => handleDelete(p.id)} className="px-3 py-1 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-xs">🗑 Delete</button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </section>

          <section className="bg-black/60 border border-gray-800 rounded-xl p-4 shadow-lg">
            <h3 className="text-lg font-bold text-violet-200 mb-3 text-center">🔑 Change Password</h3>
            <ChangePasswordForm onSuccess={() => setMsg("Password changed!")} />
          </section>
        </div>
      </main>
    </div>
  );
}

function ChangePasswordForm({ onSuccess = () => {} }) {
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await changePassword(cur, nw);
      onSuccess();
      setCur("");
      setNw("");
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 w-full">
      <div className="flex flex-col gap-2">
        <input value={cur} onChange={(e) => setCur(e.target.value)} placeholder="Current password" type="password"
          className="p-2 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-gray-500 text-sm transition" required />
        <input value={nw} onChange={(e) => setNw(e.target.value)} placeholder="New password" type="password"
          className="p-2 rounded-lg bg-gray-100 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-gray-500 text-sm transition" required />
      </div>
      {error && <div className="text-red-500 text-center font-semibold animate-pulse text-xs">{error}</div>}
      <button disabled={loading} className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-violet-600 text-white font-bold shadow hover:from-teal-500 hover:to-violet-500 transition disabled:opacity-60 disabled:cursor-not-allowed text-sm">
        {loading ? "Changing..." : "Change Password"}
      </button>
    </form>
  );
}