/**
 * Tokenizer for ArchCSS (.arch files)
 * Breaks source code into tokens for the parser
 */

import type { Position } from "./types.js";

export enum TokenType {
  // Literals
  IDENTIFIER = "IDENTIFIER",
  NUMBER = "NUMBER",
  STRING = "STRING",

  // Keywords
  AT_UNIT = "@unit",
  AT_DRAW = "@draw",
  AT_CANVAS = "@canvas",
  AT_GRID = "@grid",
  AT_MODULE = "@module",
  HIERARCHY = "HIERARCHY",

  // Primitives
  ROOM = "room",
  WALL = "wall",
  DOOR = "door",

  // Module keywords
  IMPORT = "import",
  EXPORT = "export",
  USE = "use",
  REPEAT = "repeat",
  SPACE = "space",
  FROM = "from",
  AS = "as",
  WITH = "with",
  DEFAULT = "default",

  // Placement keywords
  AT = "at",
  SIZE = "size",
  BETWEEN = "between",
  WIDTH = "width",
  ROTATE = "rotate",
  SCALE = "scale",
  SNAP = "snap",
  TO = "to",
  OFFSET = "offset",
  X = "x",

  // Grid keywords
  GRID = "grid",
  VLINES = "vlines",
  HLINES = "hlines",
  LINES = "lines",
  DOTTED = "dotted",
  COLOR = "color",
  ALPHA = "alpha",

  // Properties
  LABEL = "label",

  // Punctuation
  LPAREN = "(",
  RPAREN = ")",
  LBRACE = "{",
  RBRACE = "}",
  LBRACKET = "[",
  RBRACKET = "]",
  COMMA = ",",
  SEMICOLON = ";",
  COLON = ":",
  DOT = ".",
  EQUALS = "=",

  // Operators
  MULTIPLY = "*",
  DIVIDE = "/",
  PLUS = "+",
  MINUS = "-",
  HASH = "#",

  // Special
  COMMENT = "COMMENT",
  WHITESPACE = "WHITESPACE",
  NEWLINE = "NEWLINE",
  EOF = "EOF",
}

export interface Token {
  type: TokenType;
  value: string;
  start: Position;
  end: Position;
}

const KEYWORDS: Record<string, TokenType> = {
  // At-rules
  "@unit": TokenType.AT_UNIT,
  "@draw": TokenType.AT_DRAW,
  "@plan": TokenType.AT_DRAW, // Backward compatibility
  "@canvas": TokenType.AT_CANVAS,
  "@grid": TokenType.AT_GRID,
  "@module": TokenType.AT_MODULE,

  // Primitives
  room: TokenType.ROOM,
  wall: TokenType.WALL,
  door: TokenType.DOOR,

  // Module
  import: TokenType.IMPORT,
  export: TokenType.EXPORT,
  use: TokenType.USE,
  repeat: TokenType.REPEAT,
  space: TokenType.SPACE,
  from: TokenType.FROM,
  as: TokenType.AS,
  with: TokenType.WITH,
  default: TokenType.DEFAULT,

  // Placement
  at: TokenType.AT,
  size: TokenType.SIZE,
  between: TokenType.BETWEEN,
  width: TokenType.WIDTH,
  rotate: TokenType.ROTATE,
  scale: TokenType.SCALE,
  snap: TokenType.SNAP,
  to: TokenType.TO,
  offset: TokenType.OFFSET,
  x: TokenType.X,

  // Grid
  grid: TokenType.GRID,
  vlines: TokenType.VLINES,
  hlines: TokenType.HLINES,
  lines: TokenType.LINES,
  dotted: TokenType.DOTTED,
  color: TokenType.COLOR,
  alpha: TokenType.ALPHA,

  // Properties
  label: TokenType.LABEL,
};

export class Tokenizer {
  private source: string;
  private pos = 0;
  private line = 1;
  private column = 1;
  private tokens: Token[] = [];

  constructor(source: string) {
    this.source = source;
  }

  private get current(): string {
    return this.source[this.pos] || "";
  }

  private peek(offset = 1): string {
    return this.source[this.pos + offset] || "";
  }

