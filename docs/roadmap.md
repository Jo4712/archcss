# archcss Roadmap

## ✅ Completed (v0.1)

### Phase 1: Parser Foundation

- ✅ Tokenizer with all keywords
- ✅ Parser (AST generation)
- ✅ Type system
- ✅ Error handling with line numbers
- ✅ 32 passing tests

### Phase 2: Compiler & Runtime

- ✅ Compiler (AST → Compiled Model)
- ✅ Unit resolution (chained units)
- ✅ CSS generator
- ✅ Tiny runtime (~90 lines)
- ✅ DOM mounting with accessibility

### Phase 2.5: Interactive Editor

- ✅ Browser-based editor
- ✅ Auto-compile on change (500ms debounce)
- ✅ File management UI (Recent files)
- ✅ Share feature (URL encoding)
- ✅ Download .arch files
- ✅ Figma-matching design
- ✅ Responsive layout

### Language Features

- ✅ `@unit` declarations
- ✅ **Clean syntax** - `@unit = 50px;` and unitless numbers 🆕
- ✅ `@draw` blocks
- ✅ `@canvas` sizing
- ✅ `@grid` patterns (grid, vlines, hlines, dotted)
- ✅ `room` with positioning and labels
- ✅ `wall` from/to coordinates
- ✅ `door` from/to coordinates
- ✅ **`repeat` pattern syntax** 🆕
- ✅ Multiple unit support (px, cm, m, etc.)
- ✅ **`@draw` unified syntax** - replaces `@draw`/`@draw` for all reusable components 🆕
- ✅ **Hierarchy markers (`@1`, `@2`, `@3`)** - visual organization with color interpolation 🆕
- ✅ **Real-time hierarchy updates** - instant visual feedback in editor 🆕
- ✅ **`inline CSS properties` positioning** - CSS-like micro-adjustments (top, right, bottom, left) 🆕
- ✅ **Configuration system** - `arch.config.json` + `@config` directive 🆕

## 🚧 In Progress

### File-based Component System (Phase 3)

- ⏳ `@draw` definitions
- ⏳ `import` statements (implicit file resolution)
- ⏳ `use` component placement
- ⏳ Component file resolution
- ⏳ Relative positioning

## 📋 Planned

### Phase 3: File-based Component System (Week 5-6)

**Goal**: Reusable components across files

- [ ] **Component Definition**
  - `@draw Name { ... }` syntax
  - Store component metadata
- [ ] **Import Resolution**
  - `import Window;` (no file paths!)
  - Search algorithm: `Window.arch`, `components/Window.arch`, `window/index.arch`
  - Named imports: `import { Door.Standard, Door.Wide };`
  - Caching and circular dependency detection

- [ ] **Component Usage**
  - `use Component at (x, y);` placement
  - Relative positioning within rooms
  - Transform support: `rotate`, `scale`

- [ ] **Repeat Patterns** (✅ parsing done, rendering TODO)
  - Expand repeated components at compile time
  - Proper component styling (not just placeholder rooms)
  - Support component properties
  
- [ ] **Room-Edge-Based Repeat Syntax** 🆕
  - Semantic positioning: `repeat Window in Living from east to west space 1.5`
  - Cardinal direction support: north, south, east, west (maps to CSS borders)
  - Edge variants: `along <edge>` for single-edge distribution
  - Offset support: `offset 0.5` to inset from wall
  - Auto-coordinate resolution at compile time
  - Future: `between <roomA> and <roomB>` for shared walls

### Phase 4: Developer Experience (Week 7-8)

- [ ] **Syntax Highlighting** 🎯
  - Live syntax highlighting in browser editor
  - Color scheme: green for keywords, orange for numbers
  - CodeMirror or Monaco integration
  - Custom archcss language mode

- [ ] **VS Code Extension**
  - TextMate grammar for syntax highlighting
  - Snippets for `room`, `wall`, `door`, `repeat`
  - Language server (optional):
    - Go-to-definition for room IDs
    - Auto-completion for keywords
    - Error squiggles
    - Hover tooltips

- [ ] **Better Editor Features**
  - Line numbers
  - Code folding
  - Bracket matching
  - Find & replace
  - Multi-cursor editing

