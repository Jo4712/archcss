# @archcss/parser

> A parser for archcss (.arch) files that compiles to pure HTML + CSS

[![npm version](https://badge.fury.io/js/@archcss%2Fparser.svg)](https://badge.fury.io/js/@archcss%2Fparser)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @archcss/parser
# or
bun add @archcss/parser
# or
yarn add @archcss/parser
```

## Quick Start

```javascript
import { parse, compile, generateCSS } from '@archcss/parser';

// Parse an .arch file
const ast = parse(`
@unit 1U = 50px;
@draw MyHome {
  @canvas 20U x 12U;
  
  room living at (1U, 1U) size (6U, 4U) {
    label: "Living Room";
    background: #f0f0f0;
  }
  
  room kitchen at (8U, 1U) size (5U, 3U) {
    label: "Kitchen";
    background: #e0f0e0;
  }
  
  wall from (7U, 1U) to (7U, 4U);
  door from (7U, 2U) to (7U, 3U) width 0.9U;
}
`);

// Compile to model
const model = compile(ast);

// Generate CSS
const css = generateCSS(model);

console.log(css);
```

## API Reference

### `parse(source: string): AST`

Parses archcss source code and returns an Abstract Syntax Tree.

**Parameters:**
- `source` - The archcss source code as a string

**Returns:**
- `AST` - The parsed Abstract Syntax Tree

**Example:**
```javascript
const ast = parse(`
@unit 1U = 50px;
@draw MyHome {
  room living at (1U, 1U) size (6U, 4U) {
    label: "Living Room";
  }
}
`);
```

### `compile(ast: AST): CompiledModel`

Compiles an AST into a compiled model with resolved units and calculations.

**Parameters:**
- `ast` - The parsed AST

**Returns:**
- `CompiledModel` - The compiled model with resolved values

**Example:**
```javascript
const model = compile(ast);
console.log(model.scale); // 50
console.log(model.canvas); // { cols: 20, rows: 12 }
console.log(model.rooms); // Array of room objects
```

### `generateCSS(model: CompiledModel): string`

Generates CSS from a compiled model.

**Parameters:**
- `model` - The compiled model

**Returns:**
- `string` - Generated CSS

**Example:**
```javascript
const css = generateCSS(model);
// Returns CSS with custom properties and grid layout
```

### `tokenize(source: string): Token[]`

Tokenizes archcss source code into tokens.

**Parameters:**
- `source` - The archcss source code as a string

**Returns:**
- `Token[]` - Array of tokens

**Example:**
```javascript
const tokens = tokenize('room living at (1U, 1U) size (6U, 4U)');
console.log(tokens);
```

## Language Features

### Units
```javascript
@unit 1U = 50px;
@unit 1cm = 37.795px;
@unit 1m = 100cm;
```

### Drawings
```javascript
@draw MyHome {
  @canvas 20U x 12U;
  // ... components
}
```

### Rooms
```javascript
room living at (1U, 1U) size (6U, 4U) {
  label: "Living Room";
  background: #f0f0f0;
  border-radius: 8px;
}
```

### Walls
```javascript
wall from (1U, 5U) to (13U, 5U);
```

### Doors
```javascript
door from (7U, 2U) to (7U, 3U) width 0.9U;
```

### Repeat Patterns
```javascript
repeat Window from (0U, 0U) to (8U, 0U) space 2U;
```

### Hierarchy Markers
```javascript
@1; // Darkest color
@draw FloorPlan { ... }

@2; // Medium color  
@draw Room { ... }

@3; // Lightest color
@draw Furniture { ... }
```

### Inline CSS
```javascript
room showcase at (10U, 1U) size (5U, 5U) {
  label: "Showcase";
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transform: rotate(2deg);
  transition: all 0.3s ease;
}
```

## Configuration

Create an `arch.config.json` file in your project root:

```json
{
  "unit": {
    "default": "50px",
    "dpi": 96
  },
  "grid": {
    "default": true,
    "size": "1U",
    "color": "#ccc",
    "alpha": 0.15
  },
  "hierarchy": {
    "colors": {
      "dark": "#2d5016",
      "light": "#7faf51"
    }
  }
}
```

## Browser Usage

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Floor Plan</title>
  <style id="archcss-styles"></style>
</head>
<body>
  <div id="plan"></div>
  
  <script type="module">
    import { parse, compile, generateCSS, mount } from '@archcss/parser';
    
    const source = `
      @unit 1U = 50px;
      @draw MyHome {
        @canvas 20U x 12U;
        room living at (1U, 1U) size (6U, 4U) {
          label: "Living Room";
        }
      }
    `;
    
    const ast = parse(source);
    const model = compile(ast);
    const css = generateCSS(model);
    
    document.getElementById('archcss-styles').textContent = css;
    mount('#plan', model);
  </script>
</body>
</html>
```

## TypeScript Support

This package includes TypeScript definitions:

```typescript
import { parse, compile, generateCSS, AST, CompiledModel } from '@archcss/parser';

const ast: AST = parse(source);
const model: CompiledModel = compile(ast);
const css: string = generateCSS(model);
```

## Performance

- **Compilation time**: <5ms for typical floor plans
- **Bundle size**: ~30KB (zero dependencies)
- **Memory usage**: Minimal, efficient DOM updates

## Browser Compatibility

- Modern browsers with ES2020 support
- CSS Grid support required
- CSS Custom Properties support required

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/archcss/archcss/blob/main/CONTRIBUTING.md) for details.

## License

MIT © [archcss team](https://github.com/archcss/archcss)

## Links

- [Documentation](https://archcss.dev/docs)
- [Online Editor](https://archcss.dev/editor)
- [GitHub Repository](https://github.com/archcss/archcss)
- [Report Issues](https://github.com/archcss/archcss/issues)
