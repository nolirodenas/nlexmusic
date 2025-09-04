import axios from 'axios';

const API_URL = 'http://localhost:5000/api/playlists';

export const getPlaylists = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching playlists: ' + error.message);
    }
};

export const addPlaylist = async (playlist) => {
    try {
        const response = await axios.post(API_URL, playlist);
        return response.data;
    } catch (error) {
        throw new Error('Error adding playlist: ' + error.message);
    }
};

export const updatePlaylist = async (id, updatedPlaylist) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, updatedPlaylist);
        return response.data;
    } catch (error) {
        throw new Error('Error updating playlist: ' + error.message);
    }
};

export const deletePlaylist = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
        throw new Error('Error deleting playlist: ' + error.message);
    }
};