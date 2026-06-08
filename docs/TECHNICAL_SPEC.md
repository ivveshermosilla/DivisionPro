# DivisionPro Technical Spec

Last updated: 2026-06-08
Current version: DivisionesPro V1.3.8

## Project Purpose

DivisionPro is a GitHub Pages educational webapp for practicing long division. It keeps two game modes:

- `Aprende a dividir` / Learn mode: guided long division with sequence prompts and immediate correction.
- `DivisionPro` / Pro mode: unassisted practice with score, Chilean grade, USA grade, and detailed error review.

The player must drag numbers into the division boxes. Touching a dividend digit or target box is used as a guide/selection step, not as a replacement for drag-and-drop.

## File Map

- `index.html`: HTML shell and all app screens, modals, footer links, inline event hooks, and script/style references.
- `assets/css/styles.css`: complete visual system, responsive layout, game board sizing, language screen, menu panels, score/history tables, and mobile/tablet rules.
- `assets/js/state.js`: global `appState` object used by every feature family.
- `assets/js/i18n.js`: Spanish/English text dictionary, `t()`, language toggle refresh, and document language synchronization.
- `assets/js/layout.js`: touchmove support, division grid alignment helpers, residue row placement, and resize rerender hooks.
- `assets/js/navigation.js`: screen navigation, modal handling, language switching side effects, localStorage key selection, UI text refresh, and MatPro language bridge link.
- `assets/js/config.js`: difficulty selection, question count controls, and difficulty description updates.
- `assets/js/game-engine.js`: session startup, random question generation, Pro-mode scaffold calculation, and keypad rendering.
- `assets/js/touch-drag.js`: mobile touch drag support that preserves the native drag model and removes transient drag artifacts.
- `assets/js/learn-mode.js`: guided mode rendering, step validation, digit selection, quotient/remainder drops, bring-down flow, and guided session stats.
- `assets/js/pro-mode.js`: Pro mode rendering, free-form quotient/remainder drops, navigation, and scoring.
- `assets/js/results-history.js`: timers, score summary, name save modal, detailed logs, localStorage histories, and session details.
- `assets/js/home-widgets.js`: quick division panel and latest-10 combined home history panel.
- `assets/js/app.js`: boot sequence, URL/localStorage language detection, first render, and optional skip of the language screen.
- `Versions/`: archived official single-file releases.
- `changelog.md`: release history.
- `README.md`: project identity, live link, feature summary, and roadmap.

## Script Loading Rule

Scripts are intentionally loaded as classic browser scripts, not ES modules. This preserves GitHub Pages compatibility and keeps existing inline handlers such as `onclick="startGame()"` working.

Current order:

1. `layout.js`
2. `state.js`
3. `i18n.js`
4. `navigation.js`
5. `config.js`
6. `game-engine.js`
7. `touch-drag.js`
8. `learn-mode.js`
9. `pro-mode.js`
10. `results-history.js`
11. `home-widgets.js`
12. `app.js`

If a future update changes this order, run the full regression checklist. Several files reference functions that are defined later but only execute after boot, so changing timing carelessly can break startup, language toggles, or drag cleanup.

## Persistence

DivisionPro stores data in browser `localStorage`:

- `ivves_preferred_lang`: shared preferred language used by MatPro and DivisionPro.
- `divisiones_history_learn`: mode-specific guided history.
- `divisiones_history_pro`: mode-specific Pro history.

The home panel shows the latest 10 combined sessions across both modes. It must not replace or delete the detailed per-mode histories.

## Sensitive Areas

- Learn mode `SELECT`, `QUOTIENT`, `REMAINDER`, and `BRINGDOWN` sequence.
- Guard against advancing the sequence when the wrong dividend digit is touched.
- Mobile drag-and-drop in phone, tablet, and landscape layouts.
- Remainder grid alignment when numbers grow or the device rotates.
- Remainder value rendering for exact divisions such as `21 ÷ 3`; never show `NaN`.
- Drag artifact cleanup after question changes.
- Language switching on menu, config, gameplay, score, history, and modal views.

## Minimum Regression Checklist

Run these after any meaningful change:

1. Language screen loads with topbar and MatPro-aligned visual proportions.
2. ES/EN toggle updates visible text and preserves `?lang=` when linking to MatPro.
3. Learn mode `21 ÷ 3`: quotient `7`, remainder `0`, no `NaN`.
4. Learn mode `362 ÷ 3`: wrong first digit touch does not advance; second and third bring-down digits align exactly.
5. Learn mode `232 ÷ 12`: two-digit partial remainder aligns after rotation/resize.
6. Pro mode `362 ÷ 3`: quotient/remainder/scaffold rows align and final grade renders.
7. Mobile touch drag moves keypad digits into boxes without persistent `.drag-ghost`, `.mobile-drag-image`, or `dnd-poly-*` artifacts.
8. Home recent sessions show latest 10 combined sessions, while per-mode history remains accessible.
9. Desktop, iPhone/Android phone, iPad/tablet, and landscape viewports have no horizontal overflow or clipped controls.

## Deployment

The official app is served from:

`https://ivveshermosilla.github.io/DivisionPro/`

Before pushing a new official version:

1. Run `git status --short`.
2. Archive the previous official `index.html` in `Versions/` if the version changes.
3. Update `changelog.md`, this file, and shared combined AI context.
4. Run local browser regression tests.
5. Commit and push to `origin main`.
6. Verify local HEAD, `origin/main`, `git ls-remote`, raw GitHub content if useful, and GitHub Pages with a cache-busting query string.
