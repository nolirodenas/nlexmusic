import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PlaylistManager from '../components/PlaylistManager';     
import { getPlaylists, getSongs } from '../api';

export default function Dashboard({ user, onLogout }) {
  
  useEffect(() => {
    document.documentElement.classList.add('bg-gradient-to-br', 'from-violet-950', 'via-black', 'to-violet-900', 'min-h-screen');
    document.body.classList.add('bg-transparent', 'min-h-screen');
    return () => {
      document.documentElement.classList.remove('bg-gradient-to-br', 'from-violet-950', 'via-black', 'to-violet-900', 'min-h-screen');
      document.body.classList.remove('bg-transparent', 'min-h-screen');
    };
  }, []);
  const playlistFormRef = useRef();
  const searchInputRef = useRef(null);
  const [playlists, setPlaylists] = useState([]);
  const [selected, setSelected] = useState('');
  const [tracks, setTracks] = useState([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const prevClickTimerRef = useRef(null);
  const nextClickTimerRef = useRef(null);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddPlaylist = () => {
    if (playlistFormRef.current) {
      playlistFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      playlistFormRef.current.focusInput && playlistFormRef.current.focusInput();
    }
  };
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => { fetchPlaylists(); }, []);
  async function fetchPlaylists() {
    try {
      const data = await getPlaylists();
      setPlaylists(data);
      if (data && data.length) setSelected(prev => prev || data[0].id);
    } catch (e) { console.error(e); }
  }

  useEffect(() => {
    if (!selected) return;
    (async () => {
      try {
        const t = await getSongs(selected);
        setTracks(t);
        setIndex(0);
      } catch (e) { console.error(e); }
    })();
  }, [selected]);

  useEffect(() => {
    function handleSongAdded(e) {
      if (e.detail && e.detail.playlistId && String(e.detail.playlistId) === String(selected)) {
        (async () => {
          try {
            const t = await getSongs(selected);
            setTracks(t);
            setIndex(0);
          } catch (e) { console.error(e); }
        })();
      }
    }
    window.addEventListener('playlist:songAdded', handleSongAdded);
    return () => window.removeEventListener('playlist:songAdded', handleSongAdded);
  }, [selected]);

  useEffect(() => {
    if (!tracks.length) {
      if (audioRef.current) audioRef.current.pause();
      return;
    }
    if (!audioRef.current) {
      audioRef.current = new window.Audio();
    }
    audioRef.current.src = tracks[index]?.url || '';
    audioRef.current.currentTime = 0;
    setProgress(0);
    setDuration(0);
    if (tracks[index]?.url) {
      audioRef.current.play().catch(()=>{});
    }
  }, [tracks, index]);

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => next();
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    let audioCtx, analyser, source, animationId;
    let dataArray, bufferLength;
    function drawVisualizer() {
      if (!canvasRef.current || !analyser) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
   
      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.strokeStyle = '#14b8a6';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();
      animationId = requestAnimationFrame(drawVisualizer);
    }
    function startVisualizer() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      source = audioCtx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      analyser.fftSize = 256;
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
      setShowVisualizer(true);
      drawVisualizer();
    }
    function stopVisualizer() {
      setShowVisualizer(false);
      if (animationId) cancelAnimationFrame(animationId);
      if (source) try { source.disconnect(); } catch {}
      if (analyser) try { analyser.disconnect(); } catch {}
    }
    audio.addEventListener('play', startVisualizer);
    audio.addEventListener('pause', stopVisualizer);
    audio.addEventListener('ended', stopVisualizer);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', startVisualizer);
      audio.removeEventListener('pause', stopVisualizer);
      audio.removeEventListener('ended', stopVisualizer);
      stopVisualizer();
    };
    
  }, [audioRef.current]);

  // cleanup click timers on unmount
  useEffect(() => {
    return () => {
      if (prevClickTimerRef.current) clearTimeout(prevClickTimerRef.current);
      if (nextClickTimerRef.current) clearTimeout(nextClickTimerRef.current);
    };
  }, []);

  function playPause() {
    const a = audioRef.current;
    if (!a || !a.src) return;
    if (a.paused) { a.play(); } else { a.pause(); }
  }
  function next() {
    if (!tracks.length) return;
    setIndex((prev) => (prev + 1) % tracks.length);
  }
  function prev() {
    if (!tracks.length) return;
    setIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  }
  function handlePrevClick() {
    if (prevClickTimerRef.current) return;
    prevClickTimerRef.current = setTimeout(() => {
      prev();
      prevClickTimerRef.current = null;
    }, 250);
  }
  function handleNextClick() {

    if (nextClickTimerRef.current) return;
    nextClickTimerRef.current = setTimeout(() => {
      next();
      nextClickTimerRef.current = null;
    }, 250);
  }
  async function handleNextDoubleClick() {
    if (nextClickTimerRef.current) {
      clearTimeout(nextClickTimerRef.current);
      nextClickTimerRef.current = null;
    }
    // switch to next playlist
    const list = filteredPlaylists;
    if (!list || list.length <= 1) return;
    const curIndex = list.findIndex(p => String(p.id) === String(selected));
    const nextPl = list[(curIndex + 1) % list.length];
    if (!nextPl) return;
    setSelected(nextPl.id);
    // tracks will refresh via effect; ensure index resets to 0 when tracks load
  }

