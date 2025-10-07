/**
 * Core types for archcss AST and model
 */

export interface Position {
  line: number;
  column: number;
  offset: number;
}

export interface SourceLocation {
  start: Position;
  end: Position;
}

export interface BaseNode {
  type: string;
  loc?: SourceLocation;
}

// Unit declarations
export interface UnitDeclaration extends BaseNode {
  type: "UnitDeclaration";
  name: string;
  value: number;
  unit: string; // e.g., 'px', 'cm', 'rem'
}

// Canvas
export interface Canvas {
  width: number;
  height: number;
  unit: string;
}

// Room
export interface Room extends BaseNode {
  type: "Room";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  unit: string;
  label?: string;
  properties?: Record<string, unknown>;
}

// Wall
export interface Wall extends BaseNode {
  type: "Wall";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  unit: string;
  thickness?: number;
}

// Door
export interface Door extends BaseNode {
  type: "Door";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  unit: string;
}

// Grid
export type GridMode = "grid" | "vlines" | "hlines" | "lines" | "dotted";

export interface Grid extends BaseNode {
  type: "Grid";
  mode: GridMode;
  sizeX: number;
  sizeY: number;
  unit: string;
  color?: string;
  alpha?: number;
}

// TODO(project-plan.md Next Steps #2; specification.md §Modules, imports, and composition): Add ImportDeclaration and UsePlacement types for file-based component system.
// Module
export interface ModuleDeclaration extends BaseNode {
  type: "ModuleDeclaration";
  name: string;
}

// Import
export interface ImportDeclaration extends BaseNode {
  type: "ImportDeclaration";
  name: string;
  alias?: string;
  from?: string; // path if explicit, undefined if implicit
  unitConfig?: UnitConfig;
}

export interface UnitConfig {
  base?: string;
  add?: Record<string, string>;
}

// Export
export interface ExportDeclaration extends BaseNode {
  type: "ExportDeclaration";
  name: string;
  isDefault?: boolean;
}

// Use (placement)
export interface UsePlacement extends BaseNode {
  type: "UsePlacement";
  module: string;
  export?: string; // specific export, or undefined for whole module
  x?: number;
  y?: number;
  unit?: string;
  rotate?: number;
  scale?: number;
}

// Repeat (pattern placement)
export interface RepeatPattern extends BaseNode {
  type: "RepeatPattern";
  component: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  spacing: number;
  unit: string;
}

// Draw block (primary top-level definition)
export interface Plan extends BaseNode {
  type: "Draw";
  name: string;
  canvas: Canvas;
  units: UnitDeclaration[];
  rooms: Room[];
  walls: Wall[];
  doors: Door[];
  grids: Grid[];
  imports: ImportDeclaration[];
  exports: ExportDeclaration[];
  uses: UsePlacement[];
  repeats: RepeatPattern[];
  module?: ModuleDeclaration;
}

// Compiled model (what gets sent to runtime)
export interface CompiledModel {
  scale: number; // --u in pixels
  canvas: {
    cols: number;
    rows: number;
  };
  units: Record<string, number>; // unit name -> px value
  rooms: Array<{
    id: string;
    x: number; // in U
    y: number;
    w: number;
    h: number;
    label?: string;
    css?: Record<string, string>;
  }>;
  walls: Array<{
    x1: number; // in U
    y1: number;
    x2: number;
    y2: number;
    length?: number;
    angle?: number;
  }>;
  doors: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    length?: number;
    angle?: number;
  }>;
  grids?: Array<{
    mode: GridMode;
    sx: number; // in U
    sy: number;
    color?: string;
    alpha?: number;
  }>;
}

// Parse result
export interface ParseResult {
  ast: Plan;
  errors: ParseError[];
}

export interface ParseError {
  message: string;
  loc?: SourceLocation;
  severity: "error" | "warning";
}
