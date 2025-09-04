import React, { createContext, useState, useEffect } from 'react';
import { fetchSongs, addSong, updateSong, deleteSong } from '../services/songService';
import { fetchPlaylists, addPlaylist, updatePlaylist, deletePlaylist } from '../services/playlistService';

export const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
    const [songs, setSongs] = useState([]);
    const [playlists, setPlaylists] = useState([]);

    useEffect(() => {
        const loadSongs = async () => {
            const fetchedSongs = await fetchSongs();
            setSongs(fetchedSongs);
        };

        const loadPlaylists = async () => {
            const fetchedPlaylists = await fetchPlaylists();
            setPlaylists(fetchedPlaylists);
        };

        loadSongs();
        loadPlaylists();
    }, []);

    const handleAddSong = async (song) => {
        const newSong = await addSong(song);
        setSongs([...songs, newSong]);
    };

    const handleUpdateSong = async (updatedSong) => {
        const song = await updateSong(updatedSong);
        setSongs(songs.map(s => (s.id === song.id ? song : s)));
    };

    const handleDeleteSong = async (id) => {
        await deleteSong(id);
        setSongs(songs.filter(s => s.id !== id));
    };

    const handleAddPlaylist = async (playlist) => {
        const newPlaylist = await addPlaylist(playlist);
        setPlaylists([...playlists, newPlaylist]);
    };

    const handleUpdatePlaylist = async (updatedPlaylist) => {
        const playlist = await updatePlaylist(updatedPlaylist);
        setPlaylists(playlists.map(p => (p.id === playlist.id ? playlist : p)));
    };

    const handleDeletePlaylist = async (id) => {
        await deletePlaylist(id);
        setPlaylists(playlists.filter(p => p.id !== id));
    };

    return (
        <MusicContext.Provider value={{
            songs,
            playlists,
            handleAddSong,
            handleUpdateSong,
            handleDeleteSong,
            handleAddPlaylist,
            handleUpdatePlaylist,
            handleDeletePlaylist
        }}>
            {children}
        </MusicContext.Provider>
    );
};