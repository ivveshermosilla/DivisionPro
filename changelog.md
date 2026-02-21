Changelog:

[1.0.0] - Initial Release (Base Prototype)
Added

Core Engine: Creation of the base environment initially named "Matpro Divisiones V1".

Core Mechanics: Implementation of the Drag and Drop system with a virtual numeric keypad.

Logic Generator: Random generation system for simple division problems.

Bilingual Support: Basic button to toggle text between English and Spanish.

[1.0.1] - "Bring Down" Step Integration
Added

BRINGDOWN Step: Introduced the vital mechanic of "bringing down the next digit" in the division process.

Animations: Added the .blink-soft CSS class to make boxes or numbers requiring user attention blink.
Changed

The global gameState object was redesigned and simply renamed to game, improving how indices and working values are stored.

[1.0.2] - Interface Refactoring
Changed

Clean Code: Refactored the render() function by delegating the creation of boxes to an internal helper (createDropZone), improving code cleanliness.

Number Design: Dividend numbers now have a fixed minimum width and rounded borders, making the interaction area more uniform.

[1.0.3] - Identity Change and Drag Stability
Added

Name Change: The project transitioned from "Matpro Divisiones" to its final name: DivisionesPro.

Visual Accessibility: Increased the font sizes of the Drop Zones to 3rem for better readability.
Changed

Optimized the Drag & Drop engine, removing redundant checks and relying purely on the dragType.

[1.0.4] - Row History Implementation
Added

Row Structure (game.rows): Restructured the work area (remainders) to function via an array of objects (storing the remainder and the next digit).
Changed

Work Area Rendering: The work area now renders the remainder and the newly brought-down digit side by side, simulating the classic paper-and-pencil division structure.

[1.0.5] - Visual Focus on Historical Rows
Changed

History Dimming: Added the .row-history CSS class which applies a 0.4 opacity to previous remainder rows. This helps maintain the child's visual focus exclusively on the current working row.

Calculation Logic: Removed static variables targetQ and targetR. The system now calculates the correct results in real-time using Math.floor(game.currentWorkingVal / game.divisor).

[1.0.6] - Answer Locking and Mandatory Correction
Added

Anti-lock Mechanism (hasError): Introduced a function that detects if there is an error on screen (red box). The game blocks any other action (like selecting numbers or bringing down digits) until the player corrects the current error.

State Locking (isLocked): The quotient array now stores objects with the isLocked property, ensuring that previously correct answers cannot be accidentally overwritten.
Changed

Keypad Interface: Improved the numeric keypad (numpad) by centering the number "0" at the bottom for a design closer to a real phone or calculator.

[1.0.7] - Strict Order Validation and Colors
Changed

Quotient Validation: Added strict order validation. Numbers can no longer be dropped into any empty quotient box; the user is forced to fill it from left to right.

Semantic Color Coding: Introduced specific CSS classes to guide the user visually: .active-blue for the remainder area and .working-yellow for the brought-down digit area.

[1.0.8] - Dynamic Error Messages and Animations
Added

Specific Feedback: Implemented dynamic and mathematical error messages. Instead of a generic error, the system now explains the mistake (e.g., "Oops! 7 x 5 = 35. Find a number closer to 31" or "Incorrect. 31 - (4 x 7) is not 5").

Error Animation: Introduced a CSS shake animation (shake) when an incorrect number is dropped.

Test Environment: Temporarily set up a static division problem (316 ÷ 7) for development testing.

[1.0.9] - Visual Refinement of the "Staircase"
Changed

Random Generation: Restored random generation for division problems with numbers up to 9999 (removing the static test set from V1.0.8).

Visual "Staircase" Logic: Redesigned how working rows are displayed in the bottom area. Now the active row keeps the remainder and the brought-down number together under a yellow focus (working-focus) until the next quotient is resolved.

State Management: Added the tempBringdown variable to handle the temporary display of brought-down digits before they are confirmed.

¡Excelente! He analizado a fondo la evolución del código desde la versión 1.1.0 hasta la 1.1.9, comparando cada salto paso a paso.

Esta fue una fase de desarrollo masiva donde el proyecto pasó de ser un simple tablero de juego a una aplicación completa con menús, historial, persistencia de datos y la introducción del motor "Pro".

Aquí tienes la Parte 2 del CHANGELOG.md en inglés y en orden cronológico, lista para copiar y pegar debajo de la Parte 1:


[1.1.0] - Complete UI Overhaul & Game Configuration
Added

Screen System: Replaced the static layout with a centralized screen navigation system (.screen, .hidden) containing a Main Menu, Config Screen, and Game Screen.

Difficulty Selector: Added Easy, Normal, and Hard modes, which dynamically affect the random generation logic (number size and exact/remainder divisions).

Question Slider: Added an adjustable slider to choose the number of questions per session (1 to 50).

Global State Management: Implemented an appState object to track configuration, game progression, and timers.

[1.1.1] - Scoreboard Implementation
Added

