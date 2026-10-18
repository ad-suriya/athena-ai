import { useEffect, useState } from 'react';
import * as insightsService from '../../../services/insightsService';

// Loads one month of activity (monthIndex 0–11). Changing either number reloads.
export const useMonthActivity = (year, monthIndex) => {
  const key = `${year}-${monthIndex}`;
  const [state, setState] = useState({ key: null, data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    insightsService.getMonthActivity(new Date(year, monthIndex, 1))
      .then((data) => { if (!cancelled) setState({ key: `${year}-${monthIndex}`, data, error: null }); })
      .catch((err) => { if (!cancelled) setState({ key: `${year}-${monthIndex}`, data: null, error: err.message }); });
    return () => { cancelled = true; };
  }, [year, monthIndex]);

  // Results for an older month are ignored while the new one loads.
  const current = state.key === key;
  return { data: current ? state.data : null, error: current ? state.error : null, isLoading: !current };
};
