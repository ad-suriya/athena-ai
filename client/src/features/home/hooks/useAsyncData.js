import { useCallback, useEffect, useState } from 'react';

// Loads data once with `loader` and exposes { data, setData, isLoading, error, reload }.
// Results that arrive after unmount are ignored.
export const useAsyncData = (loader, initial) => {
  const [data, setData] = useState(initial);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    loader()
      .then((result) => { if (!cancelled) { setData(result); setError(null); } })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
    // `loader` is expected to be stable (module-level or useCallback).
  }, [loader, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { data, setData, isLoading, error, reload };
};
