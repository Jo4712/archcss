# archcss

> A declarative DSL for creating 2D floor plans that compile to pure HTML + CSS

[![npm version](https://badge.fury.io/js/@archcss%2Fparser.svg)](https://badge.fury.io/js/@archcss%2Fparser)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.0--alpha.1-blue.svg)](https://github.com/archcss/archcss)

**archcss** is a domain-specific language for creating architectural floor plans that compiles to pure HTML + CSS. Think "Tailwind for architecture"—a simple syntax that renders beautiful floor plans using modern CSS features.

## 🚀 Quick Start

### Install

```bash
npm install @archcss/parser
# or
bun add @archcss/parser
```

### Basic Usage

```javascript
import { parse, compile, generateCSS, mount } from '@archcss/parser';

const source = `
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
`;

const ast = parse(source);
const model = compile(ast);
const css = generateCSS(model);

// Mount in browser
mount('#plan', model);
```

### Online Editor

Try archcss in your browser: **[archcss.dev/editor](https://archcss.dev/editor)**

## ✨ Features

### Core Language
- **Spatial positioning**: `at (x, y) size (w, h)` - absolute positioning in grid units
- **File-based component system**: `@draw` - reusable compositions
- **Visual hierarchy**: `@1`, `@2`, `@3` - semantic organization with color gradients
- **Canvas definition**: `@canvas` - workspace boundaries
- **Unit system**: `@unit` - project-wide unit declarations
- **Repeat patterns**: `repeat` - array distribution

### CSS Integration
- **Inline CSS properties**: Use any standard CSS property directly
- **Custom properties**: CSS variables for theming
- **Pseudo-classes**: `:hover`, `:focus`, etc.
- **Animations**: CSS transitions and keyframes
- **Gradients**: Linear and radial gradients
- **Shadows**: Box shadows and filters

### Developer Experience
- **Fast compilation**: <5ms for typical floor plans
- **Zero dependencies**: ~30KB bundle size
- **TypeScript support**: Full type definitions
- **Hot reload**: Live updates in development
- **Comprehensive testing**: 32/32 tests passing

## 📖 Documentation

- **[Getting Started](https://archcss.dev/docs/getting-started)** - Quick setup guide
- **[Language Reference](https://archcss.dev/docs/language)** - Complete syntax reference
- **[API Documentation](https://archcss.dev/docs/api)** - Parser and runtime APIs
- **[Examples](https://archcss.dev/docs/examples)** - Sample floor plans
- **[Component Library](https://archcss.dev/docs/components)** - Reusable components

## 🎯 Current Status: v0.1.0-alpha.1

### ✅ Completed Features
- Core parser with tokenizer and AST generation
- CSS generator with custom properties and grid system
- Runtime library (~90 lines, zero dependencies)
- Interactive browser editor with live preview
- Support for rooms, walls, and doors
- `repeat` pattern syntax for component arrays
- Hierarchy markers with real-time color updates
- `@draw` unified syntax for reusable components
- Inline CSS properties for styling
- Configuration system (`arch.config.json`)

### 🚧 In Progress (0.1.0 Alpha Goals)
- User authentication system for online editor
- Component library management
- Enhanced online editor features
- NPM package publishing

### 🔮 Planned (0.2.0+)
- File-based component system (`import`, `use` with `.arch` files)
- VS Code extension with syntax highlighting
- Build tool plugins (Vite, PostCSS)
- Room-edge-based repeat syntax
- Advanced patterns and materials

## 🏗️ Architecture

```
archcss/
├── packages/
│   ├── parser/          # @archcss/parser - Core parsing
│   ├── runtime/         # @archcss/runtime - DOM mounting
│   ├── postcss-plugin/  # postcss-archcss - PostCSS integration
│   └── vite-plugin/     # vite-plugin-archcss - Vite integration
├── examples/            # Sample .arch files
├── docs/                # Documentation site
└── playground/          # Online editor
```

## 🚀 Roadmap

### v0.1.0 (Alpha) - Q1 2024
- [ ] User authentication system
- [ ] Component library management
- [ ] Enhanced online editor
- [ ] NPM package publishing

### v0.2.0 (Beta) - Q2 2024
- [ ] File-based component system (`import`, `use` with `.arch` files)
- [ ] VS Code extension
- [ ] Build tool plugins
- [ ] Advanced patterns

### v1.0.0 (Stable) - Q3 2024
- [ ] Complete feature set
- [ ] Production-ready tooling
- [ ] Long-term API stability

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/archcss/archcss.git
cd archcss

# Install dependencies
bun install

# Run tests
bun test

# Start development server
bun run dev

# Build packages
bun run build
```

### Release Process

```bash
# Create a new release
bun run release:alpha    # 0.1.0-alpha.1 → 0.1.0-alpha.2
bun run release:beta     # 0.1.0-alpha.1 → 0.1.0-beta.1
bun run release:stable   # 0.1.0-alpha.1 → 0.1.0
```

## 📄 License

MIT © [archcss team](https://github.com/archcss/archcss)

## 🔗 Links

- **[Online Editor](https://archcss.dev/editor)** - Try archcss in your browser
- **[Documentation](https://archcss.dev/docs)** - Complete documentation
- **[GitHub](https://github.com/archcss/archcss)** - Source code and issues
- **[NPM Package](https://www.npmjs.com/package/@archcss/parser)** - Install from NPM

---

**archcss** - *Use CSS wherever possible. Invent syntax only when necessary.*
