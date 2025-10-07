  private get current(): Token {
    const token = this.tokens[this.pos];
    if (token) return token;
    if (this.tokens.length > 0) {
      return this.tokens[this.tokens.length - 1]!;
    }
    return {
      type: TokenType.EOF,
      value: "",
      start: { line: 0, column: 0, offset: 0 },
      end: { line: 0, column: 0, offset: 0 },
    };
  }

  private peek(offset = 1): Token {
    const token = this.tokens[this.pos + offset];
    if (token) return token;
    if (this.tokens.length > 0) {
      return this.tokens[this.tokens.length - 1]!;
    }
    return {
      type: TokenType.EOF,
      value: "",
      start: { line: 0, column: 0, offset: 0 },
      end: { line: 0, column: 0, offset: 0 },
    };
  }

  private advance(): Token {
    const token = this.tokens[this.pos++];
    if (token) return token;
    return {
      type: TokenType.EOF,
      value: "",
      start: { line: 0, column: 0, offset: 0 },
      end: { line: 0, column: 0, offset: 0 },
    };
  }
