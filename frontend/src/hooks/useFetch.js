import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '../api/errorHandler';

// Small helper for "load data on mount" pages.
// Gives every data view the same loading / error / data states.
//   const { data, loading, error, reload, setData } = useFetch(() => getTeam(id), [id]);
export default function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(fetcher, deps);

  const reload = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      setData(await load());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload, setData };
}
