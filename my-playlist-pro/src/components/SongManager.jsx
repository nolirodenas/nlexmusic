import React, { useEffect, useRef, useState } from 'react';

export default function SongManager({
  tracks = [],
  index = 0,
  setIndex = () => {},
  playlists = [],
  selected,
  setSelected = () => {}
}) {
  const audioRef = useRef(null);
  const prevClickTimer = useRef(null);
  const nextClickTimer = useRef(null);
  const canvasRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showVisualizer, setShowVisualizer] = useState(false);

  const DOUBLE_CLICK_MS = 300;

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (!tracks.length) {
      a.pause();
      a.src = '';
      setProgress(0);
      setDuration(0);
      setIsPlaying(false);
      return;
    }
    a.src = tracks[index]?.url || '';
    try { a.currentTime = 0; } catch {}
    setProgress(0);
    setDuration(0);
    a.play().catch(() => {});
  }, [tracks, index]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setProgress(a.currentTime || 0);
    const onMeta = () => setDuration(a.duration || 0);
    const onEnd = () => handleNextImmediate();

    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('ended', onEnd);

    let audioCtx = null, analyser = null, source = null, raf = null, dataArray = null, bufferLen = 0;
    function draw() {
      if (!canvasRef.current || !analyser) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      const slice = canvas.width / bufferLen;
      let x = 0;
      for (let i = 0; i < bufferLen; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += slice;
      }
      ctx.strokeStyle = '#14b8a6';
      ctx.lineWidth = 2;
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    }
    function startVis() {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        source = audioCtx.createMediaElementSource(a);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyser.fftSize = 256;
        bufferLen = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLen);
        setShowVisualizer(true);
        if (!raf) draw();
      } catch {}
    }
    function stopVis() {
      setShowVisualizer(false);
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      try { source && source.disconnect(); } catch {}
      try { analyser && analyser.disconnect(); } catch {}
      try { if (audioCtx && audioCtx.state !== 'closed') audioCtx.close(); } catch {}
      audioCtx = analyser = source = dataArray = null;
      bufferLen = 0;
    }

    a.addEventListener('play', startVis);
    a.addEventListener('pause', stopVis);
    a.addEventListener('ended', stopVis);

    return () => {
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('ended', onEnd);
      a.removeEventListener('play', startVis);
      a.removeEventListener('pause', stopVis);
      a.removeEventListener('ended', stopVis);
      stopVis();
    };
  }, [tracks, index]);

  useEffect(() => {
    function onPlayAfterLoad(e) {
      if (!e?.detail) return;
      if (String(e.detail.playlistId) !== String(selected)) return;
      const incoming = Array.isArray(e.detail.tracks) && e.detail.tracks.length ? e.detail.tracks : tracks;
      if (!incoming || !incoming.length) return;
      setIndex(0);
      const a = audioRef.current;
      if (!a) return;
      try {
        a.src = incoming[0]?.url || a.src;
        try { a.currentTime = 0; } catch {}
        a.play().catch(() => {});
      } catch {}
    }
    window.addEventListener('playlist:playAfterLoad', onPlayAfterLoad);
    return () => window.removeEventListener('playlist:playAfterLoad', onPlayAfterLoad);
  }, [selected, tracks, setIndex]);

  useEffect(() => {
    return () => {
      if (prevClickTimer.current) clearTimeout(prevClickTimer.current);
      if (nextClickTimer.current) clearTimeout(nextClickTimer.current);
    };
  }, []);

  function playAt(i) {
    if (!tracks.length) return;
    const idx = ((i % tracks.length) + tracks.length) % tracks.length;
    setIndex(idx);
    const a = audioRef.current;
    if (!a) return;
    try { a.pause(); } catch {}
    a.src = tracks[idx]?.url || '';
    try { a.currentTime = 0; } catch {}
    a.play().catch(() => {});
  }

  function togglePlay() {
    const a = audioRef.current;
    if (!a || !a.src) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  }

  function handleNextImmediate() {
    if (!tracks.length) return;
    playAt(index + 1);
  }
  function handlePrevImmediate() {
    if (!tracks.length) return;
    playAt(index - 1);
  }

  function switchPlaylist(direction = 1) {
    if (!playlists || playlists.length <= 1 || !selected) return false;
    const cur = playlists.findIndex(p => String(p.id) === String(selected));
    if (cur < 0) return false;
    const np = playlists[(cur + direction + playlists.length) % playlists.length];
    if (!np) return false;
    setSelected(String(np.id));
    setIndex(0);
    return true;
  }

  function handleNext() {
    if (nextClickTimer.current) {
      clearTimeout(nextClickTimer.current);
      nextClickTimer.current = null;
      switchPlaylist(1);
      return;
    }
    nextClickTimer.current = setTimeout(() => {
      handleNextImmediate();
      nextClickTimer.current = null;
    }, DOUBLE_CLICK_MS);
  }

  function handlePrev() {
    if (prevClickTimer.current) {
      clearTimeout(prevClickTimer.current);
      prevClickTimer.current = null;
      switchPlaylist(-1);
      return;
    }
    prevClickTimer.current = setTimeout(() => {
      handlePrevImmediate();
      prevClickTimer.current = null;
    }, DOUBLE_CLICK_MS);
  }

  function onSeek(e) {
    const v = Number(e.target.value);
    const a = audioRef.current;
    if (a) {
      try { a.currentTime = v; } catch {}
    }
    setProgress(v);
  }

  function fmt(s) {
    if (s == null || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  return (
    <div className="w-full max-w-xl">
      <div className="mb-4 text-center">
        <div className="text-xl font-extrabold text-violet-100 truncate">{tracks[index]?.title || 'Untitled'}</div>
        <div className="text-sm text-gray-300">{tracks.length} track(s)</div>
      </div>

      {tracks.length > 0 ? (
        <>
          <div className="flex justify-center mb-3">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-violet-800 to-teal-600 flex items-center justify-center text-white text-4xl shadow-lg">🎶</div>
          </div>

          {showVisualizer && (
            <canvas
              ref={canvasRef}
              width={340}
              height={60}
              className="w-full h-16 mb-2 bg-black/80 rounded-xl border border-violet-900 shadow"
            />
          )}

          <audio ref={audioRef} className="hidden" controls preload="auto" />

          <div className="flex items-center gap-6 w-full justify-center mt-4">
            <button onClick={handlePrev} className="p-3 rounded-full bg-violet-700 hover:bg-violet-500 text-white text-2xl shadow-lg">◀</button>
            <button onClick={togglePlay} className={`p-5 rounded-full ${isPlaying ? 'bg-teal-600' : 'bg-violet-600'} hover:bg-teal-500 text-white text-3xl shadow-xl`}>
              {isPlaying ? '▮▮' : '▶'}
            </button>
            <button onClick={handleNext} className="p-3 rounded-full bg-violet-700 hover:bg-violet-500 text-white text-2xl shadow-lg">▶</button>
          </div>

          <div className="flex items-center gap-3 w-full mt-6">
            <span className="text-xs text-violet-300 w-12 text-right font-mono">{fmt(progress)}</span>
            <input type="range" min={0} max={duration || 300} value={progress} onChange={onSeek} className="flex-1 accent-teal-400 h-2 rounded-lg outline-none bg-violet-900/80" step="0.01" />
            <span className="text-xs text-violet-300 w-12 text-left font-mono">{fmt(duration)}</span>
          </div>

          <ul className="mt-4 space-y-1 max-h-52 overflow-auto w-full">
            {tracks.map((t, i) => (
              <li key={t.id} className={`p-2 rounded ${i === index ? 'bg-violet-800/60 border border-teal-400' : 'bg-black/40 border border-violet-700/30'}`} onClick={() => playAt(i)}>
                <div className="flex justify-between items-center">
                  <div className="truncate">{t.title}</div>
                  <div className="text-xs text-gray-400">{t.duration ? fmt(t.duration) : ''}</div>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="py-8 text-center text-gray-400">No tracks to play.</div>
      )}
    </div>
  );
}