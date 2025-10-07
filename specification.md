# ArchCSS Specification

> A DSL for floor plans that compiles to pure CSS + HTML

# ArchCSS Manifesto

## Design Philosophy

ArchCSS is built on a simple principle: **Use CSS wherever possible. Invent syntax only when necessary.**

### Core Tenets

1. **CSS is the Foundation**
   - If CSS can do it, use CSS
   - Don't create custom syntax for what CSS already handles
   - Leverage the full power of CSS specifications
   - Let developers use the CSS knowledge they already have

2. **Minimal DSL, Maximum Power**
   - The DSL provides: positioning (`at`, `size`), composition (`@draw`, `import`, `use`), and hierarchy (`@1`, `@2`, `@3`)
   - Everything else is CSS: colors, borders, margins, transforms, animations, gradients, shadows, filters, etc.
   - No proprietary styling directives
   - No reinventing what CSS does well

3. **Standard Over Custom**
   - `margin: 0.5U;` instead of `@nudge 0.5U;`
   - `background: yellow;` instead of `@color yellow;`
   - `transform: rotate(2deg);` instead of `@rotate 2deg;`
   - CSS pseudo-classes (`:hover`, `:focus`) instead of custom state syntax
   - CSS variables (`--my-color`) instead of custom variable systems

4. **Composability**
   - Small, reusable components (`@draw`)
   - Import and place anywhere
   - Nest and combine freely
   - Standard CSS inheritance and cascade rules apply

5. **Progressive Enhancement**
   - Start simple: just positioning and labels
   - Add styling: any CSS property works
   - Add interactivity: CSS transitions and animations
   - Add advanced features: container queries, CSS Grid, custom properties
   - Everything is optional

### What ArchCSS Adds

ArchCSS provides only what CSS cannot:

- **Spatial positioning**: `at (x, y) size (w, h)` - absolute positioning in grid units
- **Component system**: `@draw`, `import`, `use` - reusable compositions
- **Visual hierarchy**: `@1`, `@2`, `@3` - semantic organization
- **Canvas definition**: `@canvas` - workspace boundaries
- **Unit system**: `@unit` - project-wide unit declarations
- **Repeat patterns**: `repeat` - array distribution
- **Configuration**: `@config` - project settings

Everything else is standard CSS.

- **Inline CSS properties** → use any standard CSS property directly within blocks for styling, positioning adjustments, animations, etc.

### Example: The Right Way

```javascript
@1;
@draw MyHome {
  @canvas 20U x 12U;  // ArchCSS: spatial definition

  room living at (1U, 1U) size (6U, 4U) {  // ArchCSS: positioning
    label: "Living Room";

    // Pure CSS from here:
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    margin: 0.5U;
    transform: rotate(1deg);
    transition: all 0.3s ease;
  }

  room living:hover {  // Pure CSS pseudo-class
    transform: rotate(1deg) scale(1.02);
    box-shadow: 0 8px 12px rgba(0,0,0,0.2);
  }
}
```

### What We Don't Do

❌ Don't create: `@color`, `@rotate`, `@shadow`, `@gradient`, `@animate`
✅ Instead use: `background`, `transform`, `box-shadow`, `background`, `animation`

❌ Don't create: `@nudge`, `@offset`, `@shift`
✅ Instead use: `margin`, `transform: translate()`, `position: relative`

❌ Don't create: `@style { ... }` blocks
✅ Instead use: Direct CSS properties in existing blocks

### Benefits

1. **Familiarity**: Developers already know CSS
2. **Power**: Access to all CSS features (current and future)
3. **Standards**: Works with CSS tooling, linters, formatters
4. **Future-proof**: New CSS features work automatically
5. **Learning curve**: Minimal - learn positioning syntax, use CSS you know
6. **Documentation**: MDN and CSS specs are your documentation

### The Promise

**If you can do it in CSS, you can do it in ArchCSS.**

- Want animations? Use `@keyframes` and `animation`
- Want gradients? Use `linear-gradient` and `radial-gradient`
- Want filters? Use `filter` and `backdrop-filter`
- Want responsive? Use `container-type` and `@container`
- Want variables? Use `--custom-properties`
- Want dark mode? Use `@media (prefers-color-scheme: dark)`

ArchCSS gets out of your way and lets CSS do what it does best.

### Implementation Commitment

The parser will:

- Recognize any valid CSS property syntax
- Pass CSS properties directly through to generated styles
- Not restrict or validate CSS (let the browser handle it)
- Support CSS at-rules within blocks when semantically appropriate
- Maintain minimal, focused DSL syntax

### Why This Matters

CSS is:

- Battle-tested across billions of websites
- Continuously evolving with new features
- Supported by incredible tooling
- Documented extensively
- Universal developer knowledge

ArchCSS doesn't need to compete with CSS. It complements CSS by adding spatial composition primitives that CSS lacks.

---

**In summary: ArchCSS is a thin layer for spatial composition. Everything else is CSS.**

## 1) Pick a direction (MVP scope)

Start 2D (floor plans). You'll get fast wins with grid, subgrid, custom properties, and transforms. Add 3D later if you want (CSS 3D + perspective).

- **Output**: plain HTML + CSS only (no canvas/webgl).
- **Runtime**: a ~2–3 KB helper script that mounts a generated DOM from a JSON blob embedded in your CSS (or emitted alongside). No framework required.
- **Units**: canonical unit `U` mapped to pixels via `@unit 1U = 50px`.

## 3) Language design (v0.1)

Keep it declarative and CSS-ish with **at-rules** and **blocks** so a PostCSS plugin can parse it easily. Example:

```javascript
@unit U = 50px;

@draw MyHome {
  @canvas 20U x 12U;

  room living at (1U, 1U) size (6U, 4U) {
    label: "Living";
  }

  room kitchen at (8U, 1U) size (5U, 3U) {
    label: "Kitchen";
  }

  door from (7U, 2U) to (7U, 3U) width 0.9U;

  wall from (1U,5U) to (13U,5U);
}
```

