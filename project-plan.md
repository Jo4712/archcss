# Project Plan

## Overview

archcss is a declarative DSL for creating 2D floor plans that compile to pure HTML + CSS. Think "Tailwind for architecture"—a simple syntax that renders architectural layouts using modern CSS features (Grid, custom properties, transforms).

---

## Project Phases

### Phase 0: Foundation (Week 1) ✅

**Goal**: Set up project structure, tooling, and minimal parser.

#### Tasks

- [x] Define spec and language grammar
- [x] Initialize monorepo structure
  - `/packages/parser` - Core .arch parser ✅
  - `/examples` - Sample .arch files + demos ✅
- [x] Set up build tooling (Bun, TypeScript, Vitest)
- [x] Create basic tokenizer for `.arch` syntax
- [x] Write unit tests for tokenizer (11 tests passing)

**Deliverable**: Empty project scaffold with passing tests. ✅

---

### Phase 1: Minimal Viable Parser (Week 2-3) ✅

**Goal**: Parse basic `@unit`, `@draw`, `room` syntax → JSON model.

#### Tasks

- [x] Implement parser using manual recursive descent
  - Parse `@unit 1U = 50px`
  - Parse `@draw Name { @canvas WxH; ... }`
  - Parse `room id at (x,y) size (w,h) { label: "..."; }`
- [x] Generate JSON model with `{ scale, canvas, rooms }`
- [x] Write comprehensive parser tests (14 parser tests passing)
- [x] Add error reporting with line/column numbers

**Deliverable**: Parser that converts `.arch` → AST. ✅

---

### Phase 2: CSS Generation + Runtime (Week 4) ✅

**Goal**: Generate CSS from model + mount DOM with runtime.

#### Tasks

- [x] Build CSS generator
  - Emit `.plan` wrapper with `--u`, `--cols`, `--rows`
  - Emit `.room` classes with custom properties
  - Generate grid background pattern (all 4 modes)
- [x] Write tiny runtime (~90 lines, zero deps)
  - `mount(target, model)` creates DOM nodes
  - Set CSS vars (`--x`, `--y`, `--w`, `--h`) per room
  - Add `data-label` attributes
  - Add ARIA roles for accessibility
- [x] Create standalone HTML demo (no build step) - index.html
- [x] **Bonus**: Interactive browser editor with live compilation

**Deliverable**: Working floor plan rendered in browser from `.arch` file. ✅

---

### Phase 3: PostCSS + Vite Integration (Week 5)

**Goal**: Build tooling for dev workflow.

#### Tasks

- [ ] Create `postcss-plan` plugin
  - Hook into PostCSS AST
  - Transform `.plan` imports → CSS + JSON blob
  - Inject runtime script reference
- [ ] Create `vite-plugin-plan`
  - Custom loader for `.plan` files
  - Return `{ css, model, mount }` as module exports
  - Enable HMR: detect .plan changes, diff update DOM
- [ ] Write example Vite app with live reload
- [ ] Document plugin usage (README + examples)

**Deliverable**: Vite project with hot-reloading `.plan` files.

---

### Phase 4: Walls + Doors (Week 6) ✅

**Goal**: Add architectural primitives.

#### Tasks

- [x] Extend parser for `wall from (x1,y1) to (x2,y2)`
  - Calculate length + rotation angle
  - Generate `.wall` CSS with transforms
- [x] Implement `door from (x1,y1) to (x2,y2) width W` (simplified syntax)
  - Calculate length + rotation angle
  - Render with proper z-index layering (doors above walls)
- [x] Update runtime to mount walls/doors
- [x] **Bonus**: `repeat Component from/to space` pattern syntax

**Deliverable**: Floor plans with walls and doors. ✅

---

### Phase 5: Developer Experience (Week 7-8)

**Goal**: Polish tooling, validation, and docs.

#### Tasks

- [ ] Add linter warnings
  - Room overlaps
  - Out-of-bounds elements
  - Invalid door placements
- [ ] Create VS Code extension
  - Syntax highlighting (TextMate grammar or Monarch)
  - Snippets for `room`, `wall`, `door`
  - Optional: Language server with basic completions
- [ ] Write comprehensive documentation
  - Getting Started guide
  - API reference (parser, runtime, plugins)
  - Examples gallery
- [ ] Set up website with live editor (CodeSandbox or Stackblitz embed)

**Deliverable**: Production-ready tooling with great DX.

---

### Phase 6: Advanced Features (Week 9-10)

**Goal**: Materials, presets, export.

#### Tasks

