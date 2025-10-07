# archcss Development Log

> Tracking key decisions, milestones, and design choices

## October 3, 2025

### ✅ File Extension Decision

- **Decided**: Use `.arch` as file extension
- **Rationale**: Clean, relates to architecture, "Tailwind for architecture" vibe
- **Status**: Implemented in parser, editor, and all documentation

### ✅ Core Syntax: `@draw`

- **Decided**: Use `@draw` instead of `@plan`, `@component`, etc.
- **Rationale**: Universal term that works at any scale (floor plans, rooms, furniture, details)
- **Status**: Implemented across all documentation

### ✅ Hierarchy Markers: `@1`, `@2`, `@3`

- **Decided**: Use simple numeric at-rules for visual hierarchy
- **Rationale**: Flexible, not tied to specific architectural meaning, clean syntax
- **Features**:
  - Colors interpolate from darkest (lowest number) to lightest (highest number)
  - Component picker groups by hierarchy
  - Real-time updates in editor as you type
  - No marker = grey at bottom of picker
- **Status**: Documented in specification with Figma reference

### ✅ Configuration System: `arch.config.json`

- **Decided**: Support project-wide and per-file configuration
- **Location**:
  - Project root: `arch.config.json`
  - Per-file: `@config` directive
- **Features**:
  - Unit defaults and DPI
  - Grid settings (size, color, alpha)
  - Hierarchy colors customization
  - Module resolution paths
  - Editor preferences (auto-save, debounce, snap-to-grid)
  - Export options (format, scale, include grid)
- **Precedence**: Inline `@config` > `arch.config.json` > defaults
- **Status**: Documented in specification

### ✅ Documentation Structure

- **Files**:
  - `specification.md` - Complete language specification (includes component system)
  - `project-plan.md` - Project overview and status
  - `ROADMAP.md` - Development roadmap and milestones
  - `LOG.md` - This file - decision tracking
- **Status**: All files kept in sync

### ✅ Real-time Editor Behavior

- **Hierarchy markers**: Live updates as user types
- **Color transitions**: Instant visual feedback
- **Component picker**: Auto-reorganizes on hierarchy changes
- **Reference**: Figma design linked in specification
- **Status**: Behavior documented

## Design Principles Established

1. **Simplicity**: Clean, minimal syntax
2. **Flexibility**: Works at any scale (building → furniture → details)
3. **Intuitiveness**: Real-time visual feedback, CSS-like conventions
4. **Composability**: Everything is reusable via `@draw`
5. **Progressive Enhancement**: Features work independently and together

## Removed from Documentation

- Name/extension brainstorming (decision made: `.arch`)
- Alternative syntax explorations (consolidated to `@draw`)

## Next Steps

See `ROADMAP.md` for upcoming features and milestones.

---

_This log is updated as major decisions are made. For implementation details, see specification.md._

### ✅ CSS-First Philosophy (Manifesto)

- **Decided**: Use standard CSS wherever possible; invent syntax only when necessary
- **Rationale**:
  - Developers already know CSS
  - Access to all CSS features (current and future)
  - Future-proof and standards-based
  - Minimal learning curve
- **Approach**:
  - archcss provides: spatial positioning, composition, hierarchy
  - Everything else is standard CSS: colors, borders, margins, transforms, animations, etc.
  - Use `margin: 0.5U;` instead of custom directives
  - Use `background: yellow;` instead of proprietary syntax
- **Examples**:
  - ❌ Don't create: `@nudge`, `@color`, `@rotate`, `@shadow`
  - ✅ Instead use: `margin`, `background`, `transform`, `box-shadow`
- **Status**: Documented in manifesto section

### ✅ Inline CSS Properties

- **Decided**: Support any CSS property directly within blocks
- **Syntax**: `room id at (x,y) size (w,h) { property: value; }`
- **Rationale**:
  - More powerful and flexible than custom directives
  - Familiar to all web developers
  - Access to full CSS specification
- **Replaces**: Earlier `@nudge` concept (removed)
- **Status**: Documented in specification with comprehensive examples

## Implementation Progress (October 3, 2025)

### ✅ Inline CSS Properties - IMPLEMENTED

- **Parser**: Updated to recognize `property: value;` syntax in room blocks
- **Types**: Added `css?: Record<string, string>` to Room and CompiledModel
- **Compiler**: Passes CSS properties through to compiled model
- **Runtime**: Applies CSS properties via `element.style.setProperty()`
- **Build**: Parser bundle built successfully (33.77 KB)
- **Status**: Functional and ready for testing

### 📦 Example Files Created

1. **ground-floor.arch** - Realistic floor plan based on architectural drawing
   - Multiple rooms (kitchen, bedrooms, bathrooms)
   - Complex wall layouts
   - Inline CSS styling demonstrated
   - Limitations clearly marked in comments

2. **css-styling-demo.arch** - CSS properties showcase
   - Linear and radial gradients
   - Box shadows and filters
   - Borders and border-radius
   - Margins for positioning
   - Transforms and transitions
   - Pattern backgrounds

3. **LIMITATIONS.md** - Comprehensive feature matrix
   - What's possible now
   - What's not yet implemented
   - Workarounds for missing features
   - Milestone references

4. **examples/README.md** - Example documentation
   - Feature showcase
   - Usage instructions
   - New features highlighted

### 🔧 Technical Changes

**Files Modified:**

- `packages/parser/src/parser.ts` - Added CSS property parsing
- `packages/parser/src/types.ts` - Added css field to Room and CompiledModel
- `packages/parser/src/compiler.ts` - Pass through CSS properties
- `packages/parser/src/runtime.ts` - Apply CSS properties to DOM elements
- `index.html` - Added new example file buttons and loading logic

**Build Status:**

- JavaScript bundle: ✅ Built successfully (33.77 KB)
- TypeScript types: ⚠️ Some strict type warnings (non-blocking)
- Runtime: ✅ Functional
- Examples: ✅ Ready to test

### 🎯 Next Steps

1. Fix remaining TypeScript strict mode warnings
2. Test inline CSS properties in browser
3. Add CSS property support for walls and doors (not just rooms)
4. Create more example components with advanced CSS
5. Update tests to cover CSS property parsing
