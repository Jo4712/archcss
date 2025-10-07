# ArchCSS Current Limitations

Based on the ground floor plan example, here's what's currently possible and what's not yet implemented.

## ✅ Currently Possible

### Spatial Features

- [x] Rooms with precise positioning (`at (x, y)`)
- [x] Room sizing (`size (w, h)`)
- [x] Straight walls (`wall from (x1, y1) to (x2, y2)`)
- [x] Door openings as rectangles
- [x] Grid overlay for alignment
- [x] Canvas definition
- [x] Multiple unit systems (px, cm, m, etc.)

### Styling (NEW - October 3, 2025)

- [x] **Inline CSS properties on any element**
- [x] Background colors and gradients
- [x] Borders and border-radius
- [x] Box shadows
- [x] Margins for positioning adjustments
- [x] Transforms (rotate, scale, translate)
- [x] Filters and opacity
- [x] Custom CSS variables
- [x] Transitions and animations
- [x] Pseudo-classes (`:hover`, `:focus`)
- [x] Pseudo-elements (`::before`, `::after`)

### Organization

- [x] Component hierarchy markers (`@1`, `@2`, `@3`)
- [x] Component grouping in picker
- [x] Real-time color updates
- [x] Configuration system (`arch.config.json`)

## ❌ Not Yet Implemented

### Curves and Arcs (Milestone 5)

- [ ] Door swing arcs (curved lines)
- [ ] Rounded corners for rooms
- [ ] Bezier curves
- [ ] Circular arcs
- [ ] Splines
- [ ] **Workaround**: Use `border-radius` for rounded corners, but true arc primitives need SVG layer

### Fixtures and Furniture (Milestone 3+)

- [ ] Predefined bathroom fixtures (toilet, sink, bathtub)
- [ ] Kitchen appliances (stove, fridge, counter)
- [ ] Furniture library (chairs, tables, beds)
- [ ] **Workaround**: Create as individual `@draw` components with inline CSS styling

### Advanced Patterns

- [ ] Hatching/texture fills for room types
- [ ] Material patterns (wood grain, tile, carpet)
- [ ] **Workaround**: Use CSS `repeating-linear-gradient` or `background-image` with inline CSS

### Annotations

- [ ] Compass rose (N, E, S, W indicator)
- [ ] Dimension lines with measurements
- [ ] Text annotations outside rooms
- [ ] **Workaround**: Create as separate `@draw` components or use CSS `::before`/`::after`

### 3D Features (Milestone 4)

- [ ] Wall height and extrusion
- [ ] 3D perspective views
- [ ] Floor levels (multi-story buildings)
- [ ] **Workaround**: Use CSS `transform: perspective()` for basic 3D effects

### Component System (In Progress)

- [ ] `import` statement (currently in spec, not implemented)
- [ ] `use` placement (currently in spec, not implemented)
- [ ] Component library with search
- [ ] **Workaround**: Define everything in one file for now

## 📝 Ground Floor Example - What Was Used

### Fully Implemented

```javascript
@1;                           // Hierarchy marker ✅
@unit U = 30px;              // Unit declaration ✅
@draw GroundFloor {          // Drawing definition ✅
  @canvas 24U x 14U;         // Canvas size ✅
  @grid grid size 1U;        // Grid overlay ✅

  room kitchen {             // Room positioning ✅
    label: "Kitchen";        // Labels ✅
    background: #fafafa;     // Inline CSS ✅
    border: 2px solid #666;  // Inline CSS ✅
  }

  wall from (x,y) to (x,y);  // Straight walls ✅
  door from (x,y) to (x,y);  // Door openings ✅
}
```

### Not Possible in Example

- Door swing arcs (curved lines showing door movement)
- Exact fixture placement (toilet, sink icons)
- Dimension annotations
- Room type-specific patterns

## 🎯 Recommended Approach for Ground Floor

1. **Use what works**: Rooms, walls, doors with inline CSS
2. **Approximate curves**: Use `border-radius` where needed
3. **Style with CSS**: Add colors, shadows, gradients for visual distinction
4. **Wait for Milestone 5**: For true arc/curve support
5. **Build fixture library**: Create `@draw` components for toilets, sinks, etc.

## 🔮 Future Enhancements

See `ROADMAP.md` and `specification.md` Milestone 5 for:

- Arc and bezier primitives
- Path DSL
- Classical architectural ornaments
- SVG export with curves
- Component marketplace

---

_Last updated: October 3, 2025_