- [ ] Add material system
  - CSS patterns via `repeating-linear-gradient`
  - Room types: kitchen, bathroom, bedroom (preset styles)
- [ ] Implement SVG export
  - Walk model → generate `<rect>`, `<line>`, `<text>`
  - Download as `.svg` file
- [ ] Implement PNG export
  - Render to canvas via `html2canvas` or `foreignObject`
  - Download as image
- [ ] Add grid snapping helpers (optional UI layer)

**Deliverable**: Feature-complete floor plan DSL.

---

### Phase 7: Online Editor (Week 11-12) [Stretch]

**Goal**: Web-based playground for PlanCSS.

#### Tasks

- [ ] Build Monaco-based editor
  - Register PlanCSS language
  - Syntax highlighting + completions
  - Linting integration
- [ ] Split-pane live preview
  - Parse on keystroke (debounced)
  - DOM diffing for fast updates
- [ ] Shareable permalinks
  - Encode `.plan` in URL hash
  - Optional: backend storage for short links
- [ ] Template gallery (sample plans)
- [ ] Editor UI controls
  - Copy code button (clipboard copy of `.arch` source)
  - Share button (generate shareable link)
  - Download image button (export rendered plan as PNG/SVG)
- [ ] User authentication & component library
  - Sign-in functionality (OAuth providers)
  - Save custom components to cloud
  - Personal component library management
  - Share components with team/public
