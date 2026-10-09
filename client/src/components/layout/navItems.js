// Sidebar navigation. `match` lists path prefixes that mark the item active.
// Wellness tools open other screens with a preset (see AppSidebar).
import { BarChart3, BookOpen, CalendarDays, CheckSquare, GraduationCap, Home, Leaf, MessageCircle, Smile, Network } from 'lucide-react';

export const MAIN_NAV = [
  { label: 'Home', to: '/home', icon: Home, match: ['/home'] },
  { label: 'Chat', to: '/chat', icon: MessageCircle, match: ['/chat'] },
  { label: 'Tasks', to: '/tasks', icon: CheckSquare, match: ['/tasks'] },
  { label: 'Journal', to: '/notes', icon: BookOpen, match: ['/notes'] },
  { label: 'Mind Map', to: '/mindmap', icon: Network, match: ['/mindmap'] },
  { label: 'Calendar', to: '/calendar', icon: CalendarDays, match: ['/calendar'] },
  { label: 'Insights', to: '/settings', icon: BarChart3, match: ['/settings'] },
];

export const WELLNESS_TOOLS = [
  { label: 'Mood Check-In', icon: Smile, to: '/home', state: { openMoodCheckIn: true } },
  { label: 'Calming Tools', icon: Leaf, to: '/chat', state: { category: 'calm' } },
  { label: 'Learn Skills', icon: GraduationCap, to: '/chat', state: { category: 'learn' } },
];

