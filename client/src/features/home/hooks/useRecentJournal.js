import * as noteService from '../../../services/noteService';
import { useAsyncData } from './useAsyncData';

// Most recently edited journal entry (notes), or null.
const loadLatest = async () => {
  const notes = await noteService.getNotes();
  return [...notes].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))[0] || null;
};

export const useRecentJournal = () => {
  const { data, isLoading, error } = useAsyncData(loadLatest, null);
  return { entry: data, isLoading, error };
};
