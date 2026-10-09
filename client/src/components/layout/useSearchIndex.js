import { useCallback, useRef, useState } from 'react';
import * as conversationService from '../../services/conversationService';
import * as taskService from '../../services/taskService';
import * as noteService from '../../services/noteService';
import * as calendarService from '../../services/calendarService';

import { stripHtml } from '../../utils/text';

// Builds one searchable list from the user's conversations, tasks, notes and events.
// Loaded once, on first use; a failed source is skipped rather than blocking search.
export const useSearchIndex = () => {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | ready
  const started = useRef(false);

  const load = useCallback(async () => {
    if (started.current) return;
    started.current = true;
    setStatus('loading');
    const [convs, tasks, notes, events] = await Promise.allSettled([
      conversationService.getConversations(),
      taskService.getTasks(),
      noteService.getNotes(),
      calendarService.getEvents(),
    ]);
    const ok = (r) => (r.status === 'fulfilled' ? r.value : []);
    setItems([
      ...ok(convs).map((c) => ({ type: 'Chats', id: c.id, title: c.title || 'Untitled chat', text: c.lastMessage || '', to: '/chat', state: { conversationId: c.id } })),
      ...ok(tasks).map((t) => ({ type: 'Tasks', id: t.id, title: t.title, text: t.description || '', to: '/tasks' })),
      ...ok(notes).map((n) => ({ type: 'Journal', id: n.id, title: n.title || 'Untitled entry', text: stripHtml(n.content), to: `/notes?id=${encodeURIComponent(n.id)}` })),
      ...ok(events).map((e) => ({ type: 'Calendar', id: e.id, title: e.title, text: e.description || '', to: '/calendar' })),
    ]);
    setStatus('ready');
  }, []);

  const search = useCallback((query) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items.filter((i) => i.title.toLowerCase().includes(q) || i.text.toLowerCase().includes(q));
  }, [items]);

  return { load, search, status };
};
