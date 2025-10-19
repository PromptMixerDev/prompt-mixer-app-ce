# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the React + TypeScript renderer separated into domain folders (`components/`, `store/`, `hooks/`, `db/`, etc.).
- `main.js` and `preload.js` manage the Electron main and preload processes; platform packaging settings live in `builder-configs/`.
- Static assets ship from `public/` (HTML shell, screenshots) and `resources/` (icons, entitlements).
- End-to-end automation lives in `tests/`, where Cucumber `.feature` files under `tests/src/features` map to shared step definitions in `tests/src/steps`.

## Build, Test, and Development Commands
- `yarn start` runs the renderer dev server and waits for it before launching Electron via `electron-start`.
- `yarn react-build` compiles the production renderer bundle; OS-specific bundles come from `yarn build:mac`, `yarn build:win`, or `yarn build:linux`.
- `yarn electron-build` assembles a platform-neutral distributable using `electron-builder`.
- `yarn test` executes the WebdriverIO+Cucumber suite, while `yarn lint` and `yarn format:check` enforce style gates. Use `yarn lint:fix` and `yarn format` to auto-resolve violations.

## Coding Style & Naming Conventions
- Favor strongly typed exports and keep component files in PascalCase (`components/ProgressBarModal.tsx`); hooks remain camelCase (`hooks/useThemeMode.ts`).
- Prettier (2-space indentation, single quotes) and ESLint back the code style—never hand-format; run the provided scripts instead.
- Redux slices in `store/` colocate actions, reducers, and selectors. Mirror this pattern when introducing new state domains.
- Keep UI strings in the shared dictionaries or constants modules rather than inline JSX to ease localization.

## Testing Guidelines
- Add new behavior through `.feature` files alongside matching Given/When/Then code in `tests/src/steps`. Stick to present-tense step names (`When the user...`).
- Prefer deterministic setups by leveraging IndexedDB helpers and workspace factories instead of manual UI sequences.
- Run `yarn test` before pushing and capture relevant logs when scenarios fail; flaky tests should be quarantined via tags and explained in the PR.

## Commit & Pull Request Guidelines
- Recent history favors concise, imperative subjects (`Bump electron from…`, `Add workflow reset modal`). Follow that format and reference issues with `#123` as needed.
- Commits should bundle related changes only; include regenerated assets (e.g., `dist/`) only when release engineering requests it.
- Pull requests need a short summary, testing notes (commands run, screenshots for UI diffs), and call out any configuration changes or new environment variables.
