/**
 * Parser for archcss
 * Converts tokens into an AST
 */

import type { Token } from "./tokenizer.js";
import { TokenType } from "./tokenizer.js";
import type {
  Plan,
  UnitDeclaration,
  Canvas,
  Room,
  Wall,
  Door,
  Grid,
  ModuleDeclaration,
  ImportDeclaration,
  ExportDeclaration,
  UsePlacement,
  RepeatPattern,
  ParseResult,
  ParseError,
} from "./types.js";

export class Parser {
  private tokens: Token[];
  private pos = 0;
  private errors: ParseError[] = [];

  constructor(tokens: Token[]) {
    this.tokens = tokens.filter(
      (t) => t.type !== TokenType.WHITESPACE && t.type !== TokenType.COMMENT
    );
  }

  private get current(): Token {
    const token = this.tokens[this.pos];
    if (!token && this.tokens.length > 0) {
      return this.tokens[this.tokens.length - 1]!;
    }
    return (
      token || {
        type: TokenType.EOF,
        value: "",
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      }
    );
  }

  private peek(offset = 1): Token {
    const token = this.tokens[this.pos + offset];
    if (!token && this.tokens.length > 0) {
      return this.tokens[this.tokens.length - 1]!;
    }
    return (
      token || {
        type: TokenType.EOF,
        value: "",
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      }
    );
  }

  private advance(): Token {
    const token = this.tokens[this.pos++];
    return (
      token || {
        type: TokenType.EOF,
        value: "",
        start: { line: 0, column: 0, offset: 0 },
        end: { line: 0, column: 0, offset: 0 },
      }
    );
  }

  private expect(type: TokenType): Token {
    if (this.current.type !== type) {
      this.error(`Expected ${type}, got ${this.current.type}`);
      // Return current token even on error to avoid undefined
      return this.current;
    }
    return this.advance();
  }

  private match(...types: TokenType[]): boolean {
    return types.includes(this.current.type);
  }

  private error(message: string): void {
    this.errors.push({
      message,
      loc: {
        start: this.current.start,
        end: this.current.end,
      },
      severity: "error",
    });
  }

  // Parse number with optional unit
  private parseNumberWithUnit(): { value: number; unit: string } {
    const numToken = this.expect(TokenType.NUMBER);
    const value = parseFloat(numToken.value);

    let unit = "U"; // default unit
    if (this.current.type === TokenType.IDENTIFIER) {
      unit = this.advance().value;
    }

    return { value, unit };
  }

  // Parse coordinate pair: (x, y)
  private parseCoordinate(): { x: number; y: number; unit: string } {
    this.expect(TokenType.LPAREN);
    const x = this.parseNumberWithUnit();
    this.expect(TokenType.COMMA);
    const y = this.parseNumberWithUnit();
    this.expect(TokenType.RPAREN);

    return { x: x.value, y: y.value, unit: x.unit };
  }

  // Parse @unit declaration
  private parseUnitDeclaration(): UnitDeclaration {
    const start = this.current.start;
    this.expect(TokenType.AT_UNIT);

    // Allow @unit = 50px; (defaults to U) or @unit U = 50px;
    let name = "U";
    if (this.current.type === TokenType.IDENTIFIER) {
      // Check if next token is EQUALS - if so, this identifier is the unit name
      if (this.peek().type === TokenType.EQUALS) {
        name = this.advance().value;
      }
      // Otherwise it defaults to U and this identifier is part of the value
    }

    this.expect(TokenType.EQUALS);

    const value = this.parseNumberWithUnit();
    this.expect(TokenType.SEMICOLON);

    return {
      type: "UnitDeclaration",
      name,
      value: value.value,
      unit: value.unit,
      loc: { start, end: this.current.end },
    };
  }

  // Parse @canvas
  private parseCanvas(): Canvas {
    this.expect(TokenType.AT_CANVAS);

    const width = this.parseNumberWithUnit();
    // Accept either 'x' or 'X' as separator
    if (this.match(TokenType.X)) {
      this.advance();
    } else if (this.current.value === "x" || this.current.value === "X") {
      this.advance();
    }
    const height = this.parseNumberWithUnit();
    this.expect(TokenType.SEMICOLON);

    return {
      width: width.value,
      height: height.value,
      unit: width.unit,
    };
  }

  // Parse room
  private parseRoom(): Room {
    const start = this.current.start;
    this.expect(TokenType.ROOM);

    const id = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.AT);

    const pos = this.parseCoordinate();
    this.expect(TokenType.SIZE);
    const size = this.parseCoordinate();

    let label: string | undefined;
    const cssProperties: Record<string, string> = {};

