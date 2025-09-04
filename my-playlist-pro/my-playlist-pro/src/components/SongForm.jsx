import React, { useState, useEffect } from 'react';
import { addSong, updateSong } from '../services/songService';

const SongForm = ({ selectedSong, onSongSaved }) => {
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [album, setAlbum] = useState('');
    const [duration, setDuration] = useState('');

    useEffect(() => {
        if (selectedSong) {
            setTitle(selectedSong.title);
            setArtist(selectedSong.artist);
            setAlbum(selectedSong.album);
            setDuration(selectedSong.duration);
        } else {
            setTitle('');
            setArtist('');
            setAlbum('');
            setDuration('');
        }
    }, [selectedSong]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const songData = { title, artist, album, duration };

        if (selectedSong) {
            updateSong(selectedSong.id, songData).then(() => {
                onSongSaved();
            });
        } else {
            addSong(songData).then(() => {
                onSongSaved();
            });
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Title:</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Artist:</label>
                <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Album:</label>
                <input
                    type="text"
                    value={album}
                    onChange={(e) => setAlbum(e.target.value)}
                />
            </div>
            <div>
                <label>Duration:</label>
                <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                />
            </div>
            <button type="submit">{selectedSong ? 'Update Song' : 'Add Song'}</button>
        </form>
    );
};

export default SongForm;