import axios from 'axios';

const API_URL = 'http://localhost:5000/api/songs';

export const fetchSongs = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching songs:', error);
        throw error;
    }
};

export const addSong = async (song) => {
    try {
        const response = await axios.post(API_URL, song);
        return response.data;
    } catch (error) {
        console.error('Error adding song:', error);
        throw error;
    }
};

export const updateSong = async (id, updatedSong) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, updatedSong);
        return response.data;
    } catch (error) {
        console.error('Error updating song:', error);
        throw error;
    }
};

export const deleteSong = async (id) => {
    try {
        await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
        console.error('Error deleting song:', error);
        throw error;
    }
};