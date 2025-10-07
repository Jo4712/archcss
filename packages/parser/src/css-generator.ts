/**
 * CSS Generator for ArchCSS
 * Converts compiled model to CSS
 */

import type { CompiledModel } from "./types.js";

export class CSSGenerator {
  private css: string[] = [];

  constructor(private model: CompiledModel) {}

  /**
   * Generate CSS for the drawing wrapper
   */
  private generatePlanCSS(): void {
    const { scale, canvas } = this.model;

    this.css.push(`.draw {`);
    this.css.push(`  /* CSS custom properties */`);
    this.css.push(`  --u: ${scale}px;`);
    this.css.push(`  --cols: ${canvas.cols};`);
    this.css.push(`  --rows: ${canvas.rows};`);
    this.css.push(``);
    this.css.push(`  /* Layout */`);
    this.css.push(`  position: relative;`);
    this.css.push(`  width: calc(var(--cols) * var(--u));`);
    this.css.push(`  height: calc(var(--rows) * var(--u));`);
    this.css.push(`  overflow: hidden;`);
    this.css.push(``);
    this.css.push(`  /* Default styling */`);
    this.css.push(`  background: #fafafa;`);
    this.css.push(`  color: #333;`);
    this.css.push(`  font-family: system-ui, -apple-system, sans-serif;`);
    this.css.push(`}`);
    this.css.push(``);
  }

  /**
   * Generate grid background pattern
   */
  private generateGridCSS(): void {
    if (!this.model.grids || this.model.grids.length === 0) return;

    const grid = this.model.grids[0]; // Use first grid
    if (!grid) return;

    const color = grid.color || "#ddd";
    const alpha = grid.alpha !== undefined ? grid.alpha : 0.1;

    // Calculate alpha into the color
    const gridColor = this.colorWithAlpha(color, alpha);

    this.css.push(`.draw[data-grid="${grid.mode}"],`);
    this.css.push(`.draw[data-grid="grid"],`);
    this.css.push(`.draw[data-grid="lines"] {`);

    if (grid.mode === "dotted") {
      // Dotted grid using radial gradient
      this.css.push(
        `  background-image: radial-gradient(circle at center, ${gridColor} 1px, transparent 1px);`
      );
      this.css.push(
        `  background-size: calc(var(--u) * ${grid.sx}) calc(var(--u) * ${grid.sy});`
      );
    } else if (grid.mode === "vlines") {
      // Vertical lines only
      this.css.push(`  background-image: repeating-linear-gradient(`);
      this.css.push(`    to right,`);
      this.css.push(`    ${gridColor} 0 1px,`);
      this.css.push(`    transparent 1px calc(var(--u) * ${grid.sx})`);
      this.css.push(`  );`);
    } else if (grid.mode === "hlines") {
      // Horizontal lines only
      this.css.push(`  background-image: repeating-linear-gradient(`);
      this.css.push(`    to bottom,`);
      this.css.push(`    ${gridColor} 0 1px,`);
      this.css.push(`    transparent 1px calc(var(--u) * ${grid.sy})`);
      this.css.push(`  );`);
    } else {
      // Both vertical and horizontal lines
      this.css.push(`  background-image:`);
      this.css.push(`    repeating-linear-gradient(`);
      this.css.push(`      to right,`);
      this.css.push(`      ${gridColor} 0 1px,`);
      this.css.push(`      transparent 1px calc(var(--u) * ${grid.sx})`);
      this.css.push(`    ),`);
      this.css.push(`    repeating-linear-gradient(`);
      this.css.push(`      to bottom,`);
      this.css.push(`      ${gridColor} 0 1px,`);
      this.css.push(`      transparent 1px calc(var(--u) * ${grid.sy})`);
      this.css.push(`    );`);
    }

    this.css.push(`}`);
    this.css.push(``);
  }

  /**
   * Convert color with alpha to rgba or keep as-is
   */
  private colorWithAlpha(color: string, alpha: number): string {
    if (color.startsWith("#")) {
      // Convert hex to rgba
      const hex = color.slice(1);
      let r = 0,
        g = 0,
        b = 0;

      if (hex.length === 3) {
        r = parseInt((hex[0] || "0") + (hex[0] || "0"), 16);
        g = parseInt((hex[1] || "0") + (hex[1] || "0"), 16);
        b = parseInt((hex[2] || "0") + (hex[2] || "0"), 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2) || "00", 16);
        g = parseInt(hex.slice(2, 4) || "00", 16);
        b = parseInt(hex.slice(4, 6) || "00", 16);
      } else {
        return color; // Invalid hex
      }

      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // For named colors or other formats, use color-mix if available
    return `color-mix(in srgb, ${color} ${alpha * 100}%, transparent)`;
  }

