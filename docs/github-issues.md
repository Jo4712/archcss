# GitHub Issue Tracker

Tracking open TODO items sourced from inline comments. Use these entries to create or update issues on GitHub.

## Parse room-edge repeat syntax
- Source: `packages/parser/src/parser.ts:307`
- Spec: `specification.md` §Repeat patterns and room-edge syntax
- Plan: `project-plan.md` Next Steps #1
- Summary: Extend `repeat` parsing to accept room-edge forms (e.g. `repeat Window in Living along north space 2U`) in addition to coordinate pairs.
- Acceptance Criteria:
  - Tokenizer and parser recognize `in`, `along`, compass directions, and optional offsets for room-edge repeats.
  - AST and `RepeatPattern` type capture the additional metadata.
  - Compiler/runtime emit repeated components along referenced room edges and existing regression tests stay green.

## Parse module import declarations
- Source: `packages/parser/src/parser.ts:442`
- Spec: `specification.md` §Modules, imports, and composition
- Plan: `project-plan.md` Phase 3
- Summary: Implement parsing for `import` statements instead of skipping them so modules/components can be referenced.
- Acceptance Criteria:
  - Grammar handles named, default, and aliased imports with optional `from` paths.
  - AST includes structured `ImportDeclaration` entries; unit overrides persist where provided.
  - Tests cover successful imports and meaningful error messages for malformed syntax.

## Parse module export declarations
- Source: `packages/parser/src/parser.ts:445`
- Spec: `specification.md` §Modules, imports, and composition
- Plan: `project-plan.md` Phase 3
- Summary: Capture `export` metadata so component modules can expose named/default exports.
- Acceptance Criteria:
  - Parser records export names/flags and associates them with the enclosing `@draw`/`@component`.
  - Types reflect export data; compiler/runtime can surface exported entities.
  - Errors fire when export references are missing or duplicated.

## Support @config directives before @draw
- Source: `packages/parser/src/parser.ts:448`
- Spec: `specification.md` §Configuration
- Plan: `project-plan.md` Next Steps #1
- Summary: Allow top-level `@config` blocks ahead of `@draw` without triggering unexpected-token errors.
- Acceptance Criteria:
  - Tokenizer recognizes `@config`; parser reads configuration blocks into a structured node.
  - Compiler merges inline config with defaults and project `arch.config.json`.
  - Validation ensures configs appear in allowed positions with sensible diagnostics otherwise.

## Parse `use` placements
- Source: `packages/parser/src/parser.ts:487`
- Spec: `specification.md` §Modules, imports, and composition
- Plan: `project-plan.md` Phase 3
- Summary: Parse `use` directives that instantiate imported components with position/transform metadata.
- Acceptance Criteria:
  - Parser populates `UsePlacement` nodes including positional, rotation, scale, and unit info.
  - Compiler/runtime instantiate referenced components at runtime.
  - Tests cover missing imports, invalid transforms, and happy paths.

## Tokenize @config keyword
- Source: `packages/parser/src/tokenizer.ts:104`
- Spec: `specification.md` §Configuration
- Plan: `project-plan.md` Next Steps #1
- Summary: Add `@config` to tokenizer keyword map so directives are recognized during parsing.
- Acceptance Criteria:
  - `@config` yields a dedicated token and existing lexing tests update accordingly.
  - Comments/whitespace handling unaffected; legacy files continue working.

## Tokenize @component keyword
- Source: `packages/parser/src/tokenizer.ts:105`
- Spec: `specification.md` §Modules, imports, and composition
- Plan: `project-plan.md` Next Steps #2
- Summary: Reserve `@component` as a keyword in preparation for component definitions.
- Acceptance Criteria:
  - Tokenizer maps `@component` to a new token type.
  - Parser ignores or stubs handling until component parsing lands (tests in place to guarantee recognition).

## Add ComponentDeclaration types
- Source: `packages/parser/src/types.ts:84`
- Spec: `specification.md` §Modules, imports, and composition
- Plan: `project-plan.md` Next Steps #2
- Summary: Introduce AST and model types for `@component` definitions to unblock upcoming parsing work.
- Acceptance Criteria:
  - New interfaces represent component structure, inputs, and exports.
  - Existing consumers retype to accommodate future component instances without breaking builds.
  - Type tests or compilation sanity checks validate the additions.

## Replace repeat placeholder component instantiation
- Source: `packages/parser/src/compiler.ts:146`
- Spec: `specification.md` §Modules, imports, and composition
- Plan: `project-plan.md` Next Steps #2
- Summary: Swap the temporary room-creation logic inside `expandRepeats()` with real component instantiation once components are available.
- Acceptance Criteria:
  - Compiler resolves referenced components, clones their structure, and positions them along repeats.
  - Runtime renders repeated components correctly; placeholder “Window” rooms removed.
  - Regression cases confirm no duplicate IDs or layout corruption.

## Run overlap and bounds validation
- Source: `packages/parser/src/compiler.ts:170`
- Spec: `specification.md` §Roadmap Milestone 2
- Plan: `project-plan.md` Phase 5
- Summary: Implement validation against overlaps and out-of-bounds placements during compilation.
- Acceptance Criteria:
  - Compiler emits structured warnings/errors for overlaps, boundary violations, and invalid door placements.
  - Validation configurable via `@config` / `arch.config.json`.
  - Tests cover positive/negative scenarios with snapshot-friendly output.

## Implement runtime diffing for HMR
- Source: `packages/parser/src/runtime.ts:102`
- Spec: `specification.md` §Example developer workflow
- Plan: `project-plan.md` Phase 3
- Summary: Replace full remounts in `update()` with smart DOM diffing for hot module replacement.
- Acceptance Criteria:
  - Runtime applies minimal updates (create/update/remove) for rooms, walls, doors, and grids.
  - HMR demos confirm state preservation and reduced flicker.
  - Performance measured against large plans shows improvements over current remount strategy.