- [ ] **Error Handling**
  - Show errors inline in editor
  - Highlight problematic lines
  - Quick fixes
  - Validation warnings:
    - Room overlaps
    - Out-of-bounds elements
    - Invalid unit references

### Phase 5: Advanced Features (Week 9-10)

- [ ] **Materials & Styling**
  - Room types: kitchen, bathroom, bedroom (preset styles)
  - Material patterns via `repeating-linear-gradient`
  - Custom room colors
  - Wall thickness variations

- [ ] **Better Doors & Windows**
  - Door swing indicators (arc)
  - Window frames and panes
  - Component properties: `use Door { type: "sliding"; }`
  - Auto-calculate edge positions: `door on living.east;`
  - Integration with room-edge repeat syntax for window arrays

- [ ] **Export Features**
  - SVG export (walk model → generate shapes)
  - PNG export (via html2canvas)
  - PDF export
  - Share as image

- [ ] **Grid Enhancements**
  - Multiple grid overlays
  - Custom grid patterns
  - Measurement indicators
  - Dimension labels

### Phase 6: Build Tools (Week 11)

- [ ] **PostCSS Plugin** (`postcss-archcss`)
  - Transform `.arch` imports → CSS + JSON
  - Inject runtime script
  - Build-time compilation

- [ ] **Vite Plugin** (`vite-plugin-archcss`)
  - Custom `.arch` loader
  - Hot Module Replacement (HMR)
  - Fast refresh on file changes
  - Example Vite app

- [ ] **Webpack Loader**
  - Support for webpack projects
  - Integration with React/Vue apps

### Phase 7: Online Editor Polish (Week 12)

- [ ] **Monaco Editor Integration**
  - Professional code editor
  - Full syntax highlighting
  - IntelliSense completions
  - Error markers

- [ ] **Editor UI Controls**
  - Copy code button (clipboard copy)
  - Share button (generate shareable link)
  - Download image button (export as PNG/SVG)

- [ ] **Template Gallery**
  - Sample floor plans
  - Pre-built components
  - "Fork" functionality
  - Search templates

- [ ] **User Authentication & Cloud Storage**
  - Sign-in functionality (OAuth providers: Google, GitHub, etc.)
  - Save custom components to cloud
  - Personal component library management
  - Share components with team/community
  - Sync components across devices

- [ ] **Collaboration**
  - Shareable permalinks
  - Short link storage (optional backend)
  - Version history
  - Comments

- [ ] **Documentation Site (`/docs`)**
  - Getting started guide
  - API reference with examples
  - File-based component system tutorial
  - Interactive code playground embeds
  - Best practices guide

- [ ] **Mobile Support**
  - Touch-friendly editor
  - Responsive design
  - Gesture controls for pan/zoom

### Phase 8: 3D & Advanced (Stretch)

- [ ] **3D Preview**
  - CSS 3D transforms
  - Extrude walls (height variables)
  - Perspective view toggle

- [ ] **Curves & Ornaments** (Milestone 5)
  - `arc`, `spline`, `bezier` primitives
  - Corner radii
  - Classical orders (columns, mouldings)
  - Ornament library

- [ ] **Constraints & Snapping**
  - Snap to grid
  - Align helpers
  - Distribute evenly
  - Constraint solver

## 🎯 Next Milestones

### v0.2 (Next 2 weeks)

- File-based component system working
- Syntax highlighting in editor
- Better error messages

### v0.3 (Week 4-5)

- Vite plugin with HMR
- VS Code extension
- Template gallery

### v1.0 (Week 8)

- Production-ready
- Full documentation
- Public launch

## 📝 Notes

### Syntax Highlighting Approaches

**Option 1: Monaco Editor** (Recommended)

- Professional, battle-tested
- Used by VS Code
- Full language server support
- 500KB bundle size

**Option 2: CodeMirror 6**

- Modern, modular
- Smaller bundle (~200KB)
- Excellent performance
- Custom language modes

**Option 3: Custom Overlay** (Simple)

- Regex-based highlighting
- ~50 lines of code
- No dependencies
- Good enough for MVP
- ⚠️ Limitations: no proper tokenization, edge cases

**Decision**: Start with **CodeMirror 6** for good balance of features and bundle size.

---

Last updated: October 2, 2025