Session Scoreboard: Created an end-of-session summary screen (#screen-score).

Performance Metrics: The scoreboard now calculates and displays the total time elapsed and total errors made.

Detailed Table: Added a question-by-question breakdown table showing the specific operation, time taken, and error count per question.

[1.1.2] - Global History Tracking
Added

Persistent Storage: Integrated the LocalStorage API to save and retrieve past sessions.

Global History Screen: Added a "Scoreboard" button in the config menu that opens a global history table displaying the Date, Difficulty Mode, Time, and Total Errors of all past games.

[1.1.3] - Detailed Error Logging System
Added

Deep Error Tracking: The engine now records the exact mathematical mistakes made during a session (e.g., logging the user's incorrect quotient or remainder input versus the expected correct value).

Session Details Modal: Clicking a specific row in the global history table now opens a modal (#modal-details) displaying the exact mistakes made in that specific session.

[1.1.4] - Enhanced Log Rendering & Feedback
Changed

Log UI Upgrade: Redesigned the detailed error log rendering (renderDetailedLog) to use a structured, styled list format for better readability instead of raw text.

Backward Compatibility: Added a failsafe to handle legacy history data gracefully if it doesn't contain detailed stats.
Added

Perfect Session Feedback: Added a congratulatory message that appears if a session is completed with zero errors.

[1.1.5] - Game Layout & Navigation Improvements
Changed

Action Button Relocation: Moved the "Next Question" button from inside the message box to a persistent, dedicated side panel (.action-btn-side).
Added

Top Status Bar: Added a persistent top bar during gameplay displaying the active timer and question progress (e.g., 📝 1 / 10).

Exit Confirmation: Added an exit confirmation modal (#modal-exit) to pause the timer and prevent accidental progress loss when leaving a game.

[1.1.6] - Player Identification & History Management
Added

Player Name Input: Added a modal at the end of a session prompting the user to enter their name before saving the score.

History Updates: Added a "Name" column to the global history table.

Reset Functionality: Added a "Reset History" button with a confirmation prompt to easily clear local data.

[1.1.7] - Full Multilingual Localization
Changed

Dynamic Translation: Refactored the text rendering engine. All UI elements (modals, scoreboards, config labels, alerts) are now integrated into the central translation dictionary.

Seamless Switching: Users can now switch between English and Spanish seamlessly across all screens (Menu, Config, Scoreboard) without reloading the page.

[1.1.8] - Dual-Mode Framework Setup
Added

Menu Expansion: Redesigned the Main Menu to accommodate two distinct learning tracks: "Learn to Divide" (Assisted) and "DivisionPro" (Unassisted).

Mode Tracking: The global history logic was updated to track and display whether the session was played in standard or Pro mode.

Pro Theming: Introduced distinct color variables (--pro-color) to differentiate the upcoming Pro mode visually.

[1.1.9] - DivisionPro Core Engine Implementation
Added

DivisionPro Mechanics: Implemented the entirely new, unassisted game engine (#screen-game-pro) allowing free-form input from left to right.

Dynamic Scaffolding: Added the calcProScaffolding algorithm to automatically calculate and generate the exact number of scratchpad grid boxes required for any random division.

Free Navigation: Added side arrow buttons allowing users to skip, move back, and review questions freely before submitting the final test.

Batch Evaluation: Added the finishProGame logic, which evaluates and grades the entire set of answers at the end of the session rather than correcting step-by-step.

[1.2.0] - Structural Separation of Game Modes
Changed

Decoupled Environments: Completely separated the UI containers and screens for the two game modes (#screen-game-learn and #screen-game-pro), ensuring that styles and DOM elements no longer overlap or interfere.

Independent Tracking: Split the top-bar elements (timers and progress counters) to be handled independently by each specific game mode.

Routing Refactor: Updated the showScreen navigation logic to properly route the user to the correct dedicated screen based on the selected mode.

[1.2.1] - Pro Mode Enhancements & UI Optimization
Added

Visual Highlighting: Added the ability to tap dividend and residue digits in DivisionPro to highlight them in yellow, helping students group numbers mentally.

Auto-Clear Feature: Highlighting now automatically clears the moment a number is successfully dragged into the quotient.

Final Remainder Validation: Introduced a semi-mandatory final remainder feature. If the quotient is full but the remainder is empty, a blinking arrow (←) and a flashing box prompt the user to finish the operation.
Changed

Smart Error Deduplication: Upgraded the error logging logic. Dropping the exact same incorrect number into the same box multiple times now only counts as a single error, preventing unfair score inflation due to frustration or misclicks.

Scroll Elimination (Floating UI): Removed the static top bar and replaced it with floating (fixed positioning) elements for the Exit button, Timer, and Counter. This drastically reduced top padding, moving the workspace up and eliminating vertical scrolling on most devices.

Config Menu Redesign: Transformed the configuration screen into a responsive two-column layout. The instructions card now has its own internal scrollbar, ensuring the "Start" button and settings are always visible without scrolling the whole page.

Modal UX Improvements: Adjusted z-index layering so the floating Language button remains clickable over dark overlays. Additionally, users can now close the details modal by simply clicking on the dark background.

[1.2.2] - Dual Grading System & Final Polish
Added

Smart Evaluation Algorithm: Implemented a weighted grading logic for DivisionPro: 70% of the score is based on the Quotient, and 30% is based on the Remainder.

The "Fail-Safe" Rule: Added strict validation stating that if the quotient is wrong, the entire question receives 0 points, preventing accidental correct remainders from skewing the grade.

Dual Grading Scales: * Integrated Chilean Grading (1.0 to 7.0) calculated dynamically based on a 60% difficulty threshold (Exigencia).

Integrated USA Grading (A, B, C, D, F) based on standard percentage tiers.

Scoreboard UI Upgrade: Added dynamic score cards to the session summary screen (turning green for passing grades and red for failing ones) and included a dedicated "Grade" column in the global history table.
Fixed

Localization Polish: Fixed an internal dictionary bug where the "Question omitted" error string was hardcoded in English while playing in Spanish.

Terminology: Standardized the American grading label to "Grade (USA)" for better international clarity.
