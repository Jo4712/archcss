import { describe, it, expect } from "vitest";
import { tokenize, TokenType } from "../src/tokenizer.js";

describe("Tokenizer", () => {
  it("should tokenize basic @unit declaration", () => {
    const source = "@unit U = 50px;";
    const tokens = tokenize(source);

    expect(tokens).toHaveLength(7); // @unit, U, =, 50, px, ;, EOF
    expect(tokens[0].type).toBe(TokenType.AT_UNIT);
    expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[1].value).toBe("U");
    expect(tokens[2].type).toBe(TokenType.EQUALS);
    expect(tokens[3].type).toBe(TokenType.NUMBER);
    expect(tokens[3].value).toBe("50");
    expect(tokens[4].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[4].value).toBe("px");
    expect(tokens[5].type).toBe(TokenType.SEMICOLON);
  });

  it("should tokenize @plan with @canvas", () => {
    const source = `@plan MyHome {
  @canvas 20U x 12U;
}`;
    const tokens = tokenize(source);

    expect(tokens[0].type).toBe(TokenType.AT_PLAN);
    expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[1].value).toBe("MyHome");
    expect(tokens[2].type).toBe(TokenType.LBRACE);
    expect(tokens[3].type).toBe(TokenType.AT_CANVAS);
  });

  it("should tokenize room declaration", () => {
    const source = 'room living at (1U, 1U) size (6U, 4U) { label: "Living"; }';
    const tokens = tokenize(source);

    expect(tokens[0].type).toBe(TokenType.ROOM);
    expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[1].value).toBe("living");
    expect(tokens[2].type).toBe(TokenType.AT);
    expect(tokens[3].type).toBe(TokenType.LPAREN);
  });

  it("should tokenize strings with escapes", () => {
    const source = '"Living\\nRoom"';
    const tokens = tokenize(source);

    expect(tokens[0].type).toBe(TokenType.STRING);
    expect(tokens[0].value).toBe("Living\nRoom");
  });

  it("should tokenize wall from...to", () => {
    const source = "wall from (1U, 5U) to (13U, 5U);";
    const tokens = tokenize(source);

    expect(tokens[0].type).toBe(TokenType.WALL);
    expect(tokens[1].type).toBe(TokenType.FROM);
    // tokens: wall, from, (, 1, U, ,, 5, U, ), to, ...
    expect(tokens[9].type).toBe(TokenType.TO);
  });

  it("should tokenize door between...and", () => {
    const source =
      "door between living.east and kitchen.west at 2U width 0.9U;";
    const tokens = tokenize(source);

    expect(tokens[0].type).toBe(TokenType.DOOR);
    expect(tokens[1].type).toBe(TokenType.BETWEEN);
    expect(tokens[3].type).toBe(TokenType.DOT);
  });

  it("should skip comments", () => {
    const source = "/* comment */ @unit U = 50px;";
    const tokens = tokenize(source);

    // Comment should be skipped
    expect(tokens[0].type).toBe(TokenType.AT_UNIT);
  });

  it("should tokenize decimal numbers", () => {
    const source = "0.9U";
    const tokens = tokenize(source);

    expect(tokens[0].type).toBe(TokenType.NUMBER);
    expect(tokens[0].value).toBe("0.9");
    expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[1].value).toBe("U");
  });

  it("should tokenize @grid directive", () => {
    const source = "@grid grid size 1U color #9aa alpha 0.25;";
    const tokens = tokenize(source);

    expect(tokens[0].type).toBe(TokenType.AT_GRID);
    expect(tokens[1].type).toBe(TokenType.GRID);
    expect(tokens[2].type).toBe(TokenType.SIZE);
    expect(tokens[5].type).toBe(TokenType.COLOR);
    expect(tokens[6].type).toBe(TokenType.HASH);
    // Note: #9aa is tokenized as # + 9 + aa (HASH + NUMBER + IDENTIFIER)
    expect(tokens[7].type).toBe(TokenType.NUMBER);
    expect(tokens[7].value).toBe("9");
    expect(tokens[8].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[8].value).toBe("aa");
    expect(tokens[9].type).toBe(TokenType.ALPHA);
  });

  it("should tokenize import statement", () => {
    const source = 'import Ground from "./floors/ground.arch";';
    const tokens = tokenize(source);

    expect(tokens[0].type).toBe(TokenType.IMPORT);
    expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[1].value).toBe("Ground");
    expect(tokens[2].type).toBe(TokenType.FROM);
    expect(tokens[3].type).toBe(TokenType.STRING);
    expect(tokens[3].value).toBe("./floors/ground.arch");
  });

  it("should tokenize use placement", () => {
    const source = "use Ground at (0m, 0m);";
    const tokens = tokenize(source);

    expect(tokens[0].type).toBe(TokenType.USE);
    expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[2].type).toBe(TokenType.AT);
  });
});
