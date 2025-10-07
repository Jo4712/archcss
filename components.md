# ArchCSS Component System

## Overview

ArchCSS supports **reusable components** - any `.arch` file can be imported and used as a component in another `.arch` file. This enables:

- **Design systems**: Define components once, use everywhere
- **Consistency**: Same windows, doors across your floor plans
- **Composition**: Build complex plans from simple parts
- **Mix & match**: Use inline definitions + imported components

## File Structure

```
examples/
├── components/          # Reusable component library
│   ├── window.arch     # Window component
│   └── door.arch       # Door variants (standard, wide, double)
└── plans/              # Floor plan compositions
    ├── home.arch                # Basic plan (inline only)
    ├── home-with-windows.arch   # Uses window component
    └── house-components.arch    # Full component example
```

## Component Definition

**`components/window.arch`** - Define a reusable component:

```arch
@draw window {
  shape window at (0U, 0U) size (1U, 0.3U) {
    background: #e3f2fd;
    border: 2px solid #1976d2;
    label: "Window";
  }
}
```

**`components/door.arch`** - Multiple component variants:

```arch
@draw door.standard {
  shape door at (0U, 0U) size (1U, 0.1U) {
    background: white;
    border: 2px solid #4080ff;
  }
}

@draw door.wide {
  shape door at (0U, 0U) size (1.5U, 0.1U) {
    background: white;
    border: 2px solid #4080ff;
  }
}
```

## Using Components

### Import Syntax

**Implicit resolution** (no file paths needed!):

```arch
/* Single import - finds Window.arch automatically */
import Window;

/* Named imports - from Door.arch */
import { Door.Standard, Door.Wide };

/* Multiple imports */
import Window;
import Door;
```

The resolver automatically finds `Window.arch`, `window.arch`, or `components/Window.arch` based on project structure.

### Use in Plan

**Single placement:**

```arch
@unit U = 50px;

import Window;

@plan MyHome {
  @canvas 18U x 10U;

  room living at (1U, 1U) size (6U, 4U) {
    label: "Living Room";

    /* Place single window */
    use Window at (2U, 0U);  /* 2U from room's left edge */
  }
}
```

### Repeat Pattern

**Repeat components at regular intervals:**

```arch
room living at (1U, 1U) size (6U, 4U) {
  label: "Living Room";

  /* Repeat windows from 0U to 6U with 1.5U spacing */
  repeat Window from (0U, 0U) to (6U, 0U) space 1.5U;

  /* Places windows at: 0U, 1.5U, 3U, 4.5U, 6U */
}
```

The `repeat` syntax automatically:

- Calculates how many instances fit
- Places them at regular intervals
- Works horizontally or vertically

## Positioning

**Components are positioned relative to their parent:**

```arch
room at (1U, 1U) size (6U, 4U) {
  /* (0U, 0U) = top-left corner of room */
  use window at (0U, 0U);    /* Top-left corner */

  /* (2U, 0U) = 2U from left, on top edge */
  use window at (2U, 0U);    /* Top edge, centered-ish */

  /* (6U, 2U) = right edge, middle */
  use window at (6U, 2U);    /* Right edge */
}
```

## Edges & Walls

**Common patterns for placement:**

```arch
room at (1U, 1U) size (6U, 4U) {
  /* North wall (top) - y = 0U */
  use window at (2U, 0U);

  /* South wall (bottom) - y = height */
  use window at (2U, 4U);

  /* West wall (left) - x = 0U */
  use window at (0U, 2U);

  /* East wall (right) - x = width */
  use window at (6U, 2U);
}
```

## Repeat Syntax Details

### Coordinate-Based (Absolute)

```arch
repeat Window from (0U, 0U) to (8U, 0U) space 1.5U;
```

This places Window components:

- **Starting at** (0U, 0U)
- **Ending at** (8U, 0U)
- **Spacing** 1.5U between each placement

Result: Windows at `0U, 1.5U, 3U, 4.5U, 6U, 7.5U`

#### Vertical & Horizontal

```arch
/* Horizontal - along x-axis */
repeat Window from (0U, 0U) to (10U, 0U) space 2U;

/* Vertical - along y-axis */
repeat Window from (0U, 0U) to (0U, 10U) space 2U;

/* Diagonal - both axes */
repeat Window from (0U, 0U) to (10U, 10U) space 2U;
```

