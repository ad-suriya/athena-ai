import { Heart, Anchor, Brain, Coffee, Sparkles } from 'lucide-react';

export const categories = [
  { id: 'mood', label: 'Mood Check-In', icon: Heart },
  { id: 'calm', label: 'Calming Tools', icon: Anchor },
  { id: 'learn', label: 'Learn Skills', icon: Brain },
  { id: 'lifestuff', label: 'Daily Support', icon: Coffee },
  { id: 'choice', label: "AI's Suggestion", icon: Sparkles },
];

export const moodOptions = [
  'Guide me through a mood check-in',
  'Help me understand how I’m feeling',
  'Ask me reflective questions',
  'Help me identify emotional patterns',
  'Give me grounding questions',
];

export const calmingOptions = [
  'Guide me through a breathing exercise',
  'Walk me through grounding',
  'Help me calm anxiety',
  'Lead a short mindfulness exercise',
  'Help me regulate after stress',
];

export const learnOptions = [
  'Teach me a CBT technique',
  'Help me reframe a negative thought',
  'Explain a mental health concept',
  'Teach me emotional regulation skills',
  'Guide me through a self-compassion exercise',
];

export const lifeOptions = [
  'Help me plan my day with wellbeing in mind',
  'Give me a gentle productivity tip',
  'Suggest a self-care activity',
  'Help me set daily intentions',
  'Check in on my energy and offer guidance',
];

export const choiceOptions = [
  'Suggest what I may need right now',
  'Give me a random wellness exercise',
  'Share an uplifting message',
  'Give me a journaling prompt',
  'Provide a small grounding activity',
];

export const categoryOptions = {
  mood: moodOptions,
  calm: calmingOptions,
  learn: learnOptions,
  lifestuff: lifeOptions,
  choice: choiceOptions,
};

