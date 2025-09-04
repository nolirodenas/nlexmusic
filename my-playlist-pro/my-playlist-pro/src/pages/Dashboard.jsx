import React, { useContext, useState } from 'react';
import { MusicContext } from '../contexts/MusicContext';
import SongList from '../components/SongList';
import PlaylistList from '../components/PlaylistList';
import Player from '../components/Player';
import SongForm from '../components/SongForm';
import PlaylistForm from '../components/PlaylistForm';

const Dashboard = () => {
    const { songs, playlists } = useContext(MusicContext);
    const [selectedSong, setSelectedSong] = useState(null);
    const [isEditingSong, setIsEditingSong] = useState(false);
    const [isEditingPlaylist, setIsEditingPlaylist] = useState(false);

    const handleEditSong = (song) => {
        setSelectedSong(song);
        setIsEditingSong(true);
    };

    const handleEditPlaylist = (playlist) => {
        // Logic for editing playlist
        setIsEditingPlaylist(true);
    };

    const handleSongSubmit = (song) => {
        // Logic for adding or updating song
        setIsEditingSong(false);
        setSelectedSong(null);
    };

    const handlePlaylistSubmit = (playlist) => {
        // Logic for adding or updating playlist
        setIsEditingPlaylist(false);
    };

    return (
        <div className="dashboard">
            <h1>Music Playlist Dashboard</h1>
            <div className="song-manager">
                <h2>Manage Songs</h2>
                <SongForm 
                    song={selectedSong} 
                    onSubmit={handleSongSubmit} 
                    isEditing={isEditingSong} 
                />
                <SongList songs={songs} onEdit={handleEditSong} />
            </div>
            <div className="playlist-manager">
                <h2>Manage Playlists</h2>
                <PlaylistForm 
                    onSubmit={handlePlaylistSubmit} 
                    isEditing={isEditingPlaylist} 
                />
                <PlaylistList playlists={playlists} onEdit={handleEditPlaylist} />
            </div>
            <Player selectedSong={selectedSong} />
        </div>
    );
};

export default Dashboard;