### Core concepts

- `@unit` → sets CSS var `--u`.
- `@<number>` → hierarchy marker (e.g., `@1;`, `@2;`, `@3;`); controls visual color gradient (darkest to lightest) and component picker organization.
- `@draw` → defines a reusable drawing; compiles to a wrapper with grid sized by `@canvas` (extension is `.arch`).
- `room` → placed rectangle; gets CSS variables `--x --y --w --h`.
- `wall` → thin rect line; derived as `transform/size` in CSS.
- `door` → opening defined by coordinates; renders as a white rectangle with blue border on top of walls.
- `repeat` → distributes components along a path or room edge with specified spacing; supports coordinate-based (`repeat Window from (0U, 0U) to (8U, 0U) space 2U`) and room-edge-based (`repeat Window in Living along north space 2U`) patterns.
- `@config` → inline configuration overrides for grid, units, and editor settings.
- `label` → content via `::after` with `content:`.

### Hierarchy Markers (`@1`, `@2`, `@3`, etc.)

ArchCSS uses simple numeric at-rules to mark the visual hierarchy depth of components. These markers control color intensity and organize components in the editor's component picker.

**Syntax**

```javascript
@<number>;  // where number is any positive integer
```

**Core concept**

- **Flexible meaning**: The hierarchy is relative to your project context. `@1` doesn't mean "floor plan" - it's whatever you define as your top-level
- **Visual gradient**: Colors interpolate from darkest (lowest number) to lightest (highest number) based on the range used in your project
- **Editor organization**: The component picker groups components by hierarchy number and uses it to determine column layout
- **Initial limit**: Start with 3 levels (`@1`, `@2`, `@3`) for clarity. More can be added as needed

**Example use cases**

```javascript
// Scenario A: Building-focused
@1;  // Floor plan (darkest green)
@draw House { ... }

@2;  // Room components (medium green)
@draw LivingRoom { ... }

@3;  // Furniture (lightest green)
@draw Chair { ... }
```

```javascript
// Scenario B: Room-focused
@1;  // Room layout (darkest)
@draw Bedroom { ... }

@2;  // Furniture (medium)
@draw Bed { ... }

@3;  // Furniture details (lightest)
@draw Pillow { ... }
```

```javascript
// Scenario C: Furniture-focused design system
@1;  // Complete chair (darkest)
@draw ChairComplete { ... }

@2;  // Chair parts (medium)
@draw ChairLeg { ... }

@3;  // Detail elements (lightest)
@draw ChairBolt { ... }
```

**Color interpolation**

Colors automatically stretch across the range of hierarchy numbers used in your project:

```css
/* If project uses @1, @2, @3 */
:root {
  --hierarchy-min: 1;
  --hierarchy-max: 3;
  --color-base-dark: #2d5016; /* Darkest green from Figma */
  --color-base-light: #7faf51; /* Lightest green from Figma */
}

/* Color calculation: interpolate based on position in range */
[data-hierarchy="1"] {
  --element-color: #2d5016; /* Darkest */
  outline-color: var(--element-color);
}

[data-hierarchy="2"] {
  --element-color: #4a7c2c; /* Middle */
  outline-color: var(--element-color);
}

[data-hierarchy="3"] {
  --element-color: #7faf51; /* Lightest */
  outline-color: var(--element-color);
}

/* If project uses @1 through @5, colors stretch across full range */
/* @1 = darkest, @5 = lightest, @2-@4 interpolate between */
```

**Component picker organization**

In the online editor's component picker:

1. **Grouping**: Components are grouped by their hierarchy number
2. **Visual separation**: Each group uses its interpolated color
3. **Column layout**: Hierarchy number can influence grid columns:
   - All `@1` components stack together in their section (darkest green header)
   - All `@2` components stack together (medium green header)
   - All `@3` components stack together (lightest green header)

**Default behavior**

- If no hierarchy marker is declared: appears with lightest green color at bottom of component picker
- Inherited from parent context when imported (can be overridden)

**Real-time editor behavior**

The hierarchy marker updates seamlessly and intuitively in the online editor:

1. **Starting without a marker**: When you begin writing a `.arch` file without any hierarchy marker (`@1`, `@2`, etc.), the component appears with the **lightest green color** (default state) and is placed at the **bottom of the component picker**

2. **Adding a hierarchy marker**: As soon as you type `@1` at the top of the file:
   - The component **instantly turns dark green** (darkest hierarchy color)
   - It **automatically moves** to the `@1` section at the top of the component picker
   - The transition is smooth and immediate - no save or refresh needed

3. **Changing hierarchy**: If you change from `@1` to `@2`:
   - Color updates from dark green → medium green
   - Component moves from top section → middle section in the picker
   - All changes happen in real-time as you type

4. **Removing the marker**: Deleting the hierarchy marker returns the component to the default lightest green state at the bottom