    if (this.match(TokenType.LBRACE)) {
      this.advance();

      // Parse properties
      while (!this.match(TokenType.RBRACE) && !this.match(TokenType.EOF)) {
        if (this.match(TokenType.LABEL)) {
          this.advance();
          this.expect(TokenType.COLON);
          label = this.expect(TokenType.STRING).value;
          this.expect(TokenType.SEMICOLON);
        } else if (this.match(TokenType.IDENTIFIER)) {
          // Parse CSS property: property: value;
          const propName = this.advance().value;
          this.expect(TokenType.COLON);

          // Collect all tokens until semicolon as the property value
          const valueTokens: string[] = [];
          while (
            !this.match(TokenType.SEMICOLON) &&
            !this.match(TokenType.EOF) &&
            !this.match(TokenType.RBRACE)
          ) {
            valueTokens.push(this.advance().value);
          }

          if (this.match(TokenType.SEMICOLON)) {
            this.advance();
          }

          cssProperties[propName] = valueTokens.join(" ");
        } else {
          this.error(`Unknown property: ${this.current.value}`);
          this.advance();
        }
      }

      this.expect(TokenType.RBRACE);
    } else if (this.match(TokenType.SEMICOLON)) {
      // Room without properties, just consume the semicolon
      this.advance();
    }

