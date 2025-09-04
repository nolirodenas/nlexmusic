import React, { useState, useEffect, useContext } from 'react';
import { MusicContext } from '../contexts/MusicContext';
import PlaylistForm from '../components/PlaylistForm';
import PlaylistList from '../components/PlaylistList';

const PlaylistManager = () => {
    const { playlists, addPlaylist, updatePlaylist, deletePlaylist } = useContext(MusicContext);
    const [editingPlaylist, setEditingPlaylist] = useState(null);

    const handleAddPlaylist = (playlist) => {
        addPlaylist(playlist);
    };

    const handleEditPlaylist = (playlist) => {
        setEditingPlaylist(playlist);
    };

    const handleUpdatePlaylist = (updatedPlaylist) => {
        updatePlaylist(updatedPlaylist);
        setEditingPlaylist(null);
    };

    const handleDeletePlaylist = (playlistId) => {
        deletePlaylist(playlistId);
    };

    useEffect(() => {
        // Fetch playlists if needed
    }, []);

    return (
        <div>
            <h1>Playlist Manager</h1>
            <PlaylistForm 
                onSubmit={editingPlaylist ? handleUpdatePlaylist : handleAddPlaylist} 
                initialData={editingPlaylist} 
            />
            <PlaylistList 
                playlists={playlists} 
                onEdit={handleEditPlaylist} 
                onDelete={handleDeletePlaylist} 
            />
        </div>
    );
};

export default PlaylistManager;