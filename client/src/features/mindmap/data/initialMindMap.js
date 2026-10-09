// Demo map shown on load. The mind map is not persisted yet; this is sample content.

export const INITIAL_NODES = [
  {
    id: 1,
    x: 250,
    y: 120,
    title: "What is Mental Clarity Map?",
    content: "A Mental Clarity Map is a simple tool that helps someone who feels overwhelmed, stressed, or emotionally stuck. By laying out their thoughts, feelings, and possible solutions visually, it guides the person to understand what’s really happening and discover clear stepsto improve their mental well-being.",
    tags: ["telegram", "article"],
    type: "main",
    expanded: true,
  },
  {
    id: 2,
    x: 80,
    y: 240,
    title: "Mind Visualization",
    content: "Mind Visualization involves the practice of using one's imagination...",
    tags: ["telegram", "article"],
    type: "secondary",
    expanded: true,
  },
  {
    id: 3,
    x: 80,
    y: 360,
    title: "3 types of Mind Models",
    content: "The three types of Mind Models include the computational mind model...",
    tags: ["telegram", "article"],
    type: "secondary",
    expanded: true,
  },
  {
    id: 4,
    x: 420,
    y: 180,
    title: "Mental health Awareness",
    content: "notion",
    tags: ["notion"],
    type: "note",
    expanded: false,
  },
  {
    id: 5,
    x: 420,
    y: 300,
    title: "",
    content: "Our AI uses cluster analysis to find patterns in mental-health data and offer supportive well-being insights. It’s not a substitute for professional care",
    tags: ["obsidian", "article"],
    type: "ai",
    expanded: true,
  }
];

export const INITIAL_CONNECTIONS = [
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 1, to: 4 },
  { from: 1, to: 5 }
];
