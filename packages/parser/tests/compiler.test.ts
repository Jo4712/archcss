import { describe, it, expect } from "vitest";
import { tokenize } from "../src/tokenizer.js";
import { parse } from "../src/parser.js";
import { compile } from "../src/compiler.js";

describe("Compiler", () => {
  it("should compile basic plan to model", () => {
    const source = `
      @unit U = 50px;
      
      @plan Test {
        @canvas 10U x 8U;
        
        room living at (1U, 1U) size (4U, 3U) {
          label: "Living";
        }
      }
    `;

    const tokens = tokenize(source);
    const parseResult = parse(tokens);
    const model = compile(parseResult.ast);

    expect(model.scale).toBe(50);
    expect(model.canvas.cols).toBe(10);
    expect(model.canvas.rows).toBe(8);
    expect(model.rooms).toHaveLength(1);
    expect(model.rooms[0].id).toBe("living");
    expect(model.rooms[0].x).toBe(1);
    expect(model.rooms[0].y).toBe(1);
    expect(model.rooms[0].w).toBe(4);
    expect(model.rooms[0].h).toBe(3);
    expect(model.rooms[0].label).toBe("Living");
  });

  it("should compile walls with length and angle", () => {
    const source = `
      @unit U = 50px;
      
      @plan Test {
        @canvas 10U x 10U;
        wall from (0U, 0U) to (5U, 0U);
        wall from (0U, 0U) to (0U, 5U);
      }
    `;

    const tokens = tokenize(source);
    const parseResult = parse(tokens);
    const model = compile(parseResult.ast);

    expect(model.walls).toHaveLength(2);

    // Horizontal wall
    expect(model.walls[0].x1).toBe(0);
    expect(model.walls[0].y1).toBe(0);
    expect(model.walls[0].x2).toBe(5);
    expect(model.walls[0].y2).toBe(0);
    expect(model.walls[0].length).toBe(5);
    expect(model.walls[0].angle).toBe(0);

    // Vertical wall
    expect(model.walls[1].x1).toBe(0);
    expect(model.walls[1].y1).toBe(0);
    expect(model.walls[1].x2).toBe(0);
    expect(model.walls[1].y2).toBe(5);
    expect(model.walls[1].length).toBe(5);
    expect(model.walls[1].angle).toBe(90);
  });

  it("should resolve chained units", () => {
    const source = `
      @unit U = 50px;
      @unit cm = 37.795px;
      @unit m = 100cm;
      
      @plan Test {
        @canvas 10m x 8m;
        
        room living at (1m, 1m) size (4m, 3m) {
          label: "Living";
        }
      }
    `;

    const tokens = tokenize(source);
    const parseResult = parse(tokens);
    const model = compile(parseResult.ast);

    // 1m = 100cm = 100 * 37.795px = 3779.5px
    // 10m in U = 3779.5 * 10 / 50 = 755.9
    expect(model.canvas.cols).toBeCloseTo(755.9, 1);
    expect(model.canvas.rows).toBeCloseTo(604.72, 1);

    // 1m in U = 3779.5 / 50 = 75.59
    expect(model.rooms[0].x).toBeCloseTo(75.59, 1);
    expect(model.rooms[0].y).toBeCloseTo(75.59, 1);
    expect(model.rooms[0].w).toBeCloseTo(302.36, 1);
    expect(model.rooms[0].h).toBeCloseTo(226.77, 1);
  });

  it("should compile grid", () => {
    const source = `
      @unit U = 48px;
      
      @plan Test {
        @canvas 10U x 10U;
        @grid grid size 1U color #ccc alpha 0.15;
      }
    `;

    const tokens = tokenize(source);
    const parseResult = parse(tokens);
    const model = compile(parseResult.ast);

    expect(model.grids).toHaveLength(1);
    expect(model.grids![0].mode).toBe("grid");
    expect(model.grids![0].sx).toBe(1);
    expect(model.grids![0].sy).toBe(1);
    expect(model.grids![0].color).toBe("#ccc");
    expect(model.grids![0].alpha).toBe(0.15);
  });

  it("should compile home example", () => {
    const source = `
      @unit U = 48px;

      @plan MyHome {
        @canvas 18U x 10U;
        @grid grid size 1U color #ccc alpha 0.15;
        
        room living at (1U, 1U) size (6U, 4U) {
          label: "Living Room";
        }
        
        room kitchen at (8U, 1U) size (5U, 3U) {
          label: "Kitchen";
        }
        
        room bedroom at (1U, 6U) size (5U, 3U) {
          label: "Bedroom";
        }
        
        wall from (1U, 5U) to (13U, 5U);
        wall from (7U, 1U) to (7U, 4U);
        
        door from (7U, 2U) to (7U, 3U) width 0.9U;
      }
    `;

    const tokens = tokenize(source);
    const parseResult = parse(tokens);
    const model = compile(parseResult.ast);

    expect(model.scale).toBe(48);
    expect(model.canvas.cols).toBe(18);
    expect(model.canvas.rows).toBe(10);
    expect(model.rooms).toHaveLength(3);
    expect(model.walls).toHaveLength(2);
    expect(model.doors).toHaveLength(1);
    expect(model.grids).toHaveLength(1);
  });

  it("should expand repeat patterns into multiple instances", () => {
    const source = `
      @unit U = 50px;
      
      @plan Test {
        @canvas 10U x 10U;
        
        /* Repeat windows from 0 to 8 with spacing 2 */
        repeat Window from (0U, 0U) to (8U, 0U) space 2U;
      }
    `;

    const tokens = tokenize(source);
    const parseResult = parse(tokens);

    // Check parsing
    expect(parseResult.errors).toHaveLength(0);
    expect(parseResult.ast.repeats).toHaveLength(1);

    const model = compile(parseResult.ast);

    // Should expand to 5 instances: 0U, 2U, 4U, 6U, 8U
    expect(model.rooms.length).toBeGreaterThanOrEqual(5);

    // Check window instances were created
    const windows = model.rooms.filter((r) => r.label === "Window");
    expect(windows.length).toBe(5);

    // Check spacing
    expect(windows[0].x).toBe(0);
    expect(windows[1].x).toBe(2);
    expect(windows[2].x).toBe(4);
    expect(windows[3].x).toBe(6);
    expect(windows[4].x).toBe(8);
  });

  it("should expand vertical repeat patterns", () => {
    const source = `
      @unit U = 50px;
      
      @plan Test {
        @canvas 10U x 10U;
        
        repeat Window from (0U, 0U) to (0U, 6U) space 2U;
      }
    `;

    const tokens = tokenize(source);
    const parseResult = parse(tokens);
    const model = compile(parseResult.ast);

    const windows = model.rooms.filter((r) => r.label === "Window");
    expect(windows.length).toBe(4); // 0U, 2U, 4U, 6U

    // All should have same x, different y
    expect(windows[0].y).toBe(0);
    expect(windows[1].y).toBe(2);
    expect(windows[2].y).toBe(4);
    expect(windows[3].y).toBe(6);
  });
});
