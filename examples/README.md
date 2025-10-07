# ArchCSS Examples

This directory contains example `.arch` files demonstrating various features.

## Plans (`/plans`)

### `home.arch` - Basic Example

Simple floor plan with rooms, walls, and doors using standard syntax.

### `ground-floor.arch` - Real Floor Plan Recreation ✨ NEW

Recreation of a realistic ground floor plan based on actual architectural drawing.

**Features demonstrated:**

- Multiple rooms (kitchen, bedrooms, bathrooms)
- Complex wall layouts
- Door placements
- Inline CSS styling (backgrounds, borders)
- Grid overlay

**Limitations marked:**

- Door swing arcs (requires curves - Milestone 5)
- Fixtures (requires component library)
- Dimension annotations

### `css-styling-demo.arch` - CSS Properties Showcase ✨ NEW

Demonstrates the full power of inline CSS properties in ArchCSS.

**Features demonstrated:**

- Linear and radial gradients
- Border styling (solid, dashed, custom colors)
- Box shadows
- Border radius
- Filters and opacity
- Margins for positioning adjustments
- Transforms (rotate, scale)
- Pattern backgrounds (repeating-linear-gradient)

**Example CSS properties used:**

```javascript
room kitchen {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  margin: 0.2U;
  transform: rotate(1deg);
}
```

### Other Examples

- `home-with-windows.arch` - Uses repeat patterns for window placement
- `house-components.arch` - Component import system demo
- `office-building.arch` - Larger scale building
- `repeat-test.arch` - Repeat pattern variations
- `clean-syntax.arch` - Unitless number syntax demo

## Components (`/components`)

### `door.arch`

Reusable door component with standard styling.

### `window.arch`

Window component for repeated placement along walls.

## How to Use

1. **In Browser**: Open `index.html` and click file tags to load examples
2. **CLI** (when implemented): `arch compile examples/plans/ground-floor.arch`
3. **Edit**: Modify any `.arch` file and see changes live in the editor

## What's Possible vs Not Possible

See `LIMITATIONS.md` for comprehensive list of:

- ✅ Implemented features
- ❌ Not yet implemented features
- 🔮 Planned features (with milestones)

## New Features (October 3, 2025)

### Inline CSS Properties

Any CSS property works directly in blocks:

```javascript
room living at (1U, 1U) size (6U, 4U) {
  label: "Living Room";
  background: yellow;
  margin: 0.5U 0.2U;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transform: rotate(2deg);
  transition: all 0.3s ease;
}
```

### Hierarchy Markers

Mark components with `@1`, `@2`, `@3`:

```javascript
@1;  // Darkest green - floor plans
@draw House { ... }

@2;  // Medium green - rooms
@draw Kitchen { ... }

@3;  // Lightest green - furniture
@draw Chair { ... }
```

### Unified `@draw` Syntax

Everything uses `@draw` instead of `@plan`/`@component`:

```javascript
@1;
@draw MyFloorPlan { ... }

@3;
@draw ChairComponent { ... }
```

## Testing

Run tests:

```bash
cd packages/parser
bun test
```

Currently: **32/32 tests passing** ✅

---

_For full specification, see `/specification.md`_
_For roadmap and upcoming features, see `/ROADMAP.md`_

