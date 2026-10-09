// Pure helpers for the conversation history panel.

// Matches title or preview (case-insensitive); newest first by updatedAt/createdAt.
export const filterAndSortConversations = (conversations, searchTerm) => {
  const term = searchTerm.toLowerCase();
  return [...conversations]
    .filter(
      (conv) =>
        conv.title?.toLowerCase().includes(term) ||
        conv.preview?.toLowerCase().includes(term)
    )
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB - dateA;
    });
};

// view: "All" | "Favorites" | "Scheduled". In "All", favorites/scheduled come first.
export const groupConversations = (conversations, view) =>
  conversations.reduce((acc, conv) => {
    if (view === "All") {
      if (conv.isFavorite || conv.isScheduled) {
        acc.favoritesAndScheduled.push(conv);
      } else {
        acc.others.push(conv);
      }
    } else if (view === "Favorites" && conv.isFavorite) {
      acc.favoritesAndScheduled.push(conv);
    } else if (view === "Scheduled" && conv.isScheduled) {
      acc.favoritesAndScheduled.push(conv);
    }
    return acc;
  }, { favoritesAndScheduled: [], others: [] });

// Time of day (e.g. "09:41"), or "" for missing/invalid dates.
export const formatConversationTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};