  /**
   * Generate CSS for room base styles
   */
  private generateRoomBaseCSS(): void {
    this.css.push(`.room {`);
    this.css.push(`  position: absolute;`);
    this.css.push(`  left: calc(var(--x) * var(--u));`);
    this.css.push(`  top: calc(var(--y) * var(--u));`);
    this.css.push(`  width: calc(var(--w) * var(--u));`);
    this.css.push(`  height: calc(var(--h) * var(--u));`);
    this.css.push(`  background: rgba(255, 255, 255, 0.9);`);
    this.css.push(`  border: 2px solid #333;`);
    this.css.push(`  box-sizing: border-box;`);
    this.css.push(`}`);
    this.css.push(``);

    // Window style (for repeated window components)
    this.css.push(`.room[data-label="Window"] {`);
    this.css.push(
      `  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);`
    );
    this.css.push(`  border: 2px solid #1976d2;`);
    this.css.push(`  z-index: 8;`);
    this.css.push(`}`);
    this.css.push(``);

    this.css.push(`.room::after {`);
    this.css.push(`  content: attr(data-label);`);
    this.css.push(`  position: absolute;`);
    this.css.push(`  inset: 0;`);
    this.css.push(`  display: flex;`);
    this.css.push(`  align-items: center;`);
    this.css.push(`  justify-content: center;`);
    this.css.push(`  font-size: 14px;`);
    this.css.push(`  font-weight: 500;`);
    this.css.push(`  text-align: center;`);
    this.css.push(`  padding: 8px;`);
    this.css.push(`  pointer-events: none;`);
    this.css.push(`}`);
    this.css.push(``);

    // Hide labels for small windows
    this.css.push(`.room[data-label="Window"]::after {`);
    this.css.push(`  font-size: 0;`);
    this.css.push(`}`);
    this.css.push(``);
  }

  /**
   * Generate CSS for wall base styles
   */
  private generateWallBaseCSS(): void {
    this.css.push(`.wall {`);
    this.css.push(`  position: absolute;`);
    this.css.push(`  left: calc(var(--x) * var(--u));`);
    this.css.push(`  top: calc(var(--y) * var(--u));`);
    this.css.push(`  width: calc(var(--len) * var(--u));`);
    this.css.push(`  height: 4px;`);
    this.css.push(`  background: #333;`);
    this.css.push(`  transform-origin: left center;`);
    this.css.push(`  transform: rotate(calc(var(--angle) * 1deg));`);
    this.css.push(`  pointer-events: none;`);
    this.css.push(`  z-index: 5;`);
    this.css.push(`}`);
    this.css.push(``);
  }

  /**
   * Generate CSS for door base styles
   */
  private generateDoorBaseCSS(): void {
    this.css.push(`.door {`);
    this.css.push(`  position: absolute;`);
    this.css.push(`  left: calc(var(--x) * var(--u));`);
    this.css.push(`  top: calc(var(--y) * var(--u));`);
    this.css.push(`  width: calc(var(--len) * var(--u));`);
    this.css.push(`  height: calc(var(--w) * var(--u));`);
    this.css.push(`  background: white;`);
    this.css.push(`  border: 2px solid #4080ff;`);
    this.css.push(`  box-sizing: border-box;`);
    this.css.push(`  transform-origin: left center;`);
    this.css.push(`  transform: rotate(calc(var(--angle) * 1deg));`);
    this.css.push(`  pointer-events: none;`);
    this.css.push(`  z-index: 10;`);
    this.css.push(`}`);
    this.css.push(``);
  }

  /**
   * Generate complete CSS
   */
  generate(): string {
    this.css = [];

    this.css.push(`/* Generated by ArchCSS */`);
    this.css.push(``);

    // Drawing wrapper
    this.generatePlanCSS();

    // Grid pattern
    this.generateGridCSS();

    // Base styles for elements
    this.generateRoomBaseCSS();
    this.generateWallBaseCSS();
    this.generateDoorBaseCSS();

    return this.css.join("\n");
  }
}

/**
 * Generate CSS from a compiled model
 */
export function generateCSS(model: CompiledModel): string {
  const generator = new CSSGenerator(model);
  return generator.generate();
}
