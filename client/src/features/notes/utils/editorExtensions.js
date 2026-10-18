// TipTap extensions for the note editor. Changing these changes the stored HTML format.
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';

export const createEditorExtensions = () => [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
    bulletList: {
      keepMarks: true,
      keepAttributes: true,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: true,
    },
  }),
  Underline,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  }),
  Image.configure({
    inline: true,
    allowBase64: true,
  }),
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableCell,
  TableHeader,
  TextAlign.configure({
    types: ['heading', 'paragraph', 'image'],
    alignments: ['left', 'center','justify'],
    defaultAlignment: 'left',
  }),
  TextStyle,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  TaskList,
  TaskItem.configure({
    nested: true,
    HTMLAttributes: {
      class: 'task-item',
    },
  }),
  Placeholder.configure({
    placeholder: 'Start writing...',
    emptyEditorClass: 'is-editor-empty',
  }),
];