  private advance(): string {
    const char = this.current;
    this.pos++;
    if (char === "\n") {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  private makePosition(): Position {
    return {
      line: this.line,
      column: this.column,
      offset: this.pos,
    };
  }

  private addToken(type: TokenType, value: string, start: Position): void {
    this.tokens.push({
      type,
      value,
      start,
      end: this.makePosition(),
    });
  }

  private skipWhitespace(): void {
    while (/\s/.test(this.current)) {
      this.advance();
    }
  }

  private readComment(): void {
    const start = this.makePosition();
    this.advance(); // /
    this.advance(); // *

    let value = "/*";
    while (this.current && !(this.current === "*" && this.peek() === "/")) {
      value += this.advance();
    }

    if (this.current === "*") {
      value += this.advance(); // *
      value += this.advance(); // /
    }

    // Comments are typically ignored, but we track them for now
    // this.addToken(TokenType.COMMENT, value, start);
  }

  private readString(): void {
    const start = this.makePosition();
    const quote = this.advance(); // " or '
    let value = "";

    while (this.current && this.current !== quote) {
      if (this.current === "\\") {
        this.advance();
        const escaped = this.advance();
        switch (escaped) {
          case "n":
            value += "\n";
            break;
          case "t":
            value += "\t";
            break;
          case "r":
            value += "\r";
            break;
          case "\\":
            value += "\\";
            break;
          case quote:
            value += quote;
            break;
          default:
            value += escaped;
        }
      } else {
        value += this.advance();
      }
    }

    if (this.current === quote) {
      this.advance();
    }

    this.addToken(TokenType.STRING, value, start);
  }

  private readNumber(): void {
    const start = this.makePosition();
    let value = "";

    // Read digits (integer part)
    while (/\d/.test(this.current)) {
      value += this.advance();
    }

    // Read decimal part
    if (this.current === "." && /\d/.test(this.peek())) {
      value += this.advance(); // .
      while (/\d/.test(this.current)) {
        value += this.advance();
      }
    }

    this.addToken(TokenType.NUMBER, value, start);
  }

  private readIdentifierOrKeyword(): void {
    const start = this.makePosition();
    let value = "";

    // Check for @ prefix (at-rules)
    if (this.current === "@") {
      value += this.advance();
      
      // Check if it's a hierarchy marker like @1, @2, @3
      if (/\d/.test(this.current)) {
        while (/\d/.test(this.current)) {
          value += this.advance();
        }
        this.addToken(TokenType.HIERARCHY, value, start);
        return;
      }
    }

    // Read identifier characters
    while (/[a-zA-Z0-9_-]/.test(this.current)) {
      value += this.advance();
    }

    // Check if it's a keyword
    const tokenType = KEYWORDS[value] || TokenType.IDENTIFIER;
    this.addToken(tokenType, value, start);
  }

  tokenize(): Token[] {
    this.tokens = [];

    while (this.pos < this.source.length) {
      this.skipWhitespace();

      if (this.pos >= this.source.length) break;

      const start = this.makePosition();
      const char = this.current;

      // Comments
      if (char === "/" && this.peek() === "*") {
        this.readComment();
        continue;
      }

      // Strings
      if (char === '"' || char === "'") {
        this.readString();
        continue;
      }

      // Numbers
      if (/\d/.test(char)) {
        this.readNumber();
        continue;
      }

      // Identifiers and keywords
      if (/[a-zA-Z_@]/.test(char)) {
        this.readIdentifierOrKeyword();
        continue;
      }

      // Single-character tokens
      switch (char) {
        case "(":
          this.addToken(TokenType.LPAREN, this.advance(), start);
          break;
        case ")":
          this.addToken(TokenType.RPAREN, this.advance(), start);
          break;
        case "{":
          this.addToken(TokenType.LBRACE, this.advance(), start);
          break;
        case "}":
          this.addToken(TokenType.RBRACE, this.advance(), start);
          break;
        case "[":
          this.addToken(TokenType.LBRACKET, this.advance(), start);
          break;
        case "]":
          this.addToken(TokenType.RBRACKET, this.advance(), start);
          break;
        case ",":
          this.addToken(TokenType.COMMA, this.advance(), start);
          break;
        case ";":
          this.addToken(TokenType.SEMICOLON, this.advance(), start);
          break;
        case ":":
          this.addToken(TokenType.COLON, this.advance(), start);
          break;
        case ".":
          this.addToken(TokenType.DOT, this.advance(), start);
          break;
        case "=":
          this.addToken(TokenType.EQUALS, this.advance(), start);
          break;
        case "*":
          this.addToken(TokenType.MULTIPLY, this.advance(), start);
          break;
        case "/":
          this.addToken(TokenType.DIVIDE, this.advance(), start);
          break;
        case "+":
          this.addToken(TokenType.PLUS, this.advance(), start);
          break;
        case "-":
          this.addToken(TokenType.MINUS, this.advance(), start);
          break;
        case "#":
          this.addToken(TokenType.HASH, this.advance(), start);
          break;
        default:
          throw new Error(
            `Unexpected character: ${char} at ${this.line}:${this.column}`
          );
      }
    }

    // Add EOF token
    const end = this.makePosition();
    this.addToken(TokenType.EOF, "", end);

    return this.tokens;
  }
}

export function tokenize(source: string): Token[] {
  const tokenizer = new Tokenizer(source);
  return tokenizer.tokenize();
}
