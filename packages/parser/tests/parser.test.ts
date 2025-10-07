import { describe, it, expect } from "vitest";
import { tokenize } from "../src/tokenizer.js";
import { parse } from "../src/parser.js";

describe("Parser", () => {
  it("should parse @unit declaration", () => {
    const source = `
      @unit U = 50px;
      
      @draw Test {
        @canvas 10U x 10U;
      }
    `;
    const tokens = tokenize(source);
    const result = parse(tokens);

    expect(result.errors).toHaveLength(0);
    expect(result.ast.units).toHaveLength(1);
    expect(result.ast.units[0].name).toBe("U");
    expect(result.ast.units[0].value).toBe(50);
    expect(result.ast.units[0].unit).toBe("px");
  });

  it("should parse basic draw with canvas", () => {
    const source = `
      @unit U = 48px;
      
      @draw MyHome {
        @canvas 18U x 10U;
      }
    `;
    const tokens = tokenize(source);
    const result = parse(tokens);

    expect(result.errors).toHaveLength(0);
    expect(result.ast.name).toBe("MyHome");
    expect(result.ast.canvas.width).toBe(18);
    expect(result.ast.canvas.height).toBe(10);
    expect(result.ast.canvas.unit).toBe("U");
    expect(result.ast.units).toHaveLength(1);
    expect(result.ast.units[0].name).toBe("U");
    expect(result.ast.units[0].value).toBe(48);
  });

  it("should parse draw with room", () => {
    const source = `
      @unit U = 48px;
      
      @draw MyHome {
        @canvas 18U x 10U;
        
        room living at (1U, 1U) size (6U, 4U) {
          label: "Living Room";
        }
      }
    `;
    const tokens = tokenize(source);
    const result = parse(tokens);

    expect(result.errors).toHaveLength(0);
    expect(result.ast.rooms).toHaveLength(1);

    const room = result.ast.rooms[0];
    expect(room.id).toBe("living");
    expect(room.x).toBe(1);
    expect(room.y).toBe(1);
    expect(room.width).toBe(6);
    expect(room.height).toBe(4);
    expect(room.unit).toBe("U");
    expect(room.label).toBe("Living Room");
  });

  it("should parse multiple rooms", () => {
    const source = `
      @unit U = 48px;
      
      @draw MyHome {
        @canvas 18U x 10U;
        
        room living at (1U, 1U) size (6U, 4U) {
          label: "Living Room";
        }
        
        room kitchen at (8U, 1U) size (5U, 3U) {
          label: "Kitchen";
        }
      }
    `;
    const tokens = tokenize(source);
    const result = parse(tokens);

    expect(result.errors).toHaveLength(0);
    expect(result.ast.rooms).toHaveLength(2);
    expect(result.ast.rooms[0].id).toBe("living");
    expect(result.ast.rooms[1].id).toBe("kitchen");
  });

  it("should parse wall", () => {
    const source = `
      @unit U = 48px;
      
      @draw MyHome {
        @canvas 18U x 10U;
        
        wall from (1U, 5U) to (13U, 5U);
      }
    `;
    const tokens = tokenize(source);
    const result = parse(tokens);

    expect(result.errors).toHaveLength(0);
    expect(result.ast.walls).toHaveLength(1);

    const wall = result.ast.walls[0];
    expect(wall.x1).toBe(1);
    expect(wall.y1).toBe(5);
    expect(wall.x2).toBe(13);
    expect(wall.y2).toBe(5);
    expect(wall.unit).toBe("U");
  });

  it("should parse door", () => {
    const source = `
      @unit U = 48px;
      
      @draw MyHome {
        @canvas 18U x 10U;
        
        door from (7U, 2U) to (7U, 3U) width 0.9U;
      }
    `;
    const tokens = tokenize(source);
    const result = parse(tokens);

    expect(result.errors).toHaveLength(0);
    expect(result.ast.doors).toHaveLength(1);

    const door = result.ast.doors[0];
    expect(door.x1).toBe(7);
    expect(door.y1).toBe(2);
    expect(door.x2).toBe(7);
    expect(door.y2).toBe(3);
    expect(door.width).toBe(0.9);
  });

  it("should parse @grid directive", () => {
    const source = `
      @unit U = 48px;
      
      @draw MyHome {
        @canvas 18U x 10U;
        @grid grid size 1U;
      }
    `;
    const tokens = tokenize(source);
    const result = parse(tokens);

    expect(result.errors).toHaveLength(0);
    expect(result.ast.grids).toHaveLength(1);

    const grid = result.ast.grids[0];
    expect(grid.mode).toBe("grid");
    expect(grid.sizeX).toBe(1);
    expect(grid.sizeY).toBe(1);
    expect(grid.unit).toBe("U");
  });

  it("should parse complete home example", () => {
    const source = `
      @unit U = 48px;

      @draw MyHome {
        @canvas 18U x 10U;
        
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
    const result = parse(tokens);

    expect(result.errors).toHaveLength(0);
    expect(result.ast.name).toBe("MyHome");
    expect(result.ast.units).toHaveLength(1);
    expect(result.ast.rooms).toHaveLength(3);
    expect(result.ast.walls).toHaveLength(2);
    expect(result.ast.doors).toHaveLength(1);
  });

  it("should parse decimal numbers", () => {
    const source = `
      @unit U = 48px;
      
      @draw MyHome {
        @canvas 18U x 10U;
        
        door from (7.5U, 2U) to (7.5U, 3U) width 0.9U;
      }
    `;
    const tokens = tokenize(source);
    const result = parse(tokens);

    expect(result.errors).toHaveLength(0);
    expect(result.ast.doors[0].x1).toBe(7.5);
    expect(result.ast.doors[0].width).toBe(0.9);
  });

  it("should parse room without label", () => {
    const source = `
      @unit U = 48px;
      
      @draw MyHome {
        @canvas 18U x 10U;
        
        room living at (1U, 1U) size (6U, 4U);
      }
    `;
    const tokens = tokenize(source);
    const result = parse(tokens);

    expect(result.errors).toHaveLength(0);
    expect(result.ast.rooms).toHaveLength(1);
    expect(result.ast.rooms[0].label).toBeUndefined();
  });

  it("should handle errors gracefully", () => {
    const source = `
      @draw MyHome {
        invalid syntax here
      }
    `;
    const tokens = tokenize(source);
    const result = parse(tokens);

    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("should parse multiple unit declarations", () => {
    const source = `
      @unit U = 50px;
      @unit cm = 37.795px;
      @unit m = 100cm;
      
      @draw Studio {
        @canvas 12m x 8m;
      }
    `;
    const tokens = tokenize(source);
    const result = parse(tokens);

    expect(result.errors).toHaveLength(0);
    expect(result.ast.units).toHaveLength(3);
    expect(result.ast.units[0].name).toBe("U");
    expect(result.ast.units[1].name).toBe("cm");
    expect(result.ast.units[2].name).toBe("m");
  });

  it("should parse repeat pattern", () => {
    const source = `
      @unit U = 50px;
      
      @draw Test {
        @canvas 10U x 10U;
        
        repeat Window from (0U, 0U) to (8U, 0U) space 2U;
      }
    `;
    const tokens = tokenize(source);
    const result = parse(tokens);

    expect(result.errors).toHaveLength(0);
    expect(result.ast.repeats).toHaveLength(1);

    const repeat = result.ast.repeats[0];
    expect(repeat.component).toBe("Window");
    expect(repeat.x1).toBe(0);
    expect(repeat.y1).toBe(0);
    expect(repeat.x2).toBe(8);
    expect(repeat.y2).toBe(0);
    expect(repeat.spacing).toBe(2);
    expect(repeat.unit).toBe("U");
  });

  it("should parse vertical repeat pattern", () => {
    const source = `
      @unit U = 50px;
      
      @draw Test {
        @canvas 10U x 10U;
        
        repeat Window from (0U, 0U) to (0U, 10U) space 1.5U;
      }
    `;
    const tokens = tokenize(source);
    const result = parse(tokens);

    expect(result.errors).toHaveLength(0);
    expect(result.ast.repeats).toHaveLength(1);

    const repeat = result.ast.repeats[0];
    expect(repeat.x1).toBe(0);
    expect(repeat.y1).toBe(0);
    expect(repeat.x2).toBe(0);
    expect(repeat.y2).toBe(10);
    expect(repeat.spacing).toBe(1.5);
  });

  it("should parse clean syntax without unit names", () => {
    const source = `
      @unit = 50px;
      
      @draw CleanHome {
        @canvas 20 x 10;
        
        room living at (1, 1) size (6, 4) {
          label: "Living";
        }
        
        wall from (1, 5) to (13, 5);
      }
    `;
    const tokens = tokenize(source);
    const result = parse(tokens);

    expect(result.errors).toHaveLength(0);
    expect(result.ast.units).toHaveLength(1);
    expect(result.ast.units[0].name).toBe("U"); // Defaults to U
    expect(result.ast.units[0].value).toBe(50);
    expect(result.ast.rooms[0].x).toBe(1);
    expect(result.ast.rooms[0].unit).toBe("U"); // Defaults to U
    expect(result.ast.walls[0].x1).toBe(1);
  });
});
