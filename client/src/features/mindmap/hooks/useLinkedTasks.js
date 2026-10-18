import { useCallback, useEffect, useState } from 'react';
import * as mindmapService from '../../../services/mindmapService';

// Tasks linked to mind map nodes, with progress from their stored status:
// { [nodeId]: { tasks, progress } }. Loaded once the map is (enabled), and again on refresh().
// A failed load leaves the last result; links are an extra and never block the map.
export const useLinkedTasks = (enabled) => {
  const [linked, setLinked] = useState({});

  const refresh = useCallback(() => mindmapService.getLinkedTasks()
    .then(setLinked)
    .catch(() => {}), []);

  useEffect(() => {
    if (enabled) refresh();
  }, [enabled, refresh]);

  return { linked, refresh };
};
