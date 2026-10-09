import * as wellnessService from '../../../services/wellnessService';
import { useAsyncData } from './useAsyncData';

// Check-ins from the last 7 days, newest first.
const loadWeek = async () => {
  const from = new Date();
  from.setDate(from.getDate() - 7);
  const entries = await wellnessService.getWellnessEntries({ from });
  return [...entries].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
};

// Latest check-in, this week's count, and saving a new check-in.
export const useWellbeing = () => {
  const { data: entries, setData, isLoading, error } = useAsyncData(loadWeek, []);

  const checkIn = async (values) => {
    const saved = await wellnessService.createWellnessEntry(values);
    setData((prev) => [saved, ...prev]);
    return saved;
  };

  return { latest: entries[0] || null, weekCount: entries.length, isLoading, error, checkIn };
};
