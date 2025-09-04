import React, { useState, useEffect, useContext } from 'react';
import { MusicContext } from '../contexts/MusicContext';
import SongForm from '../components/SongForm';
import SongList from '../components/SongList';
import { songService } from '../services/songService';

const SongManager = () => {
    const { songs, setSongs } = useContext(MusicContext);
    const [editingSong, setEditingSong] = useState(null);

    useEffect(() => {
        const fetchSongs = async () => {
            const fetchedSongs = await songService.getSongs();
            setSongs(fetchedSongs);
        };
        fetchSongs();
    }, [setSongs]);

    const handleAddOrUpdateSong = async (song) => {
        if (editingSong) {
            await songService.updateSong(editingSong.id, song);
        } else {
            await songService.addSong(song);
        }
        setEditingSong(null);
        const updatedSongs = await songService.getSongs();
        setSongs(updatedSongs);
    };

    const handleEditSong = (song) => {
        setEditingSong(song);
    };

    const handleDeleteSong = async (id) => {
        await songService.deleteSong(id);
        const updatedSongs = await songService.getSongs();
        setSongs(updatedSongs);
    };

    return (
        <div>
            <h1>Song Manager</h1>
            <SongForm 
                onSubmit={handleAddOrUpdateSong} 
                editingSong={editingSong} 
                setEditingSong={setEditingSong} 
            />
            <SongList 
                songs={songs} 
                onEdit={handleEditSong} 
                onDelete={handleDeleteSong} 
            />
        </div>
    );
};

export default SongManager;