import React from 'react';

const PlaylistList = ({ playlists, onEdit, onDelete }) => {
    return (
        <div>
            <h2>Your Playlists</h2>
            <ul>
                {playlists.map((playlist) => (
                    <li key={playlist.id}>
                        <span>{playlist.name}</span>
                        <button onClick={() => onEdit(playlist)}>Edit</button>
                        <button onClick={() => onDelete(playlist.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PlaylistList;