/**
 * Compiler for archcss
 * Converts AST to a compiled model ready for CSS generation and runtime
 */

import type { Plan, CompiledModel, UnitDeclaration } from "./types.js";

export class Compiler {
  private unitMap: Map<string, number> = new Map(); // unit name -> px value
  private baseUnitPx = 50; // default

  constructor(private ast: Plan) {}

  /**
   * Resolve all unit declarations to pixel values
   */
  private resolveUnits(): void {
    // Start with base unit (U)
    const baseUnitDecl = this.ast.units.find((u) => u.name === "U");
    if (baseUnitDecl) {
      this.baseUnitPx = this.resolveUnitValue(baseUnitDecl);
      this.unitMap.set("U", this.baseUnitPx);
    } else {
      // Default if no U is defined
      this.unitMap.set("U", 50);
    }

    // Resolve all other units
    let maxIterations = 10; // Prevent infinite loops
    let changed = true;

    while (changed && maxIterations-- > 0) {
      changed = false;

      for (const unit of this.ast.units) {
        if (this.unitMap.has(unit.name)) continue;

        const resolved = this.tryResolveUnit(unit);
        if (resolved !== null) {
          this.unitMap.set(unit.name, resolved);
          changed = true;
        }
      }
    }

    // Warn about unresolved units
    for (const unit of this.ast.units) {
      if (!this.unitMap.has(unit.name)) {
        console.warn(`Could not resolve unit: ${unit.name}`);
      }
    }
  }

  /**
   * Try to resolve a unit declaration to pixels
   */
  private tryResolveUnit(unit: UnitDeclaration): number | null {
    // If the unit it references is already resolved, we can resolve this one
    if (this.unitMap.has(unit.unit)) {
      return unit.value * this.unitMap.get(unit.unit)!;
    }

    // Try to resolve common CSS units
    const pxValue = this.cssUnitToPx(unit.value, unit.unit);
    if (pxValue !== null) {
      return pxValue;
    }

    return null;
  }

  /**
   * Resolve a unit declaration to pixels
   */
  private resolveUnitValue(unit: UnitDeclaration): number {
    // If the unit it references is already in our map
    if (this.unitMap.has(unit.unit)) {
      return unit.value * this.unitMap.get(unit.unit)!;
    }

    // Otherwise try to resolve as CSS unit
    const pxValue = this.cssUnitToPx(unit.value, unit.unit);
    if (pxValue !== null) {
      return pxValue;
    }

    // Default fallback
    return unit.value;
  }

  /**
   * Convert CSS units to pixels (assuming 96 DPI)
   */
  private cssUnitToPx(value: number, unit: string): number | null {
    switch (unit) {
      case "px":
        return value;
      case "cm":
        return value * 37.795275591; // 96 DPI
      case "mm":
        return value * 3.7795275591;
      case "in":
        return value * 96;
      case "pt":
        return value * (96 / 72);
      case "pc":
        return value * 16;
      case "rem":
        return value * 16; // Assume 16px root font
      case "em":
        return value * 16; // Assume 16px
      default:
        return null;
    }
  }

  /**
   * Convert a value in a given unit to the base unit (U)
   */
  private toBaseUnit(value: number, unit: string): number {
    const unitPx = this.unitMap.get(unit);
    if (!unitPx) {
      console.warn(`Unknown unit: ${unit}, using value as-is`);
      return value;
    }

    return (value * unitPx) / this.baseUnitPx;
  }

  /**
   * Expand repeat patterns into multiple instances
   */
  private expandRepeats(): void {
    for (const repeat of this.ast.repeats) {
      const dx = repeat.x2 - repeat.x1;
      const dy = repeat.y2 - repeat.y1;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const count = Math.floor(distance / repeat.spacing) + 1;

      // Generate positions along the path
      for (let i = 0; i < count; i++) {
        const t = i / Math.max(count - 1, 1);
        const x = repeat.x1 + dx * t;
        const y = repeat.y1 + dy * t;

        // TODO(specification.md §Modules, imports, and composition; project-plan.md Next Steps #2): Replace placeholder rooms with instantiated components once the file-based component system is available.
        this.ast.rooms.push({
          type: "Room",
          id: `${repeat.component.toLowerCase()}_${i}`,
          x,
          y,
          width: 0.3, // Small size for window/door representation
          height: 0.3,
          unit: repeat.unit,
          label: repeat.component,
          loc: repeat.loc,
        });
      }
    }
  }

  /**
   * Compile the AST to a model ready for runtime
   */
  compile(): CompiledModel {
    this.resolveUnits();

    // Expand repeat patterns before compilation
    this.expandRepeats();
    // TODO(specification.md §Roadmap Milestone 2; project-plan.md Phase 5): Run overlap and bounds validation before emitting the compiled model.

    // Convert canvas to grid columns/rows
    const canvasCols = this.toBaseUnit(
      this.ast.canvas.width,
      this.ast.canvas.unit
    );
    const canvasRows = this.toBaseUnit(
      this.ast.canvas.height,
      this.ast.canvas.unit
    );

    // Compile rooms
    const rooms = this.ast.rooms.map((room) => ({
      id: room.id,
      x: this.toBaseUnit(room.x, room.unit),
      y: this.toBaseUnit(room.y, room.unit),
      w: this.toBaseUnit(room.width, room.unit),
      h: this.toBaseUnit(room.height, room.unit),
      label: room.label,
      css: room.properties as Record<string, string> | undefined,
    }));

    // Compile walls with length and angle
    const walls = this.ast.walls.map((wall) => {
      const x1 = this.toBaseUnit(wall.x1, wall.unit);
      const y1 = this.toBaseUnit(wall.y1, wall.unit);
      const x2 = this.toBaseUnit(wall.x2, wall.unit);
      const y2 = this.toBaseUnit(wall.y2, wall.unit);

      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      return { x1, y1, x2, y2, length, angle };
    });

    // Compile doors with length and angle
    const doors = this.ast.doors.map((door) => {
      const x1 = this.toBaseUnit(door.x1, door.unit);
      const y1 = this.toBaseUnit(door.y1, door.unit);
      const x2 = this.toBaseUnit(door.x2, door.unit);
      const y2 = this.toBaseUnit(door.y2, door.unit);

      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      return {
        x1,
        y1,
        x2,
        y2,
        width: this.toBaseUnit(door.width, door.unit),
        length,
        angle,
      };
    });

    // Compile grids
    const grids = this.ast.grids.map((grid) => ({
      mode: grid.mode,
      sx: this.toBaseUnit(grid.sizeX, grid.unit),
      sy: this.toBaseUnit(grid.sizeY, grid.unit),
      color: grid.color,
      alpha: grid.alpha,
    }));

    // Build unit map for export
    const units: Record<string, number> = {};
    this.unitMap.forEach((value, key) => {
      units[key] = value;
    });

    return {
      scale: this.baseUnitPx,
      canvas: {
        cols: canvasCols,
        rows: canvasRows,
      },
      units,
      rooms,
      walls,
      doors,
      grids,
    };
  }
}

/**
 * Compile an AST to a compiled model
 */
export function compile(ast: Plan): CompiledModel {
  const compiler = new Compiler(ast);
  return compiler.compile();
}
