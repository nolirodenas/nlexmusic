import { useState, useEffect, useRef } from 'react';
export default function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef();

  useEffect(() => {
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;
    
    let finalUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      if (!url.startsWith('/api') && !url.startsWith('/pages')) {
        finalUrl = `/api/${url.replace(/^\/+/, '')}`;
      }
    }
    const opts = {
      credentials: 'include',
      ...options,
      signal,
    };

    let mounted = true;

    async function fetchData() {
      setLoading(true);

      try {
        const res = await fetch(finalUrl, opts);

        const contentType = res.headers.get('content-type') || '';
        const payload = contentType.includes('application/json')
          ? await res.json()
          : await res.text();

        if (!res.ok) {
          throw new Error(
            payload?.error || payload || 'Request failed'
          );
        }

        if (mounted) setData(payload);
      } catch (err) {
        if (err.name !== 'AbortError' && mounted) {
          setError(err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      mounted = false;
      abortRef.current.abort();
    };
  }, [url, JSON.stringify(options)]);

  return { data, error, loading };
}