**Visual reference**: See the [Figma design](https://www.figma.com/design/9podv3jK4jXLbGK82LVhwd/archcss?node-id=20-2&t=bqPlCaJlnJf9DwrY-11) showing the color transitions and picker organization.

**Implementation notes**:

- File watcher detects `@<number>` changes in real-time
- Component picker re-renders on hierarchy updates
- Color interpolation happens client-side based on detected hierarchy range
- No compilation required - purely UI state updates

**Example in practice**

```javascript
// components/floor-plan.arch
@1;
@unit U = 50px;
@draw Office {
  @canvas 30U x 20U;

  import Meeting from "./rooms/meeting.arch";
  import Desk from "./furniture/desk.arch";

  use Meeting at (5U, 5U);
  use Desk at (2U, 2U);
}
```

```javascript
// components/rooms/meeting.arch
@2;
@draw MeetingRoom;

room meeting at (0U, 0U) size (8U, 6U) {
  label: "Meeting Room";
}
```

```javascript
// components/furniture/desk.arch
@3;
@draw Desk;

room desk at (0U, 0U) size (2U, 1U) {
  label: "Desk";
}
```

**Future extensions**

- Custom color palettes per hierarchy
- Hierarchy-based layer ordering (z-index)
- Auto-numbering within component directories
- Hierarchy constraints and validation rules

### Minimal grammar (informal)

### Modules, imports, and composition

### Inline CSS Properties

Use standard CSS properties directly within any block for styling and adjustments.

**Syntax**

```javascript
room <id> at (x, y) size (w, h) {
  label: "Label";
  property: value;
  property: value;
  // ... any CSS property
}
```

**Common use cases**

```javascript
@1;
@draw MyHome {
  @canvas 20U x 12U;

  room living at (1U, 1U) size (6U, 4U) {
    label: "Living Room";
    background: #f0f0f0;
    border: 2px solid #333;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  room kitchen at (8U, 1U) size (5U, 3U) {
    label: "Kitchen";
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: 0.5U 0.2U;  // Fine-tune position
    transform: rotate(2deg);  // Slight rotation
  }

  wall from (7U, 1U) to (7U, 4U) {
    background: #8b4513;
    height: 4px;  // Thicker wall
    box-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }

  door from (7U, 2U) to (7U, 3U) width 0.9U {
    background: white;
    border: 2px dashed #4080ff;
    opacity: 0.9;
  }
}
```

**Positioning adjustments**

Use standard CSS for fine-tuning:

```javascript
room bedroom at (2U, 6U) size (4U, 3U) {
  label: "Bedroom";
  margin: 0.3U;           // Nudge in all directions
  margin-top: 0.5U;       // Specific direction
  padding: 0.2U;          // Inner spacing
  transform: translate(0.1U, -0.2U);  // Precise adjustment
}
```

**Advanced styling**

Any valid CSS works:

```javascript
room showcase at (10U, 1U) size (5U, 5U) {
  label: "Showcase";

  // Gradients
  background: radial-gradient(circle, #fff 0%, #ddd 100%);

  // Borders
  border: 3px solid transparent;
  border-image: linear-gradient(45deg, red, blue) 1;

  // Shadows
  box-shadow:
    0 1px 3px rgba(0,0,0,0.12),
    0 1px 2px rgba(0,0,0,0.24);

  // Filters
  filter: brightness(1.1) contrast(1.05);

  // Transitions
  transition: all 0.3s ease;
}

room showcase:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}
```

**Custom properties (CSS variables)**

```javascript
@draw MyHome {
  @canvas 20U x 12U;

  // Define custom properties at drawing level
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --spacing: 0.5U;

  room living at (1U, 1U) size (6U, 4U) {
    label: "Living";
    background: var(--primary-color);
    margin: var(--spacing);
  }

  room kitchen at (8U, 1U) size (5U, 3U) {
    label: "Kitchen";
    background: var(--secondary-color);
    margin: var(--spacing);
  }
}
```

**Pseudo-elements and states**

```javascript
room interactive at (1U, 1U) size (4U, 4U) {
  label: "Click me";
  background: #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
}

room interactive:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

room interactive::after {
  content: "→";
  font-size: 2em;
  opacity: 0.5;
}
```

**Implementation**

- Parser recognizes `property: value;` syntax
- Properties are passed directly to generated CSS
- Works with all CSS specifications (Flexbox, Grid, Animations, etc.)
- Type checking optional (via TypeScript definitions)

**Default styles**

Elements have minimal base styles that can be overridden:

```css
/* Default base styles */
.room {
  position: absolute;
  outline: 1px solid currentColor;
  background: transparent;
  /* Your custom properties override these */
}

.wall {
  position: absolute;
  height: 2px;
  background: currentColor;
  /* Your custom properties override these */
}
```

**Browser compatibility**

All standard CSS properties are supported. Modern features like:

- Container queries: `container-type: inline-size;`
- CSS Grid: `display: grid; grid-template-columns: 1fr 1fr;`
- Animations: `animation: slide 1s ease-in-out;`
- Custom properties: `--my-var: value;`

### Clean imports and implicit resolution

You can opt into a minimal, clutter‑free style: implicit module resolution with simple `import` and `export` statements and no file paths.

**Design goals**

- Keep authoring clean: `import Ground` / `export Studio`
- Allow multi‑file projects without path noise
- Make resolution predictable and fast, with clear override rules

**Syntax (minimal style)**

```javascript
@module House;
@draw House { @canvas 30m x 20m; }

import Ground;         // resolves to a module named "Ground"
import Kitchen as K;   // aliasing

use Ground at (0m,0m);
use K.main at (5m,4m);

export Studio;         // expose this module's public surface as Studio
```

**Resolution rules**

1. **Name → file mapping**
   - Resolver searches from the project root (configurable) using this priority:
     - `./Ground.arch`
     - `./Ground/index.arch`
     - `./ground.arch`
     - `./ground/index.arch`
     - `./modules/**/Ground.arch` or `**/index.arch` with `@module Ground`
   - The first match wins. Paths inside `node_modules` are ignored by default.

2. **Project root**
   - Default: directory containing the top‑level `.arch` you run through the build.
   - Override via config: `root: "./plan"`, `include: ["./plan/**", "./components/**"]`.

3. **Index modules**
   - If a folder has an `index.arch` with `@module <Name>`, the folder's name and the module name both resolve that module.

4. **Namespaces and collisions**
   - If two matches exist at the same precedence tier, error with suggestions.
   - You can disambiguate with aliasing: `import Ground as Ground_v2;`

5. **Exports**
   - `export <Symbol>;` marks this module's public API symbol for import by other modules, e.g., `export Studio;`.
   - `export default;` marks the module's default export. Other files can `import Studio;` and get the default if no symbol is specified.
   - You can still export specific shapes: `export room living ...`

6. **Auto‑placement defaults**
   - `use <Module>;` with no placement implies `at (0U,0U)` rotate 0 scale 1.
   - Optional config: `autoplace: "none" | "origin" | "grid"` where grid auto‑packs imported modules at the next free grid slot for quick sketching.

7. **Mixed mode (explicit allowed)**
   - You can mix minimal imports with explicit path imports in the same project. Explicit paths always take precedence over resolution.

**Minimal grammar additions**

- `@<number>;` (hierarchy marker, e.g., `@1;`, `@2;`, `@3;`)
- `import <Name> (as <Alias>)?;`
- `export <Name>;` and `export default;`
- Config file `arch.config.(js|json)` supporting `{ root, include, autoplace }`.

**Notes**

- All previous features still apply: unit scoping, `use` transforms, anchors, `with unit {}` blocks.
- The resolver caches module graphs; HMR updates on file changes rerun resolution quickly.

Author in one file or many. A module can export shapes and import other modules, with optional local unit scopes and placement transforms.

**Syntax (proposed)**

```javascript
@module <name>;
@unit U = 50px;                    /* module‑level default */

/* exports */
export room <id> at (<X <unit>>, <Y <unit>>) size (<W <unit>>, <H <unit>>) { ... }
export wall from (...) to (...);
export door between ...;

/* imports */
import <alias> from "./relative/path.arch";               // static path
import Floor as F from "./floors/ground.arch" with {      // rename + unit remap
  unit: { base: U, add: { cm: 37.795px, m: 100cm } }
};

/* use imported module with placement */
use F at (0U, 0U) rotate 0deg scale 1;                     // place as a group
use <alias>.room kitchen at (8U,1U);                       // place a single export
```

**Principles**

- Everything is a module (a single file is implicitly a module). You can keep all content in one file without any import/export lines.
- Exports are reusable named shapes or groups. Imports bring them in under a namespace alias.
- `use` places imported exports into the current drawing. Supports transforms: `at`, `translate`, `rotate`, `scale`.
- Units are lexically scoped. Each module can declare its own `@unit` rules. When importing, you can:
  - accept the source module's units as-is
  - provide a `with { unit: { ... } }` block to add or remap units
  - or set a local scope for a placement via `with unit { ... }` on `use`

**Local unit scopes**

```javascript
/* room with local unit map (centimeters inside, meters outside) */
room bath at (2m,1m) size (2m,2m) with unit {
  cm = 37.795px;     // local to this block
  m  = 100cm;
} {
  label: "Bath";
}
```

**Placement and anchors**

- Rooms export edges/sides as anchors: north, south, east, west, center.
- `use X snap <anchorA> to <anchorB> [offset <d <unit>>]` aligns imported content.

**Grouping**

```javascript
export group plumbing {
  room bath at (0m,0m) size (2m,2m) { label: "Bath"; }
  room wc   at (2m,0m) size (1m,2m) { label: "WC"; }
}
use plumbing at (5m, 3m) rotate 90deg;  // place both together
```

**Single‑file vs multi‑file**

- Single file: omit `@module`, define everything in one `@draw` block.
- Multi‑file: one `.arch` per logical component. Example structure:

```
plan/
  house.arch           // top‑level site/house layout (meters)
  floors/
    ground.arch        // ground floor exports rooms (meters)
    first.arch         // first floor exports rooms (meters)
  components/
    kitchen.arch       // exports a kitchen group (centimeters local)
```

**Top‑level example (house.arch)**

```javascript
@module House;
@unit m = 100cm; @unit cm = 37.795px; @unit U = 1m;
@draw House { @canvas 30m x 20m; }

import Ground from "./floors/ground.arch";  // defines rooms in meters
import Kitchen from "./components/kitchen.arch" with { unit: { base: m, add: { cm: 37.795px } } };

use Ground at (0m,0m);
use Kitchen.main at (5m,4m);
```

**Validation and build behavior**

- Import graph must be acyclic.
- Namespaces: imports live under their alias. Direct un-namespaced references to imported exports are errors.
- Unit resolution: the compiler resolves each module in its own scope first, then applies placement transforms and unit mappings when materializing into the parent.
- Drawing canvas is defined only in the top composition file; submodules should not override parent canvas unless explicitly allowed with `@canvas inherit` safeguards.

**Minimal grammar additions**

- `@<number>;` (hierarchy marker)
- `@module <id>;`
- `export <shape|group>` …
- `import <alias> from <string> [with { unit: { base: <unit>, add: { <name>: <length>, ... } } }];`
- `use <alias>(.<export>)? (at (<X <unit>>, <Y <unit>>))? (rotate <deg>)? (scale <number>)? (snap <anchor> to <anchor> (offset <length>)?)? ;`
- `@unit <name> = <number><css-length>;`
  Examples: `@unit U = 50px;` `@unit cm = 37.795px;` `@unit tile = 0.6m;`
- `@canvas <W <unit>> x <H <unit>>;`
- `room <id> at (<X <unit>>, <Y <unit>>) size (<W <unit>>, <H <unit>>) { label: <string>; }`
- `wall from (<X1 <unit>>, <Y1 <unit>>) to (<X2 <unit>>, <Y2 <unit>>);`
- `door from (<X1 <unit>>, <Y1 <unit>>) to (<X2 <unit>>, <Y2 <unit>>) width <W <unit>>;`
- `repeat <component> from (<X1 <unit>>, <Y1 <unit>>) to (<X2 <unit>>, <Y2 <unit>>) space <spacing <unit>>;`
- `repeat <component> in <room-id> from <edge> to <edge> space <spacing <unit>> [offset <distance <unit>>];`
- `repeat <component> in <room-id> along <edge> space <spacing <unit>> [offset <distance <unit>>];`

### Repeat patterns and room-edge syntax

ArchCSS supports two modes for repeating components (windows, doors, fixtures):

**Coordinate-based (absolute positioning)**

```javascript
repeat Window from (0U, 0U) to (8U, 0U) space 2U;
repeat Window from (0U, 0U) to (0U, 10U) space 1.5U;  // vertical
```

Useful for precise placement independent of rooms.

**Room-edge-based (semantic positioning)**

```javascript
repeat Window in Living from east to west space 1.5;
repeat Window in Kitchen along north space 2;
repeat Window in Bedroom from north to south space 1.8 offset 0.5;
```

This mode maps room edges to cardinal directions, providing semantic clarity and automatic coordinate resolution:

| Edge keyword | Maps to             | Orientation | CSS analogy     |
| ------------ | ------------------- | ----------- | --------------- |
| `north`      | top edge (y min)    | horizontal  | `border-top`    |
| `south`      | bottom edge (y max) | horizontal  | `border-bottom` |
| `east`       | right edge (x max)  | vertical    | `border-right`  |
| `west`       | left edge (x min)   | vertical    | `border-left`   |

**Syntax variants**

1. **Between two edges**: `repeat <component> in <room-id> from <edge> to <edge> space <spacing> [offset <distance>]`
   - Distributes components along the path between two edges
   - Example: `repeat Window in Living from east to west space 1.5;` places windows along a horizontal line spanning the room's width

2. **Along one edge**: `repeat <component> in <room-id> along <edge> space <spacing> [offset <distance>]`
   - Distributes components along the entire length of one edge
   - Example: `repeat Window in Bedroom along north space 2;` places windows along the entire top wall

3. **With offset**: Optional `offset` parameter insets components from the edge
   - Example: `repeat Window in Living along west space 2 offset 0.3;` places windows 0.3U away from the west wall

**Compilation behavior**

At compile time, the parser:

1. Resolves the room ID to its bounding box `(x, y, width, height)`
2. Calculates edge coordinates:
   - `north`: from `(x, y)` to `(x + width, y)`
   - `south`: from `(x, y + height)` to `(x + width, y + height)`
   - `east`: from `(x + width, y)` to `(x + width, y + height)`
   - `west`: from `(x, y)` to `(x, y + height)`
3. Applies offset if specified (perpendicular to edge direction)
4. Distributes components along the path with the specified spacing

**Example**

```javascript
@unit U = 50px;

@draw MyHome {
  @canvas 20U x 12U;

  room living at (1U, 1U) size (8U, 5U) {
    label: "Living Room";
  }

  // Semantic: place windows along the south wall, evenly spaced
  repeat Window in living along south space 2U;

  // Equivalent to (if living is at (1,1) size (8,5)):
  // repeat Window from (1U, 6U) to (9U, 6U) space 2U;
}
```

**Future extensions**

- `repeat <component> between <room-A> and <room-B> space <spacing>` — places components on the shared wall/boundary between two adjacent rooms
- `repeat <component> in <room-id> along <edge> count <N>` — distributes exactly N components evenly, instead of using fixed spacing
- Edge offsets with named anchors: `repeat Window in living along north offset center` or `offset top`

### Unit and scale simplification

### User‑defined units and CSS mapping

You can define arbitrary unit symbols and map them to CSS lengths. Declarations can chain and mix symbols, for example:

```javascript
@unit u = 50px;        /* base authoring unit */
@unit cm = 37.795px;   /* 96dpi default */
@unit m = 100cm;       /* chained definition */
@unit tile = 0.6m;     /* domain-specific unit */
```

**Rules**

- Numbers without a suffix default to U.
- Any declared unit may be used anywhere a length is accepted.
- Parser resolves to px at compile time using the declared graph. Cycles error.
- DPI used for physical units defaults to 96; can be overridden in config: `dpi: 96`.

**Clean Syntax (v0.1+)**

You can omit unit names for cleaner code:

```javascript
/* Clean syntax - defaults to U */
@unit = 50px;  /* Same as @unit U = 50px; */

@draw MyHome {
  @canvas 20 x 10;  /* Same as 20U x 10U */

  room living at (1, 1) size (6, 4) {  /* All numbers default to U */
    label: "Living";
  }

  wall from (1, 5) to (13, 5);  /* Coordinates default to U */
}
```

### CSS → Arch length mapping (defaults at 96dpi)

| CSS unit            | Arch usage                                                                  | Default conversion to px | Notes                                                                     |
| ------------------- | --------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------- |
| px                  | Use as-is: `@unit 1U = 50px`                                                | 1px = 1px                | Absolute pixel                                                            |
| rem                 | Allowed: `@unit 1U = 3rem`                                                  | 1rem = root font-size    | Resolves at build or runtime depending on target; prefer px for stability |
| em                  | Allowed in declarations                                                     | 1em = parent font-size   | Contextual; avoid in shared artifacts                                     |
| cm                  | Declare: `@unit 1cm = 37.795px`                                             | 1cm ≈ 37.795px           | Assumes 96dpi                                                             |
| mm                  | Declare: `@unit 1mm = 3.7795px`                                             | 1mm ≈ 3.7795px           | Assumes 96dpi                                                             |
| in                  | Declare: `@unit 1in = 96px`                                                 | 1in = 96px               | Physical inch                                                             |
| pt                  | Declare: `@unit 1pt = (1/72)in`                                             | 1pt ≈ 1.3333px           | 1pt = 1/72in                                                              |
| pc                  | Declare: `@unit 1pc = 12pt`                                                 | 1pc = 16px               | Pica                                                                      |
| vh / vw             | Discouraged in unit base; may be used in @unit but will be runtime-resolved | 1vh = 1% viewport height | Makes output responsive; use sparingly                                    |
| custom (e.g., tile) | Define via chaining: `@unit 1tile = 0.6m`                                   | Depends on chain         | Great for domain semantics                                                |

**Examples**

```javascript
@unit 1U = 40px;     // denser grid
@unit 1cm = 37.795px;
@unit 1m  = 100cm;

@draw Studio {
  @canvas 12m x 8m;          // physical scale
  room main at (1m,1m) size (6m,4m) { label: "Main"; }
  wall from (1m,5m) to (11m,5m);
}
```

- Canonical unit is uppercase `U`. Example: `@unit 1U = 50px;`.
- Numbers without a unit default to `U` in this DSL.
- Internally we still expose CSS variable `--u` for compatibility, set from `@unit`.
- Optional: allow `cm` with a `dpi` config for conversion, but default remains `U` → px.

## Configuration (`arch.config.json`)

ArchCSS projects can include an optional configuration file for project-wide settings.

**Location**

- Project root: `arch.config.json`
- Per-file override: `@config` directive in `.arch` files

**Structure**

```json
{
  "unit": {
    "default": "50px",
    "dpi": 96
  },
  "grid": {
    "default": true,
    "size": "1U",
    "color": "#ccc",
    "alpha": 0.15
  },
  "hierarchy": {
    "colors": {
      "dark": "#2d5016",
      "light": "#7faf51"
    }
  },
  "resolution": {
    "root": "./",
    "include": ["./components/**", "./plans/**"],
    "exclude": ["./node_modules/**", "./dist/**"]
  },
  "editor": {
    "autoSave": true,
    "debounceMs": 500,
    "showGrid": true,
    "snapToGrid": false
  },
  "export": {
    "format": "svg",
    "scale": 1,
    "includeGrid": false
  }
}
```

**Options**

- **unit.default**: Default unit size (e.g., `"50px"`, `"1cm"`)
- **unit.dpi**: DPI for physical unit conversions (default: 96)
- **grid.default**: Show grid by default in editor
- **grid.size**: Default grid spacing
- **grid.color**: Grid line color
- **grid.alpha**: Grid opacity (0-1)
- **hierarchy.colors**: Custom color range for hierarchy markers
- **resolution.root**: Base directory for module resolution
- **resolution.include**: Glob patterns for component search paths
- **resolution.exclude**: Paths to ignore
- **editor.autoSave**: Enable auto-save in online editor
- **editor.debounceMs**: Debounce delay for live updates
- **editor.showGrid**: Show/hide grid overlay
- **editor.snapToGrid**: Enable snap-to-grid behavior
- **export.format**: Default export format (`svg`, `png`, `pdf`)
- **export.scale**: Export scale multiplier
- **export.includeGrid**: Include grid in exports

**File-level override**

```javascript
@config {
  grid: { size: 0.5U, alpha: 0.3 },
  editor: { snapToGrid: true }
}

@1;
@draw MyHome {
  // ... uses overridden config
}
```

**Precedence**

1. Inline `@config` directive (highest)
2. `arch.config.json` in project root
3. Default values (lowest)

**Online Editor**

The online editor provides a UI for managing these settings:

- Settings panel accessible via gear icon
- Real-time preview of changes
- Export/import config as JSON
- Project-level and session-level settings

**CLI usage**

```bash
# Use custom config
arch build --config ./custom.config.json

# Override specific options
arch build --unit 40px --grid-size 0.5U
```

## 4) Compilation strategy

### Grid overlay (@grid)

A discretionary plan grid overlay for authoring and presentation.

**Shorthand**

```javascript
@grid                        // grid, size 1U x 1U, alpha 0.1, color currentColor
@grid lines                  // alias of grid
@grid vlines                 // vertical lines only
@grid hlines                 // horizontal lines only
@grid dotted                 // intersection dots
@grid color #9aa             // default size/alpha with custom color
@grid size 0.5U              // both axes 0.5U
@grid size 1Ux2U             // X=1U, Y=2U
@grid size 0.5U x 2U         // X=0.5U, Y=2U
```

**Full syntax**

```javascript
@grid <mode> [size <SX>[x<SY>]] [color <css-color>] [alpha <0..1>];
```

- **mode**: one of `grid` | `vlines` | `hlines` | `lines` | `dotted`
  - `grid`: both vertical and horizontal
  - `vlines`: vertical lines only
  - `hlines`: horizontal lines only
  - `lines`: alias of `grid`
  - `dotted`: points at grid intersections
- **size**: spacing in Arch units. Accepts:
  - single: `size 1U` → both axes 1U
  - pair: `size 1Ux2U` → X spacing 1U, Y spacing 2U
  - list: `size 1Ux2Ux3Ux0.5U` → repeating sequence along X; Y uses first or pair list if provided as `size 1Ux2U x 3Ux0.5U`
- **color**: any CSS color token. Default `currentColor` with lowered opacity
- **alpha**: 0..1 opacity multiplier. Default 0.1

**Examples**

```javascript
@unit 1U = 50px;
@draw Sample {
  @canvas 20U x 12U;
  @grid grid size 1U color #9aa alpha 0.25;
  @grid vlines size 0.5U color #bcc alpha 0.3;
}
```

**Compilation**

- Emits CSS custom properties on the drawing root:
  - `--grid-mode`, `--grid-sx`, `--grid-sy`, `--grid-color`, `--grid-alpha`
  - For list spacings, the runtime draws multiple layered backgrounds to approximate sequences
- For `grid`/`lines`/`vlines`/`hlines`: use repeating-linear-gradient backgrounds
- For `dotted`: use radial-gradient with background-size and background-position

**CSS mapping (conceptual)**

```css
.plan {
  /* base */
  --grid-sx: 1; /* in U */
  --grid-sy: 1; /* in U */
  --grid-color: color-mix(in oklab, currentColor 60%, white 40%);
  --grid-alpha: 0.2;
}

/* lines */
.plan[data-grid="grid"],
.plan[data-grid="lines"] {
  background-image:
    repeating-linear-gradient(
      to right,
      color-mix(
          in oklab,
          var(--grid-color) calc(100% * var(--grid-alpha)),
          transparent 0%
        )
        0 1px,
      transparent 1px calc(var(--u) * var(--grid-sx))
    ),
    repeating-linear-gradient(
      to bottom,
      color-mix(
          in oklab,
          var(--grid-color) calc(100% * var(--grid-alpha)),
          transparent 0%
        )
        0 1px,
      transparent 1px calc(var(--u) * var(--grid-sy))
    );
}

.plan[data-grid="vlines"] {
  background-image: repeating-linear-gradient(
    to right,
    color-mix(
        in oklab,
        var(--grid-color) calc(100% * var(--grid-alpha)),
        transparent 0%
      )
      0 1px,
    transparent 1px calc(var(--u) * var(--grid-sx))
  );
}

.plan[data-grid="hlines"] {
  background-image: repeating-linear-gradient(
    to bottom,
    color-mix(
        in oklab,
        var(--grid-color) calc(100% * var(--grid-alpha)),
        transparent 0%
      )
      0 1px,
    transparent 1px calc(var(--u) * var(--grid-sy))
  );
}

/* dotted */
.plan[data-grid="dotted"] {
  --dot: color-mix(
    in oklab,
    var(--grid-color) calc(100% * var(--grid-alpha)),
    transparent 0%
  );
  background-image: radial-gradient(
    circle at center,
    var(--dot) 1px,
    transparent 1px
  );
  background-size: calc(var(--u) * var(--grid-sx))
    calc(var(--u) * var(--grid-sy));
}
```

**Validation**

- `size` must be positive values; sequences limited to 8 entries per axis
- If only one axis is defined, Y defaults to X
- Unknown mode → error at parse

You have two straightforward paths; build both eventually.

### A) PostCSS plugin (fastest MVP)

- Write **`postcss-plan`** that:
  1. Parses `.arch` via a tiny parser (Chevrotain/nearley) or manual regex first pass.
  2. Emits:
     - **CSS**: a scoped stylesheet with custom properties and grid placement.
     - **A JSON blob** (via `@property` or a `<script type="application/json" data-plan>` file) containing the logical model.
  3. Adds a **runtime hook** (one small JS file) that, on page load, creates the DOM nodes for rooms/walls/doors, then the CSS paints them.

**Dev experience**: Add to Vite/Next build chain. Import `.arch` and get CSS + mounted DOM.

```javascript
// vite.config.js
import planPlugin from "vite-plugin-plan";

export default { plugins: [planPlugin()] };
```

### B) Vite/Rollup loader (instant + hot reload)

- Create **`vite-plugin-plan`**:
  - Transforms `import layout from './home.arch'` into:
    - `export const css = '...';`
    - `export const model = {...};`
    - `export default inject(css, model);` (calls your tiny runtime to mount)
- Supports **HMR** so edits in `.arch` reflow immediately.

## 5) CSS generation (how rooms become CSS)

Use **CSS Grid** for absolute-ish placement and **custom properties** for sizing:

```css
.plan {
  --u: 50px; /* from @unit */
  display: grid;
  grid-template-columns: repeat(var(--cols), var(--u));
  grid-template-rows: repeat(var(--rows), var(--u));
  position: relative;
  background:
    repeating-linear-gradient(
      to right,
      var(--grid-color) 0 1px,
      transparent 1px var(--u)
    ),
    repeating-linear-gradient(
      to bottom,
      var(--grid-color) 0 1px,
      transparent 1px var(--u)
    );
}

.room {
  position: absolute;
  left: calc(var(--x) * var(--u));
  top: calc(var(--y) * var(--u));
  width: calc(var(--w) * var(--u));
  height: calc(var(--h) * var(--u));
  outline: 1px solid var(--room-stroke, currentColor);
}

.room::after {
  content: attr(data-label);
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font: 500 12px/1.2 system-ui;
}
```

Walls are just thin absolutely positioned divs with rotation:

```css
.wall {
  position: absolute;
  left: calc(var(--x) * var(--u));
  top: calc(var(--y) * var(--u));
  width: calc(var(--len) * var(--u));
  height: 2px;
  transform-origin: left center;
  transform: rotate(var(--angle));
  background: currentColor;
}
```

## 6) Tiny runtime (3 responsibilities)

1. **Mount**: given a model JSON, create `.plan`, `.room`, `.wall`, `.door` elements with `data-*` and CSS vars.
2. **Scale**: set `--u` from `@unit` and `--cols/--rows` from `@canvas`.
3. **Accessibility**: add `role="img"` + `aria-label` for each shape.

You can write this in ~100 lines of TypeScript.

## 7) Example: from `.arch` to DOM+CSS

**Input (`home.arch`)**

```javascript
@unit 1U = 48px;
@draw MyHome { @canvas 18U x 10U;
  room living at (1U,1U) size (6U,4U) { label: "Living"; }
  room kitchen at (8U,1U) size (5U,3U) { label: "Kitchen"; }
  wall from (1U,5U) to (13U,5U);
  door from (7U, 2U) to (7U, 3U) width 0.9U;
}
```

**Emitted (conceptual)**

- **CSS**: `.plan{--u:48px;--cols:18;--rows:10} ...`
- **JSON model**:

```json
{
  "scale": 48,
  "canvas": { "cols": 18, "rows": 10 },
  "rooms": [
    { "id": "living", "x": 1, "y": 1, "w": 6, "h": 4, "label": "Living" },
    { "id": "kitchen", "x": 8, "y": 1, "w": 5, "h": 3, "label": "Kitchen" }
  ],
  "walls": [{ "x1": 1, "y1": 5, "x2": 13, "y2": 5 }],
  "doors": [{ "x1": 7, "y1": 2, "x2": 7, "y2": 3, "width": 0.9 }]
}
```

- **Runtime** reads this and appends elements with corresponding CSS variables.

## 8) Instant compile & preview

**Two modes:**

- **Dev**: Vite plugin watches `.arch` → HMR updates CSS/DOM without full reload.
- **In-browser**: a single `<script type="module">` that fetches a `.arch` file, parses it (parser bundled), and mounts immediately. Great for CodePen-like demos.

## 9) Syntax niceties (feel "CSS-y")

- **At-rules** feel native: `@unit`, `@draw`.
- **Identifiers** are bare words; string quotes only for labels.
- **Numbers** default to `U`; allow `cm` and convert using a `dpi` config if desired.
- **Comments**: `/* like CSS */`.

## 10) Ecosystem hooks

- **PostCSS** plugin: `postcss-plan`
- **Vite** plugin: `vite-plugin-plan`
- **ESLint**: tiny linter to catch overlaps (optional)
- **VS Code**: grammar with Monarch for syntax highlighting + simple completions (room/wall/door snippets)
- **Export**: `export as SVG` by walking the model and generating basic shapes (later).

## 11) Roadmap

### Milestone 1 (weekend-sized):

- Minimal grammar: `@unit`, `@draw`, `room`.
- PostCSS plugin emits CSS variables + runtime mounts rooms.
- Hot reload via Vite plugin wrapper.

### Milestone 2:

- Add `wall` + `door`, labels, grid background, snapping.
- Add simple constraint checks (overlaps, out-of-bounds) with console warnings.

### Milestone 2.5: Online Editor (web)

- In-browser Monaco-based editor with language server: syntax highlighting, linting, go-to-definition for room ids, and quick-fixes.
- Live preview pane with split view and HMR: parse on change, diff apply DOM updates.
- Shareable permalinks: encode `.arch` in URL or shortlink storage; "Copy embed" snippet.
- File ops: open/save to local (File System Access API), import/export `.arch`, export SVG/PNG.
- Playground templates: sample plans and "fork" flow.
- Accessibility: keyboard-only authoring, ARIA labels surfaced as warnings if missing.
- Security: sandboxed iframe preview, no remote code execution.
- **User Authentication**: Sign-in functionality allowing users to save and manage their components library in the cloud.
- **Editor UI Controls**:
  - Copy code button: one-click copy `.arch` source to clipboard
  - Share button with shareable link generation
  - Download image button: export rendered floor plan as PNG/SVG
- **Documentation**: Available at `/docs` route with full API reference, examples, and tutorials. Built using **Starlight** (Astro-based documentation framework) for fast, accessible, and SEO-optimized documentation with built-in search, dark mode, code highlighting, and responsive design.
- **Component Library Management**: Authenticated users can save, organize, and reuse custom components across projects.

### Milestone 3:

- Add "materials" (fill patterns, hatching via CSS `repeating-linear-gradient`), room types (kitchen/bathroom presets).
- Add export to SVG & PNG (via `foreignObject` or `toDataURL`).

### Milestone 4 (stretch):

- 3D preview layer (CSS transforms only): extrude walls, set height variables `--h-room`.
- Container queries for responsive scale (auto adjust `--u`).

### Milestone 5 (exploratory): Ornamentation and Curves

- Curved geometry primitives: `arc`, `spline`, `bezier` with control points in any declared unit; per‑room corner radii and per‑edge fillets.
- Path DSL: `path { moveTo; lineTo; arcTo; cubicTo; quadTo; close; }` attachable to rooms and standalone as ornaments.
- Profiles and sweeps: define 2D profiles (e.g., mouldings) and apply `sweep along <path>` to render skirting, crown, and trims.
- Classical orders kit: parameterized column generator (Doric/Ionic/Corinthian): `column order: doric; height: 3m; base: yes; flutes: 20; entasis: 1.02;` outputs base, shaft (with fluting and entasis), capital, abacus.
- Border styles: per‑edge thickness, hatch, and corner style (round, chamfer, spline).
- Ornament library: reusable named patterns (egg‑and‑dart, bead‑and‑reel) expressed as mini‑paths, placeable with `repeat along <edge> spacing <U>`.
- Rendering: map curves to CSS via SVG overlay layer in runtime, while keeping rooms/walls in DOM+CSS for performance. Export to pure SVG for print.
- Validation: curvature bounds, self‑intersection checks, and optional simplification tolerance.

## 12) Implementation notes (tech choices)

- **Parser**: Chevrotain (TS) or nearley. Both work in Node & browser.
- **Compiler**: TypeScript; target ES2020.
- **Runtime**: no deps; uses `data-*` + CSS vars.
- **Testing**: Vitest for parser/transform; Playwright for visual snapshots.
- **Perf**: Everything is DOM+CSS; even large plans should be fine (hundreds of rooms/walls).
- **Documentation**: Starlight (built on Astro). Fast, accessible documentation site with:
  - Built-in full-text search
  - Dark/light mode toggle
  - Responsive design (mobile-first)
  - Code syntax highlighting with Shiki
  - MDX support for interactive examples
  - SEO optimized out-of-the-box
  - i18n ready for future internationalization
  - Install: `npm create astro@latest -- --template starlight`
  - Official site: [starlight.astro.build](https://starlight.astro.build)
  - GitHub: [withastro/starlight](https://github.com/withastro/starlight)

## 13) Example developer workflow

```javascript
my - plan - app / src / main.ts;
src / styles.css;
plan / home.arch;
vite.config.ts;

// main.ts
import { mount } from "plan/runtime";
import model from "./plan/home.arch"; // handled by the vite plugin
mount("#app", model); // injects DOM + adds CSS
```

## 14) "Tailwind for architecture"

If you want **utility classes**, you can auto-generate a **Planwind** layer:

```css
/* generated */
.u-1 {
  width: calc(1 * var(--u));
}
.u-2 {
  width: calc(2 * var(--u));
}
.h-1 {
  height: calc(1 * var(--u));
}
/* ... */
.room-outline {
  outline: 1px solid currentColor;
}
```

…but keep this optional. The DSL should remain the primary source of truth, and utilities can style/annotate.
