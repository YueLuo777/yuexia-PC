# Code Change Guardrails

This project favors small, verified changes over broad rewrites. Use this checklist before changing behavior.

## Required Checks

- Run `npm.cmd run check` after TypeScript or import changes.
- Run `npm.cmd run test:run` after touching storage, events, business rules, IPC, or model calls.
- Run `npm.cmd run build` before packaging or sharing a desktop build.
- Use `npm.cmd run verify` for the full local gate.

## Storage Rules

- Prefer `createJsonStorage`, `readJsonValue`, and `writeJsonValue` from `src/shared/storage/jsonStorage.ts`.
- Never call `JSON.parse(localStorage.getItem(...))` directly in new code.
- Reads must tolerate missing keys, malformed JSON, and old shapes by returning a safe fallback.
- Do not delete or rename existing `localStorage` keys unless a migration keeps old user data readable.

## Event Rules

- Add shared event names to `src/shared/events/appEvents.ts`.
- Do not hand-type `xinyuexia_*` event strings in feature files.
- Keep event payload types close to the emitter when the event carries data.

## Business Logic Rules

- Put reusable rules in model files, not page components.
- Add or update tests before changing rules for chapters, volumes, word counts, imports, exports, model parsing, or database collection behavior.
- Large pages should delegate to hooks, model helpers, or focused components instead of growing new responsibilities.

## Electron IPC Rules

- Validate main-process IPC inputs before using them.
- Keep validation helpers testable outside Electron, such as `electron/ipcValidation.cjs`.
- IPC handlers should return stable `{ ok, ... }` structures for expected failures instead of throwing.

