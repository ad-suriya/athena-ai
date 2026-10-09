// Tailwind class helpers for the note options menu (light/dark).

export const menuItemThemeClass = (isDarkMode) => (
  isDarkMode
    ? 'text-gray-300 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20'
    : 'text-ink hover:bg-brand-50'
);

export const menuIconClass = (isDarkMode) => `mr-3 ${isDarkMode ? 'text-gray-400' : 'text-brand-500'}`;
