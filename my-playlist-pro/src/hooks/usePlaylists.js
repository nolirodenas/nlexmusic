import { useState, useEffect, useCallback } from 'react';
import { getPlaylists, addPlaylist, updatePlaylist, deletePlaylist } from '../api';

export default function usePlaylists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await getPlaylists();
      setPlaylists(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = useCallback(async (payload) => {
    const res = await addPlaylist(payload);
   
    if (res && res.id) {
      setPlaylists(prev => [{ id: res.id, name: payload.name, description: payload.description || '' }, ...prev]);
      return res;
    }
    await fetch();
    return res;
  }, [fetch]);

  const update = useCallback(async (payload) => {
    await updatePlaylist(payload);
    await fetch();
  }, [fetch]);

  const remove = useCallback(async (id) => {
    await deletePlaylist(id);
    setPlaylists(prev => prev.filter(p => p.id !== id));
  }, []);

  return { playlists, loading, error, fetch, create, update, remove };
}