    return {
      type: "Room",
      id,
      x: pos.x,
      y: pos.y,
      width: size.x,
      height: size.y,
      unit: pos.unit,
      label,
      properties:
        Object.keys(cssProperties).length > 0 ? cssProperties : undefined,
      loc: { start, end: this.current.end },
    };
  }

  // Parse wall
  private parseWall(): Wall {
    const start = this.current.start;
    this.expect(TokenType.WALL);
    this.expect(TokenType.FROM);

    const from = this.parseCoordinate();
    this.expect(TokenType.TO);
    const to = this.parseCoordinate();
    this.expect(TokenType.SEMICOLON);

    return {
      type: "Wall",
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      unit: from.unit,
      loc: { start, end: this.current.end },
    };
  }

  // Parse door
  private parseDoor(): Door {
    const start = this.current.start;
    this.expect(TokenType.DOOR);
    this.expect(TokenType.FROM);

    const from = this.parseCoordinate();
    this.expect(TokenType.TO);
    const to = this.parseCoordinate();

    this.expect(TokenType.WIDTH);
    const width = this.parseNumberWithUnit();
    this.expect(TokenType.SEMICOLON);

    return {
      type: "Door",
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      width: width.value,
      unit: from.unit,
      loc: { start, end: this.current.end },
    };
  }

  // Parse repeat pattern
  private parseRepeat(): RepeatPattern {
    const start = this.current.start;
    this.expect(TokenType.REPEAT);

    const component = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.FROM);

    const from = this.parseCoordinate();
    this.expect(TokenType.TO);
    const to = this.parseCoordinate();
    // TODO(specification.md §Repeat patterns and room-edge syntax; project-plan.md Next Steps #1): Support room-edge repeat syntax (e.g. `repeat Window in Living along north space 2U`).

    this.expect(TokenType.SPACE);
    const spacing = this.parseNumberWithUnit();
    this.expect(TokenType.SEMICOLON);

    return {
      type: "RepeatPattern",
      component,
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      spacing: spacing.value,
      unit: from.unit,
      loc: { start, end: this.current.end },
    };
  }

  // Parse @grid
  private parseGrid(): Grid {
    const start = this.current.start;
    this.expect(TokenType.AT_GRID);

    // Mode
    let mode: Grid["mode"] = "grid";
    if (this.match(TokenType.GRID, TokenType.LINES)) {
      mode = "grid";
      this.advance();
    } else if (this.match(TokenType.VLINES)) {
      mode = "vlines";
      this.advance();
    } else if (this.match(TokenType.HLINES)) {
      mode = "hlines";
      this.advance();
    } else if (this.match(TokenType.DOTTED)) {
      mode = "dotted";
      this.advance();
    }

    // Size
    let sizeX = 1;
    let sizeY = 1;
    let unit = "U";

    if (this.match(TokenType.SIZE)) {
      this.advance();
      const size = this.parseNumberWithUnit();
      sizeX = size.value;
      sizeY = size.value;
      unit = size.unit;

      // Check for 'x' separator for different Y size
      if (this.current.value === "x" || this.current.value === "X") {
        this.advance();
        const sizeYVal = this.parseNumberWithUnit();
        sizeY = sizeYVal.value;
      }
    }

    // Color
    let color: string | undefined;
    if (this.match(TokenType.COLOR)) {
      this.advance();
      // Handle hex colors (#xxx, #xxxxxx) or named colors
      if (this.match(TokenType.HASH)) {
        let hexColor = this.advance().value; // #
        // Collect hex digits (could be NUMBER or IDENTIFIER)
        while (
          this.match(TokenType.NUMBER, TokenType.IDENTIFIER) &&
          !this.match(TokenType.ALPHA, TokenType.SEMICOLON)
        ) {
          hexColor += this.advance().value;
        }
        color = hexColor;
      } else if (this.match(TokenType.IDENTIFIER)) {
        // Named color like 'red', 'blue', etc.
        color = this.advance().value;
      }
    }

    // Alpha
    let alpha: number | undefined;
    if (this.match(TokenType.ALPHA)) {
      this.advance();
      const alphaVal = this.parseNumberWithUnit();
      alpha = alphaVal.value;
    }

    this.expect(TokenType.SEMICOLON);

    return {
      type: "Grid",
      mode,
      sizeX,
      sizeY,
      unit,
      color,
      alpha,
      loc: { start, end: this.current.end },
    };
  }

  // Parse @draw block (formerly @plan)
  private parsePlan(): Plan {
    const start = this.current.start;

    // Optional @module first
    let module: ModuleDeclaration | undefined;
    if (this.match(TokenType.AT_MODULE)) {
      this.advance();
      const name = this.expect(TokenType.IDENTIFIER).value;
      this.expect(TokenType.SEMICOLON);
      module = {
        type: "ModuleDeclaration",
        name,
        loc: { start, end: this.current.end },
      };
    }

    // Collect top-level declarations before @draw
    const units: UnitDeclaration[] = [];
    const imports: ImportDeclaration[] = [];
    const exports: ExportDeclaration[] = [];

    while (!this.match(TokenType.AT_DRAW) && !this.match(TokenType.EOF)) {
      if (this.match(TokenType.HIERARCHY)) {
        // Hierarchy marker like @1, @2, @3 - just skip for now
        this.advance();
        if (this.match(TokenType.SEMICOLON)) {
          this.advance();
        }
      } else if (this.match(TokenType.AT_UNIT)) {
        units.push(this.parseUnitDeclaration());
      } else if (this.match(TokenType.IMPORT)) {
        // TODO(specification.md §Modules, imports, and composition; project-plan.md Phase 3): Parse import declarations and populate the AST instead of skipping them.
        this.advance();
      } else if (this.match(TokenType.EXPORT)) {
        // TODO(specification.md §Modules, imports, and composition; project-plan.md Phase 3): Capture export metadata so component modules can be emitted.
        this.advance();
      } else {
        // TODO(specification.md §Configuration; project-plan.md Next Steps #1): Recognize @config blocks before @draw rather than flagging them as unexpected tokens.
        this.error(`Unexpected token: ${this.current.type}`);
        this.advance();
      }
    }

    this.expect(TokenType.AT_DRAW);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);

    // Parse @canvas
    let canvas: Canvas | undefined;
    if (this.match(TokenType.AT_CANVAS)) {
      canvas = this.parseCanvas();
    }

    if (!canvas) {
      this.error("@canvas is required inside @draw");
      canvas = { width: 10, height: 10, unit: "U" };
    }

    // Parse draw body
    const rooms: Room[] = [];
    const walls: Wall[] = [];
    const doors: Door[] = [];
    const grids: Grid[] = [];
    const uses: UsePlacement[] = [];
    const repeats: RepeatPattern[] = [];

    while (!this.match(TokenType.RBRACE) && !this.match(TokenType.EOF)) {
      if (this.match(TokenType.ROOM)) {
        rooms.push(this.parseRoom());
      } else if (this.match(TokenType.WALL)) {
        walls.push(this.parseWall());
      } else if (this.match(TokenType.DOOR)) {
        doors.push(this.parseDoor());
      } else if (this.match(TokenType.AT_GRID)) {
        grids.push(this.parseGrid());
      } else if (this.match(TokenType.USE)) {
        // TODO(specification.md §Modules, imports, and composition; project-plan.md Phase 3): Parse use placements so imported .arch files can be instantiated with transforms.
        this.advance();
      } else if (this.match(TokenType.REPEAT)) {
        repeats.push(this.parseRepeat());
      } else {
        this.error(`Unexpected token in draw body: ${this.current.type}`);
        this.advance();
      }
    }

    this.expect(TokenType.RBRACE);

    return {
      type: "Draw",
      name,
      canvas,
      units,
      rooms,
      walls,
      doors,
      grids,
      imports,
      exports,
      uses,
      repeats,
      module,
      loc: { start, end: this.current.end },
    };
  }

  parse(): ParseResult {
    const ast = this.parsePlan();

    return {
      ast,
      errors: this.errors,
    };
  }
}

export function parse(tokens: Token[]): ParseResult {
  const parser = new Parser(tokens);
  return parser.parse();
}
