// Sidebar navigation. `match` lists path prefixes that mark the item active.
import { BarChart3, BookOpen, CalendarDays, CheckSquare, Home, MessageCircle, Network } from 'lucide-react';
// Wellness tools are hidden for now; restore GraduationCap, Leaf and Smile above with them.
// import { GraduationCap, Leaf, Smile } from 'lucide-react';

export const MAIN_NAV = [
  { label: 'Home', to: '/home', icon: Home, match: ['/home'] },
  { label: 'Chat', to: '/chat', icon: MessageCircle, match: ['/chat'] },
  { label: 'Tasks', to: '/tasks', icon: CheckSquare, match: ['/tasks'] },
  { label: 'Journal', to: '/notes', icon: BookOpen, match: ['/notes'] },
  { label: 'Mind Map', to: '/mindmap', icon: Network, match: ['/mindmap'] },
  { label: 'Calendar', to: '/calendar', icon: CalendarDays, match: ['/calendar'] },
  { label: 'Insights', to: '/insights', icon: BarChart3, match: ['/insights'] },
];

// Wellness tools open other screens with a preset (see AppSidebar). Hidden for now.
// export const WELLNESS_TOOLS = [
//   { label: 'Mood Check-In', icon: Smile, to: '/home', state: { openMoodCheckIn: true } },
//   { label: 'Calming Tools', icon: Leaf, to: '/chat', state: { category: 'calm' } },
//   { label: 'Learn Skills', icon: GraduationCap, to: '/chat', state: { category: 'learn' } },
// ];

