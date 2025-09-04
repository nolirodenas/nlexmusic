import React from 'react';

export default function PlaylistManager({ playlists = [], selected, setSelected = () => {} }) {
  return (
    <div className="w-full mb-4">
      <div className="flex gap-2 flex-wrap">
        {playlists.map(p => (
          <button
            key={p.id}
            onClick={() => setSelected(String(p.id))}
            className={`px-4 py-2 rounded-full text-sm font-medium ${String(p.id) === String(selected) ? 'bg-gradient-to-r from-teal-400 to-violet-400 text-black' : 'bg-black/20 text-gray-200 hover:bg-black/30'}`}
            title={p.name}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}