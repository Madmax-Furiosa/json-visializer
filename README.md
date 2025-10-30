## JSON Visualizer

A lightweight React app that converts any JSON into an interactive, auto-laid-out node graph. Paste JSON, generate a visual tree with colors by type, search nodes/values, and explore with pan/zoom controls.

### Key Points

- **Instant JSON-to-Graph**: Generates nodes/edges from nested objects and arrays.
- **Auto Layout (ELK)**: Uses ELK layered layout for clear spacing and hierarchy.
- **Type-aware styling**: Distinct colors for objects, arrays, keys, and primitive values.
- **Search & Highlight**: Search by key or dotted path suffix (e.g., `user.address`); focuses and highlights the match.
- **Sample & Validation**: Load a sample JSON; errors are caught and shown clearly.
- **UX Enhancements**: Mini-map, zoom controls, smooth edges, toast notifications, and animated header text.
- **Modern Stack**: React 19 + Vite 7, Tailwind CSS v4, @xyflow/react, ELK, motion.

### Demo Flow

1. Paste JSON in the left panel (or click "Load Sample JSON").
2. Click "Generate Tree" to visualize.
3. Use the search bar to find a node/value; press Enter or click the send icon.
4. Pan/zoom the canvas; use the mini-map and controls to navigate.
5. Click "Clear" to reset.

## Tech Stack

- **React 19** with **Vite 7**
- **@xyflow/react** for graph rendering (nodes, edges, minimap, controls)
- **ELK (elkjs)** for layered graph layout
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **motion** for header text animation; **react-toastify** for toasts
- **lucide-react** for icons

## Getting Started

### Prerequisites

- Node.js 18+ recommended

### Install

```bash
npm install
```

### Run (Dev)

```bash
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage Notes

- **Valid JSON only**: Input must be valid JSON. Parse errors are displayed above the editor.
- **Search behavior**: Matches the last segment of a dotted path against node labels, and when a key is found, tries to highlight its leaf value if present.
- **Layout**: ELK runs before render; large JSON can take longer to layout.
- **Styling by type**:
  - Objects: purple tones
  - Arrays: green tones
  - Keys: blue tones
  - Primitive values: amber/yellow tones

## Project Structure

```text
.
├─ src/
│  ├─ components/
│  │  ├─ Flow.jsx          # Main visualizer: parsing, layout, search, UI
│  │  └─ TextRotate.jsx    # Animated rotating header text
│  ├─ App.jsx               # Wraps Flow with ReactFlowProvider
│  ├─ main.jsx              # App bootstrap
│  └─ index.css             # Tailwind v4 base and page layout
├─ index.html               # Root HTML
├─ vite.config.js           # Vite + Tailwind plugin
├─ eslint.config.js         # ESLint configuration
└─ package.json             # Scripts and dependencies
```

## Scripts

- **dev**: start the Vite dev server
- **build**: production build
- **preview**: preview the production build
- **lint**: run ESLint

## Implementation Details

- Graph layout is computed via ELK using a layered, top-to-bottom configuration.
- Nodes/edges are generated recursively from JSON; leaf primitives get their own value node.
- Search highlights the node, removes other node shadows, and recenters/zooms to the match.
- UI includes mini-map, background grid, and controls from `@xyflow/react`.

## Roadmap Ideas

- Full JSONPath querying for precise matches
- Node collapsing/expansion for large trees
- Export to PNG/SVG/JSON of layout
- Theme switcher and custom color palettes
