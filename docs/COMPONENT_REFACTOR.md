# Athena AI — Phase 3 Component Refactor

Phase 3 split the large React components by responsibility without changing
behavior. Every split was checked in a real browser (Chromium via Playwright).
The original and refactored versions ran side by side, with each feature's
service replaced by an in-memory mock. Bugs found during the work are listed below.

Pattern used in each feature:

```
<Feature>.jsx           coordinates state and composes components
components/             rendering only; data and callbacks via props (PropTypes on all)
hooks/                  stateful behavior with one responsibility
utils/, data/           pure functions and static configuration
services/ (src/)        API calls (unchanged from Phase 2)
```

## What each large file became

| Before | After |
|--------|-------|
| `tasks/Task.jsx` (1070) | `Task.jsx` (249); `useTaskFilters`, `useScrollContainer`; `taskUtils` (filter/sort/group), `taskOptions` (icons, categories, suggestions); `TaskToolbar`, `TaskBulkActions`, `TaskViewControls`, `TaskForm`, `TaskTable`, `TaskGroups`, `TaskRow`, `TaskEditRow`, `OptionDropdown`, `TaskSuggestions` |
| `notes/components/DropdownMenu.jsx` (881) | It was the note's options menu, plus dictation and PDF export. Now `NoteOptionsMenu` + `NoteMenuItems` (MenuItem/MenuToggleItem/MenuDivider), `useDictation`, `notePdfExport`, `menuStyles`. The unused `VoiceRecordingHeaderIndicator` was removed. |
| `notes/NoteEditor.jsx` (749) | `NoteEditor.jsx` (143); `useNoteEditor` (note copy + TipTap editor + lock), `editorExtensions`; `NoteEditorHeader`, `NoteFormattingToolbar`, `NoteImageInput`, `NoteEditorStyles` |
| `components/sidebar/Sidebar.jsx` (597) | `Sidebar.jsx` (171); `SidebarUser`, `SidebarNavigation`, `ConversationPanel`, `ConversationListItem`, `Tooltip`, `conversationListUtils` |
| `calendar/Calendar.jsx` (499) + `CalendarSidebar.jsx` (527) | `Calendar.jsx` (144); `MonthView`, `WeekView`, `DayView`; `CalendarMiniMonth`, `EventEditPanel`, `CalendarInfoPanel` (the three components `CalendarSidebar` switched between); `useEventForm`, `useIsMobile`; `calendarEvents` (filter/color/positioning), grid helpers in `calendarDates` |
| `mindmap/MindMapInterface.jsx` (610) | `MindMapInterface.jsx` (142); `useMindMap`, `useNodeDrag`, `useContextMenu`, `useNotifications`; `mindMapUtils`, `initialMindMap`; `MindMapNode`, `MindMapConnections`, `MindMapContextMenu`, `MindMapMiniMap`, `MindMapZoomControls`, `MindMapToolbar`, `MindMapHeader`, `NotificationStack` |

### Sidebar duplication

`components/sidebar1.jsx` was deleted in commit f88e74d, and nothing in the
repository references it. There is one sidebar, used by Chat, Notes, Tasks and Mind Map.

### Shared UI (`components/ui/`)

Not created. No UI primitive is repeated across features today. Each feature's
small pieces (task option dropdown, note menu items, sidebar tooltip) differ in
markup and styling. Extracting shared primitives fits better with the Tailwind
cleanup in Phase 4.

### Conversations

Not split in this phase. Commit f88e74d already divided `Chat.jsx` into
`components/` and `hooks/`, and it is tightly coupled to the Phase 2 API work.
Most remaining ESLint errors are in this folder.

## Bugs fixed (each confirmed against the original in the browser)

| Feature | Bug | Cause |
|---------|-----|-------|
| Tasks | Typing in "Activity" lost focus after each character | `NewTaskForm` was defined inside the page's render, so it remounted on every keystroke |
| Calendar | Event form fields and "Search events" lost focus after each character | Panels were defined inside `CalendarSidebar`'s render |
| Notes | Dictation stopped as soon as it started | The effect depended on `isDictating`, and its cleanup called `stopDictation()` |
| Notes | The header "Stop" button did not stop dictation | It only hid the button |
| Notes | Text typed while a save was in flight was discarded | `setContent(initialNote.content)` ran on every save |
| Notes | "Lock page" blanked the whole page | Unmounting TipTap's `BubbleMenu` made React throw (`removeChild`); it is now always mounted and hides itself when the editor is read-only |
| Notes | Unhandled `AudioContext` close rejections; mic stayed open after dictation | Closed twice; tracks were never stopped |
| Mind map | Like on a seed node showed "NaN" | `likes` was undefined |
| Mind map | After deleting all nodes, new nodes got id `-Infinity` (duplicate keys, edited together) | `Math.max()` of an empty list |
| Mind map | React console warnings | `<style jsx>` (Next.js syntax) and NaN coordinates on the connection pulse |

## Known issues left as-is (behavior-visible; later phases)

- **Sidebar.**
  - The nav highlight never shows: `activeNav` starts as `"chat"`, which no item has.
  - The history panel's tabs write into Chat's own `currentView` state.
  - On non-chat pages the tabs do nothing.
- **Notes options menu.**
  - The footer always shows "Word count: 0", "Last edited by Unknown" and the current time, because notes don't have these fields.
  - 13 items only `console.log`, and the shortcut hints shown have no key handlers.
- **Calendar.**
  - There is no delete in the UI. The API supports it.
  - The form fields Participants, Conferencing, AI notes and Location aren't saved.
- **Mind map.**
  - It isn't persisted, and the demo map loads every time.
  - Any click on a node shows a 'Node "…" moved' toast.
  - The drag offset ignores zoom, so a node jumps when a drag starts at a zoom other than 100%.
  - The header and badges are hardcoded: "Sai's Mind", "+3", "2m", and the "A" badge.
  - Like buttons on seed nodes are zero-size until liked.
- **Tasks.** The "Athena AI Suggestions" are a fixed list.
