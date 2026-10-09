// Tailwind class helpers for the note options menu (light/dark).

export const menuItemThemeClass = (isDarkMode) => (
  isDarkMode
    ? 'text-gray-300 hover:text-[#F5D9D1] hover:bg-[#E65C52]/20'
    : 'text-gray-700 hover:text-[#E14C42] hover:bg-gradient-to-r hover:from-[#F5D9D1] hover:to-[#F5D9D1]/50'
);

export const menuIconClass = (isDarkMode) => `mr-3 ${isDarkMode ? 'text-gray-400' : 'text-[#E65C52]'}`;
