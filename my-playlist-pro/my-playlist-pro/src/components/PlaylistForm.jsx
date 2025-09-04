import React, { useState, useEffect } from 'react';
import { addPlaylist, updatePlaylist } from '../services/playlistService';

const PlaylistForm = ({ playlist, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (playlist) {
            setName(playlist.name);
            setDescription(playlist.description);
        }
    }, [playlist]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const playlistData = { name, description };

        if (playlist) {
            updatePlaylist(playlist.id, playlistData).then(onSave);
        } else {
            addPlaylist(playlistData).then(onSave);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Description:</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <button type="submit">{playlist ? 'Update Playlist' : 'Add Playlist'}</button>
        </form>
    );
};

export default PlaylistForm;