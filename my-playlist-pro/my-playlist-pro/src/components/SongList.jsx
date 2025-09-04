import React from 'react';

const SongList = ({ songs, onEdit, onDelete, onPlay }) => {
    return (
        <div className="song-list">
            <h2>Song List</h2>
            <ul>
                {songs.map((song) => (
                    <li key={song.id}>
                        <span>{song.title} - {song.artist}</span>
                        <button onClick={() => onPlay(song)}>Play</button>
                        <button onClick={() => onEdit(song)}>Edit</button>
                        <button onClick={() => onDelete(song.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SongList;