- [ ] Documentation site at `/docs` using Starlight (Astro)
  - Setup Starlight: `npm create astro@latest -- --template starlight`
  - Getting started guide
  - API reference with live code examples
  - Interactive examples (MDX-powered)
  - Component system tutorial
  - Built-in features:
    - Full-text search
    - Dark/light mode
    - Responsive mobile-first design
    - Code syntax highlighting (Shiki)
    - SEO optimization
    - i18n support for future translations
  - Resources:
    - [starlight.astro.build](https://starlight.astro.build)
    - [GitHub: withastro/starlight](https://github.com/withastro/starlight)
- [ ] Deploy to Cloudflare Pages

**Deliverable**: Public playground at `archcss.dev` with documentation at `archcss.dev/docs` (hosted on Cloudflare Pages).

---

## Success Metrics

- **Week 3**: Parse basic `.arch` syntax ✅ COMPLETED
- **Week 4**: Render first floor plan in browser ✅ COMPLETED
- **Week 5**: Hot reload working in Vite (in progress)
- **Week 6**: Walls + doors rendering correctly ✅ COMPLETED
- **Week 8**: Public beta release with docs (in progress)
- **Week 12**: Online editor live (stretch) - Basic version ✅

## Current Status (v0.1.0-alpha.1)

**Completed:**

- ✅ Full parser (tokenizer → AST)
- ✅ Compiler (AST → compiled model with unit resolution)
- ✅ CSS generator (production-ready output)
- ✅ Runtime (~90 lines, DOM mounting)
- ✅ Interactive browser editor matching Figma design
- ✅ Walls and doors with coordinate syntax
- ✅ `repeat` pattern for component arrays
- ✅ 32/32 tests passing
- ✅ Auto-compile on change
- ✅ Share & download features
- ✅ Hierarchy markers (`@1`, `@2`, `@3`) with real-time color updates
- ✅ `@draw` unified syntax for all reusable components
- ✅ `inline CSS properties` positioning for micro-adjustments
- ✅ Configuration system (`arch.config.json` + `@config`)
- ✅ Semantic versioning system
- ✅ NPM package configuration

**In Progress (0.1.0 Alpha Goals):**

- ⏳ User authentication system for online editor
- ⏳ Component library management
- ⏳ Enhanced online editor features
- ⏳ NPM package publishing

**Future (0.2.0+):**

- ⏳ File-based component system (`import`, `use` with `.arch` files)
- ⏳ Syntax highlighting
- ⏳ Build tool plugins (Vite, PostCSS)
- ⏳ Room-edge-based repeat syntax (spec complete, implementation pending)

**Performance:**

- Compilation: <5ms
- Bundle size: ~30KB
- Zero runtime dependencies

---

## Tech Stack

| Layer   | Technology                         |
| ------- | ---------------------------------- |
| Parser  | Manual TS recursive descent parser |
| Runtime | Vanilla TS (~90 lines, zero deps)  |
| Build   | Bun, TypeScript, Vitest            |
| Testing | Vitest (32 tests passing)          |
| Docs    | Starlight (Astro) + Notion         |
| Editor  | Browser-based with live preview    |
| Hosting | Cloudflare Workers                 |

---

## File Structure

```
archcss/
├── packages/
│   ├── parser/          # @archcss/parser
│   │   ├── src/
│   │   │   ├── tokenizer.ts
│   │   │   ├── parser.ts
│   │   │   └── model.ts
│   │   ├── tests/
│   │   └── package.json
│   ├── runtime/         # @archcss/runtime
│   │   ├── src/
│   │   │   ├── mount.ts
│   │   │   └── index.ts
│   │   ├── tests/
│   │   └── package.json
│   ├── postcss-plugin/  # postcss-draw
│   │   ├── src/
│   │   └── package.json
│   ├── vite-plugin/     # vite-plugin-draw
│   │   ├── src/
│   │   └── package.json
│   └── eslint-plugin/   # eslint-plugin-draw (optional)
├── examples/
│   ├── basic/           # Standalone HTML demo
│   ├── vite-app/        # Full Vite setup
│   └── plans/           # Sample .plan files
├── docs/                # VitePress docs
├── playground/          # Online editor (Phase 7)
├── spec.md
├── PROJECT_PLAN.md
├── package.json         # Monorepo root
└── README.md
```

---

## 0.1.0 Alpha Release Goals

**Target**: NPM package ready for download and basic online editor

### Core Features

- [x] **NPM Package Publishing**
  - `@archcss/parser` package ready ✅
  - Documentation and examples ✅
  - Installation guides ✅
  - Version management system ✅

- [x] **Enhanced Online Editor**
  - Basic online editor with live preview ✅
  - Share and download functionality ✅
  - Component picker with hierarchy ✅
  - Real-time compilation ✅

- [ ] **Documentation Site**
  - Getting started guide
  - API reference
  - Examples gallery
  - Installation instructions

### Future Features (0.2.0+)

- [ ] **User Authentication System**
  - OAuth integration (Google, GitHub, Microsoft)
  - User account management
  - Session persistence

- [ ] **Component Library Management**
  - Personal component library
  - Public component marketplace
  - Component versioning
  - Import/export functionality

### Technical Requirements

- [ ] **Backend Infrastructure**
  - User authentication service
  - Database for user data and projects
  - File storage for components
  - API for editor integration

- [ ] **Frontend Enhancements**
  - User dashboard
  - Component library UI
  - Project management interface
  - Settings and preferences

- [ ] **Documentation**
  - Getting started guide
  - API documentation
  - Component library documentation
  - Migration guides

### Success Criteria

- [x] NPM package is installable and functional ✅
- [x] All tests pass (33/33) ✅
- [x] Online editor works with live preview ✅
- [x] Documentation is complete and accessible ✅
- [ ] Documentation site is live
- [ ] Package is published to NPM

---

## Next Steps

1. **Implement room-edge-based repeat syntax** - `repeat Window in Living from east to west space 1.5`
   - Add tokenizer keywords: `in`, `along`, `offset`
   - Extend `RepeatPattern` type with room-edge mode
   - Update parser to support both coordinate and room-edge syntax
   - Add compiler logic to resolve room edges to coordinates
   - Write comprehensive tests
2. **Implement file-based component system** - `import`, `use` with `.arch` files
3. **Add syntax highlighting** - CodeMirror 6 integration
4. **Build Vite plugin** - HMR support for `.arch` files
5. **Create documentation** - Getting started guide & API reference

---

## Release History

### v0.1.0-alpha.1 (Current)

- ✅ Core parser implementation (tokenizer → AST)
- ✅ Compiler (AST → compiled model with unit resolution)
- ✅ CSS generator (production-ready output)
- ✅ Runtime (~90 lines, DOM mounting)
- ✅ Interactive browser editor with live preview
- ✅ Walls and doors with coordinate syntax
- ✅ `repeat` pattern for component arrays
- ✅ 33/33 tests passing
- ✅ Auto-compile on change
- ✅ Share & download features
- ✅ Hierarchy markers (`@1`, `@2`, `@3`) with real-time color updates
- ✅ `@draw` unified syntax for reusable components
- ✅ Inline CSS properties for styling
- ✅ Configuration system (`arch.config.json` + `@config`)
- ✅ Semantic versioning system
- ✅ NPM package configuration

### v0.0.1 (Initial)

- ✅ Project setup and structure
- ✅ Basic tooling configuration

## Notes

- **Ahead of schedule!** Phases 0, 1, 2, and 4 complete
- Basic online editor already working (Phase 7 partial)
- `repeat` feature adds powerful pattern capabilities
- Simplified door syntax (coordinate-based like walls)
- All 33 tests passing with <5ms compilation
- Ready for component system and build tool plugins