### Room-Edge-Based (Semantic) 🆕

Instead of coordinates, you can place components along room edges using cardinal directions:

```arch
/* Along a single wall */
repeat Window in living along north space 2U;
repeat Window in bedroom along south space 1.5U;

/* Between two edges */
repeat Window in kitchen from east to west space 2U;
repeat Window in office from north to south space 1.8U;

/* With offset (inset from wall) */
repeat Window in living along west space 2U offset 0.3U;
```

#### Edge Keywords

| Keyword | Maps to     | CSS Analogy     |
| ------- | ----------- | --------------- |
| `north` | Top edge    | `border-top`    |
| `south` | Bottom edge | `border-bottom` |
| `east`  | Right edge  | `border-right`  |
| `west`  | Left edge   | `border-left`   |

#### Why Use Room-Edge Syntax?

✅ **More semantic** - `along north` is clearer than coordinates  
✅ **Room-aware** - Automatically uses room dimensions  
✅ **Resilient** - If you change room size, windows adjust automatically  
✅ **Natural** - Matches how architects think about walls

#### Examples

```arch
room living at (1U, 1U) size (8U, 5U) {
  label: "Living Room";

  /* Windows along the south wall (bottom) */
  repeat Window in living along south space 2U;

  /* Equivalent to (since living is at (1,1) size (8,5)): */
  /* repeat Window from (1U, 6U) to (9U, 6U) space 2U; */
}

room office at (5U, 2U) size (4U, 6U) {
  label: "Office";

  /* Windows on east wall, inset 0.5U from edge */
  repeat Window in office along east space 1.5U offset 0.5U;
}
```

## Examples

### Basic Component Usage

**`home-with-windows.arch`** - Simple example with repeat:

- 1 window component (implicit import)
- `repeat Window` creates multiple instances
- Shows spacing patterns

### Full Component System

**`house-components.arch`** - Complete example:

- Imports window component
- Imports multiple door variants (standard, wide)
- 5 rooms, each using components
- Mix of windows and doors
- Shows component reuse

### Office Building

**`office-building.arch`** - Advanced repeat patterns:

- Office space with `repeat Window` on multiple walls
- Horizontal window walls (every 2U)
- Vertical window patterns (every 1.5U)
- Uniform small offices with identical layouts
- Shows power of `repeat` for large buildings

## Benefits

✅ **DRY**: Define once, use everywhere  
✅ **Consistency**: All windows look the same  
✅ **Maintainability**: Change component, updates everywhere  
✅ **Flexibility**: Mix inline + imported  
✅ **Tree structure**: Natural composition

## Current Status

⚠️ **Not yet implemented** - This is the proposed syntax!

### Implementation Roadmap

**Phase 1: Component Definition**

1. Add `@draw` keyword to tokenizer
2. Parse `@draw Name { ... }` blocks
3. Store component definitions

**Phase 2: Import Resolution** 4. Parse `import Name;` (no file paths!) 5. Implement implicit file resolution:

- Search for `Name.arch`, `name.arch`
- Search in `components/Name.arch`
- Search in `./Name/index.arch`

6. Cache resolved components

**Phase 3: Component Usage** 7. Parse `use Component at (x, y);` 8. Calculate relative positioning 9. Instantiate component at runtime

**Phase 4: Repeat Pattern** 10. Parse `repeat Component from (x1,y1) to (x2,y2) space S;` 11. Calculate placement positions along path 12. Generate multiple instances 13. Handle horizontal/vertical/diagonal patterns

**Phase 5: Room-Edge-Based Repeat (🆕 Proposed)** 14. Add edge keywords to tokenizer: `in`, `along`, `offset`, `north`, `south`, `east`, `west` 15. Extend `RepeatPattern` type to support room-edge mode 16. Parse `repeat Component in <room> from <edge> to <edge> space S;` 17. Parse `repeat Component in <room> along <edge> space S [offset D];` 18. Add compiler logic to resolve room edges to coordinates at compile time 19. Support offset parameter for inset positioning 20. Write comprehensive tests for all edge combinations

### Key Features

✅ **No file paths** - `import Window;` just works!  
✅ **Repeat syntax** - `repeat Window from ... to ... space 1.5U;`  
✅ **Relative positioning** - All positions relative to parent  
✅ **Tree composition** - Natural nesting structure

Would you like this implemented? 🚀
