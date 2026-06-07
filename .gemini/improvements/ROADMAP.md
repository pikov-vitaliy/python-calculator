# Future Roadmap: Stage 4 - Advanced Engineering & Integration

This document outlines the architectural vision and potential features for the next phase of the Web Calculator project.

## 1. Mathematical Expansion (Advanced Engineering)
*   **Trigonometry:** Implementation of `sin`, `cos`, `tan`, `atan` using the existing Shunting-yard parser.
*   **Logarithmic Functions:** Support for `log` (base 10) and `ln` (natural log).
*   **Factorials:** Implementation of the `!` operator with appropriate precedence.
*   **Constants:** Addition of `Golden Ratio (phi)` and `Speed of Light (c)`.

## 2. Variables & Memory Management
*   **Local Variables:** Allow users to define variables like `cost = 500` and use them in subsequent expressions.
*   **Standard Memory (MS/MR/MC):** Classic calculator memory slots stored in local storage for persistence across sessions.
*   **Last Result Anchor:** An automatic variable `ans` that always holds the previous calculation's result.

## 3. Visualization & Rich UI
*   **Function Plotting:** Integration with a lightweight library (like `Chart.js` or `Recharts`) to render 2D graphs for expressions containing `x`.
*   **Dark Mode refinements:** Fine-tuning the glassmorphism effects and adding custom color themes (e.g., "Matrix", "Nord", "Midnight").
*   **Visual Step-by-Step:** A "Debug" mode showing how the parser breaks down the expression into tokens and RPN steps.

## 4. Platform & Offline Support (PWA)
*   **Progressive Web App:** Adding `manifest.json` and a Service Worker to allow installation on mobile/desktop.
*   **Offline Computation:** Ensuring the core parser and UI work without an internet connection (syncing history to SQLite only when online).

## 5. Data Sovereignty
*   **Export/Import:** Tooling to download calculation history in `CSV` or `JSON` formats for accounting or scientific reports.
*   **Data Erasure:** A dedicated privacy section to manage local and server-side data.

---

*Note: These features are currently in the planning stage and are not implemented in the current production version.*