// (Removed duplicate player controls block. Controls are rendered inside the playlist player section below.)

// The handleNextDoubleClick function can remain unchanged.
async function handleNextDoubleClick() {
     if (nextClickTimerRef.current) {
          clearTimeout(nextClickTimerRef.current);
          nextClickTimerRef.current = null;
     }
     // switch to next playlist and play first track immediately
     const list = filteredPlaylists;
     if (!list || list.length <= 1) return;
     const curIndex = list.findIndex(p => String(p.id) === String(selected));
     const nextPl = list[(curIndex + 1) % list.length];
     if (!nextPl) return;

     try {
          setSelected(nextPl.id);

          const t = await getSongs(nextPl.id);
          setTracks(t || []);
          const firstIdx = (t && t.length) ? 0 : 0;
          setIndex(firstIdx);

          if (audioRef.current && t && t[0] && t[0].url) {
                try {
                     audioRef.current.src = t[0].url;
                     try { audioRef.current.currentTime = 0; } catch {}
                     await audioRef.current.play();
                } catch (err) {
                     console.warn('play after next-doubleclick failed', err);
                }
          }
     } catch (err) {
          console.error('handleNextDoubleClick error', err);
     }
}

  async function handlePrevDoubleClick() {
    if (prevClickTimerRef.current) {
      clearTimeout(prevClickTimerRef.current);
      prevClickTimerRef.current = null;
    }
    // switch to previous playlist and play first track immediately
    const list = filteredPlaylists;
    if (!list || list.length <= 1) return;
    const curIndex = list.findIndex(p => String(p.id) === String(selected));
    const prevPl = list[(curIndex - 1 + list.length) % list.length];
    if (!prevPl) return;

    try {
      setSelected(prevPl.id);

      const t = await getSongs(prevPl.id);
      setTracks(t || []);
      const firstIdx = (t && t.length) ? 0 : 0;
      setIndex(firstIdx);

      if (audioRef.current && t && t[0] && t[0].url) {
        try {
          audioRef.current.src = t[0].url;
          try { audioRef.current.currentTime = 0; } catch {}
          await audioRef.current.play();
        } catch (err) {
          console.warn('play after prev-doubleclick failed', err);
        }
      }
    } catch (err) {
      console.error('handlePrevDoubleClick error', err);
    }
  }

  const vinylImg = (
    <div className="flex items-center w-full">
      <div
        className="flex-shrink-0 flex justify-center items-center"
        style={{ minWidth: 120, minHeight: 120 }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          className={`drop-shadow-2xl transition-transform duration-700 ${isPlaying ? 'animate-spin-slow' : ''}`}
          style={{
            display: 'block',
            margin: '0 auto',
            maxWidth: '120px',
            width: '120px',
            height: '120px',
          }}
        >
          <defs>
            <radialGradient id="vinylGradient" cx="60" cy="60" r="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="80%" stopColor="#222" />
            </radialGradient>
          </defs>
          <circle cx="60" cy="60" r="58" fill="url(#vinylGradient)" stroke="#c2b6d6ff" strokeWidth="4" />
          <circle cx="60" cy="60" r="40" fill="#0f172a" stroke="#14b8a6" strokeWidth="3" />
          <circle cx="60" cy="60" r="18" fill="#fff" stroke="#6366f1" strokeWidth="2" />
          <circle cx="60" cy="60" r="6" fill="#6366f1" />
          <circle cx="60" cy="60" r="2" fill="#14b8a6" />
        </svg>
      </div>
      <style>
        {`
          @keyframes spin-slow {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
          .animate-spin-slow {
            animation: spin-slow 2.5s linear infinite;
          }
          @media (max-width: 600px) {
            svg {
              max-width: 80px !important;
              height: 80px !important;
            }
          }
        `}
      </style>
    </div>
  );

  function formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec/60);
    const s = Math.floor(sec%60);
    return m + ':' + s.toString().padStart(2,'0');
  }
  const [newPlaylist, setNewPlaylist] = useState({ name: '' });
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  async function handleAddNewPlaylist(e) {
    e.preventDefault();
    if (!newPlaylist.name.trim()) return;
    setAdding(true);
    const nameBefore = newPlaylist.name.trim();
    try {
      const res = await fetch('/api/playlists.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameBefore })
      });
      const data = await res.json();
      if (data && data.id) {
        // refresh from server to ensure canonical ordering and fields
        await fetchPlaylists();
        setSelected(data.id);
        // open search and pre-fill so the new playlist is easy to find
        setSearchTerm(nameBefore);
        setShowSearch(true);
        setNewPlaylist({ name: '' });
      }
    } catch (e) { alert('Failed to add playlist'); }
    setAdding(false);
  }

  async function handleEditPlaylist(id) {
    if (!editName.trim()) return;
    try {
      await fetch('/api/playlists.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editName })
      });
      setPlaylists(playlists.map(p => p.id === id ? { ...p, name: editName } : p));
      setEditId(null);
      setEditName('');
    } catch (e) { alert('Failed to update playlist'); }
  }

  const filteredPlaylists = playlists.filter(p => {
    if (!searchTerm) return true;
    return p.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen w-full flex flex-col items-center" style={{margin:0,padding:0}}>
      <header className="sticky top-0 z-30 w-full bg-transparent/80 backdrop-blur border-b border-violet-800/60 shadow-lg flex justify-center">
        <div className="w-full max-w-2xl px-4 py-2 flex flex-col items-center gap-1">
          <img src="/logo.svg" alt="logo" className="w-10 h-10 drop-shadow-xl bg-gradient-to-br from-teal-700 to-violet-700 rounded-full p-1 border-4 border-violet-400/30" />
          <h1 className="text-2xl font-extrabold text-violet-200 tracking-tight drop-shadow text-center">Cloud Music</h1>
          <p className="text-sm text-gray-300 text-center">
            Welcome, <span className="text-teal-300 font-semibold">{user || 'User'}</span>
          </p>
        </div>
      </header>
      <section className="w-full border-y border-gray-700/30 bg-black/60 backdrop-blur-sm flex justify-center">
        <div className="w-full max-w-2xl px-4 py-10 flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-transparent-700 flex items-center justify-center shadow-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M18.685 19.095A8.96 8.96 0 0012 16.5c-2.61 0-4.972 1.12-6.685 2.895A9 9 0 1112 21a8.96 8.96 0 006.685-1.905zM15 9a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-xl">Your music, Organized 🎶</h2>
            <p className="text-base text-gray-300 mt-2">Create, favorite, and play your playlists with ease.</p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center items-center mt-2">
            <button
              className="px-6 py-2 rounded-2xl bg-gradient-to-r from-teal-600 to-violet-600 hover:from-teal-500 hover:to-violet-500 text-white font-bold shadow-xl transition border-2 border-transparent hover:border-teal-300"
              onClick={() => setShowSearch(s => !s)}
              aria-expanded={showSearch}
            >
            Search
            </button>
            {showSearch && (
              <div className="flex items-center gap-2">
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search playlists..."
                  aria-label="Search playlists"
                  className="px-3 py-2 rounded-2xl border border-violet-600 bg-black/70 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 w-56"
                />
                <button
                  className="px-3 py-2 rounded-2xl bg-violet-700 hover:bg-violet-600 text-white font-semibold"
                  onClick={() => { setSearchTerm(''); setShowSearch(false); }}
                >
                  ⌧ clear
                </button>
              </div>
            )}
            <button className="px-6 py-2 rounded-2xl bg-gradient-to-r from-violet-600 to-teal-500 hover:from-violet-500 hover:to-teal-400 text-white font-bold shadow-xl transition border-2 border-transparent hover:border-violet-300" onClick={handleAddPlaylist}>♫</button>
            <Link to="/account" className="px-6 py-2 rounded-2xl bg-black/60 border-2 border-violet-400 text-violet-200 font-bold hover:bg-violet-800/40 hover:text-white transition shadow-xl">⚙ Manage Account</Link>
          </div>
        </div>
      </section>
      <main className="w-full max-w-2xl px-4 sm:px-6 py-12 flex-1 flex flex-col items-center">
        <form onSubmit={handleAddNewPlaylist} className="flex gap-2 mb-6 w-full max-w-md">
          <input
            className="flex-1 px-4 py-2 rounded-xl border border-violet-400 bg-black/70 text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="New Playlist Name"
            value={newPlaylist.name}
            onChange={e => setNewPlaylist({ name: e.target.value })}
            required
          />
          <button type="submit" className="px-5 py-2 rounded-xl font-bold shadow bg-gradient-to-r from-teal-600 to-violet-600 text-white border-2 border-transparent hover:border-teal-300 transition" disabled={adding}>{adding ? 'Adding...' : '+ Add'}</button>
        </form>
        <section className="mb-12 w-full">
          <ul className="space-y-2">
            {filteredPlaylists.map(pl => (
              <li key={pl.id} className={`flex flex-col gap-2 items-stretch justify-between p-3 rounded-xl border ${String(selected) === String(pl.id) ? 'border-teal-400 bg-violet-900/40' : 'border-violet-700/40 bg-black/40'} shadow-sm transition-all`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl text-violet-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="inline w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-2v13" /><circle cx="6" cy="18" r="3" fill="currentColor" /></svg>
                    </span>
                    {editId === pl.id ? (
                      <input
                        className="px-2 py-1 rounded border border-violet-400 bg-black/80 text-white w-40 mr-2"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onBlur={() => handleEditPlaylist(pl.id)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleEditPlaylist(pl.id); } }}
                        autoFocus
                      />
                    ) : (
                      <span className="font-semibold text-base text-violet-200 truncate cursor-pointer" onClick={() => setSelected(pl.id)}>{pl.name}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition flex items-center gap-1" onClick={() => { setEditId(pl.id); setEditName(pl.name); }} title="Edit Playlist">
                      <span className="material-icons align-middle text-base">🖎edit</span> 
                    </button>
                    <button type="button" className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow transition flex items-center gap-1" onClick={() => setSelected(pl.id)} title="Upload Audio to Playlist">
                      <span className="material-icons align-middle text-base">↗ upload Audio</span>
                    </button>
                  </div>
                </div>
              
                {String(selected) === String(pl.id) && (
                  <form
                    className="flex flex-col sm:flex-row gap-2 items-center mt-2 w-full bg-black/60 border border-violet-700 rounded-2xl p-4 shadow"
                    onSubmit={async e => {
                      e.preventDefault();
                      const fileInput = e.target.elements.audiofile;
                      const titleInput = e.target.elements.title;
                      const file = fileInput.files[0];
                      if (!file) {
                        alert('Please select an audio file.');
                        return;
                      }
                      const data = new FormData();
                      data.append('file', file);
                      data.append('playlist_id', pl.id);
                      if (titleInput.value) data.append('title', titleInput.value);
                      try {
                        const res = await fetch('/api/upload_song_file.php', {
                          method: 'POST',
                          body: data,
                          credentials: 'include',
                        });
                        const result = await res.json();
                        if (!res.ok || !result.success) throw new Error(result.error || 'Upload failed');
             
                        const t = await getSongs(pl.id);
                        setTracks(t);
                    
                        let newIdx = 0;
                        if (result.url) {
                          newIdx = t.findIndex(song => song.url === result.url);
                        } else if (titleInput.value) {
                          newIdx = t.findIndex(song => song.title === titleInput.value);
                        }
                        setIndex(newIdx >= 0 ? newIdx : 0);
                        fileInput.value = '';
                        titleInput.value = '';
                
                        window.dispatchEvent(new CustomEvent('playlist:songAdded', { detail: { playlistId: pl.id } }));
                        alert('Audio uploaded!');
                      } catch (err) {
                        alert(err.message || 'Upload failed');
                      }
                    }}
                  >     
                    <label className="flex items-center gap-2 cursor-pointer text-violet-200 hover:text-teal-300">
                      <span className="material-icons text-2xl">⬆ Upload Audio</span>
                      <input
                        type="file"
                        name="audiofile"
                        accept="audio/mp3,audio/mpeg,audio/wav"
                        className="hidden"
                        required
                      />
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Song Title (optional)"
                      className="px-3 py-2 rounded-xl border border-violet-400 bg-black/70 text-white focus:outline-none focus:ring-2 focus:ring-violet-400 flex-1"
                    />
                    <button type="submit" className="px-5 py-2 rounded-xl font-bold shadow bg-gradient-to-r from-teal-600 to-violet-600 text-white border-2 border-transparent hover:border-teal-300 transition flex items-center gap-1">
                      <span className="material-icons align-middle text-base"></span> Upload
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </section>

        {playlists.length > 0 && (
          <section className="w-full max-w-xl flex flex-col items-center bg-gradient-to-br from-violet-900 via-black to-transparent-900 border-2 border-violet-700 rounded-3xl p-8 shadow-2xl mb-10">
            <div className="flex flex-col items-center w-full">
              <div className="mb-6 w-full flex flex-col sm:flex-row items-center gap-3"></div>
              <label htmlFor="playlist-player-select" className="text-violet-200 font-semibold text-base">🎵 Select Playlist to Play:</label>
              <select
                id="playlist-player-select"
                className="px-4 py-2 rounded-2xl border-2 border-violet-500 bg-black/80 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 flex-1 text-base shadow"
                value={selected}
                onChange={e => setSelected(e.target.value)}
              >
                {filteredPlaylists.map(pl => (
                  <option key={pl.id} value={pl.id}>{pl.name}</option>
                ))}
              </select>
              {tracks.length > 0 ? (
                <div>
                  <div className="mb-4 scale-110">{vinylImg}</div>
                  <div className="text-base font-bold text-teal-300 mb-1 text-center">
                    Playlist: {playlists.find(p => String(p.id) === String(selected))?.name || '—'}
                  </div>
                  <div className="text-xl font-extrabold text-violet-100 mb-2 truncate w-full text-center drop-shadow-lg">
                    <span className="inline-block align-middle mr-2">🎶</span>{tracks[index]?.title || 'Untitled'}
                  </div>
                  {showVisualizer && (
                    <div>
                      <div className={`flex justify-center items-center mb-1 w-full`}>
                        <span
                          className={`inline-block text-4xl select-none transition-transform duration-200 ${isPlaying ? 'animate-bounce' : ''}`}
                          style={{
                            animationDuration: isPlaying ? '0.6s' : undefined,
                            filter: 'drop-shadow(0 2px 8px #14b8a6)' }}
                          role="img" aria-label="dancing note"
                        >
                          🎵
                        </span>
                      </div>
                      <canvas ref={canvasRef} width={340} height={60} className="w-full max-w-lg h-16 mb-2 bg-black/80 rounded-xl border border-violet-900 shadow" />
                    </div>
                  )}
                  <audio
                    ref={audioRef}
                    src={tracks[index]?.url}
                    className="hidden"
                    controls
                    preload="auto"
                  />
                  <div className="flex items-center gap-6 w-full justify-center mt-4">
                    <button
                      onClick={handlePrevClick}
                      onDoubleClick={handlePrevDoubleClick}
                      className="p-3 rounded-full bg-violet-700 hover:bg-violet-500 text-white text-2xl shadow-lg transition flex items-center justify-center"
                      title="Previous"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={playPause}
                      className={`p-5 rounded-full ${isPlaying ? 'bg-teal-600' : 'bg-violet-600'} hover:bg-teal-500 text-white text-3xl shadow-xl transition flex items-center justify-center`}
                      title="Play/Pause"
                      type="button"
                    >
                      {isPlaying ? (
                        // Pause icon when playing
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="5" width="4" height="14" rx="1" />
                          <rect x="14" y="5" width="4" height="14" rx="1" />
                        </svg>
                      ) : (
                        // Play icon when paused/stopped
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={handleNextClick}
                      onDoubleClick={handleNextDoubleClick}
                      className="p-3 rounded-full bg-violet-700 hover:bg-violet-500 text-white text-2xl shadow-lg transition flex items-center justify-center"
                      title="Next"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={duration || 300}
                      value={progress}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setProgress(val);
                        if (audioRef.current) {
                          try { audioRef.current.currentTime = val; } catch {}
                        }
                      }}
                      className="flex-1 accent-teal-400 h-2 rounded-lg outline-none bg-violet-900/80"
                      step="0.01"
                    />
                    <span className="text-xs text-violet-300 w-12 text-left font-mono">{formatTime(duration)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-violet-300 text-center mt-8 text-lg font-semibold">No audio uploaded for this playlist yet.</div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}