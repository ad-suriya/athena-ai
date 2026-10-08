// Static UI configuration for the Wellness Tracker (not user data).
import {
  CheckSquare, Target, Star, Heart, Users, Book, Music, Camera,
  Coffee, Zap, Home, Gift, Sun, Moon, Brain, Activity, Headphones,
  Sprout, Droplets, Wind, Leaf
} from 'lucide-react';

export const TASK_ICONS = {
  Heart, Brain, Activity, Users, Leaf, Music, Book, Coffee,
  Sun, Moon, Headphones, Sprout, Droplets, Wind, Camera, Gift,
  CheckSquare, Target, Star, Home, Zap
};

export const ICON_NAMES = Object.keys(TASK_ICONS);

export const WELLNESS_CATEGORIES = [
  'Dopamine Activities',
  'Fitness & Movement',
  'Social Care & Connection',
  'Mindfulness / Meditation',
  'Self-Care Routines'
];

export const STATUS_OPTIONS = ['To Do', 'In progress', 'Done'];

export const STATUS_DROPDOWN_OPTIONS = [
  { value: 'To Do', label: 'To Do', color: 'bg-red-100 text-red-600' },
  { value: 'In progress', label: 'In progress', color: 'bg-blue-100 text-blue-600' },
  { value: 'Done', label: 'Done', color: 'bg-green-100 text-green-600' }
];

export const EMPTY_TASK = {
  title: '',
  status: 'To Do',
  category: [],
  notes: '',
  icon: 'Heart'
};

export const VIEW_MODES = {
  ALL: 'All Activities',
  GROUPED: 'Grouped by status'
};

export const SUGGESTIONS = [
  { id: 's1', title: "Take a 10-minute walk", category: ["Fitness & Movement"], icon: 'Activity', notes: "Fresh air can boost your mood instantly" },
  { id: 's2', title: "5-minute breathing exercise", category: ["Mindfulness / Meditation"], icon: 'Wind', notes: "Focus on deep, calming breaths" },
  { id: 's3', title: "Text a friend you care about", category: ["Social Care & Connection"], icon: 'Users', notes: "Strengthen your social connections" },
  { id: 's4', title: "Listen to your favorite song", category: ["Dopamine Activities"], icon: 'Music', notes: "Music can elevate your mood" },
  { id: 's5', title: "Drink a glass of water", category: ["Self-Care Routines"], icon: 'Droplets', notes: "Stay hydrated for better mental clarity" },
  { id: 's6', title: "Write down 3 positive things", category: ["Mindfulness / Meditation"], icon: 'Book', notes: "Practice positive thinking" },
  { id: 's7', title: "Stretch for 5 minutes", category: ["Fitness & Movement"], icon: 'Activity', notes: "Release tension from your body" },
  { id: 's8', title: "Plan a small treat for yourself", category: ["Dopamine Activities"], icon: 'Gift', notes: "Reward yourself for small victories" }
];
