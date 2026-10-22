# AeroFleet | End-to-End Frequent Flyer Portal

This is a digital frequent flyer operations desk built for airline floor staff (Ticket: **ENG-163087** • Module: **End-to-End Frequent Flyer Portal**). It replaces slow, error-prone paper manifests and Excel sheets with an instant, accessible web portal designed to handle spotty airport connectivity and operational workflows.

---

## Ticket Information
- **Ticket ID:** ENG-163087
- **Epic:** Core Infrastructure Overhaul
- **Priority:** P1 (High)
- **Story Points:** 5
- **Assigned To:** Harsh Vardhan [PDIT-INT-1260]
- **Reporter:** Amit Sharma (Senior Staff Engineer / Module Lead)
- **GitHub Repository:** [https://github.com/harsh-vardhan-tech/end-to-end-frequent-flyer-portal](https://github.com/harsh-vardhan-tech/end-to-end-frequent-flyer-portal)
- **Live Deployment:** [https://harsh-vardhan-tech.github.io/end-to-end-frequent-flyer-portal/](https://harsh-vardhan-tech.github.io/end-to-end-frequent-flyer-portal/)

---

## Technologies Used
- **HTML5:** Semantic architecture, accessible landmarks, WCAG 2.1 AA compliance.
- **CSS3:** Corporate monochromatic design system (light/dark mode support with 16px/32px step padding).
- **Vanilla JavaScript (ES Modules):** Clean modular controller, state management, and `localStorage` persistence.
- **Vitest & JSDOM:** Test-Driven Development (TDD) test suite.
- **Vite:** Modern development server and production build bundler.

---

## Core Features & Requirements

### 1. Agile User Stories (Happy Path)
- **Top Navigation Bar:** Immediate access to Dashboard, Members directory, Flight manifests, and Rewards catalog.
- **White / Black Theme Toggle:** Instant switch between clean White mode and sleek Black dark mode with persistent user preference.
- **Instant Member Lookup:** Fast real-time search by Member ID (e.g. `FF-10492`), Name, or Email with debounce.
- **Tier Progression Engine:** Real-time calculation of membership tier (`Bronze`, `Silver`, `Gold`, `Platinum`) based on qualifying flight miles with a visual progress bar.
- **Flight Mileage Crediting:** Calculate base distance and cabin class multipliers (Economy 1.0x, Premium Economy 1.25x, Business 1.5x, First 2.0x), automatically crediting miles and triggering tier upgrade notifications.
- **Miles Redemption Desk:** Browse catalog rewards (Free Flights, Business Class Upgrades, Lounge Access, Extra Baggage) with real-time affordability checks and unique voucher generation.

### 2. Edge Case Handling (The "Unhappy Path")
- **Empty States:** Clear, friendly empty states with descriptive guidance when no members match search filters, when a member has zero flights logged, or when no redemptions exist.
- **Network Simulator (Spotty Connectivity Resilience):** Floor staff can toggle between `Online (Fast)`, `Slow 3G (Simulated)` with visual loading spinners, and `Offline (Local Queue)` preventing failed remote actions.
- **Input Validation:** Malformed or missing inputs are prevented from submission and highlighted with high-visibility red borders (`#ef4444`) with error hints and `aria-invalid="true"`.

### 3. Non-Functional Requirements (NFRs)
- **Accessibility (a11y):** Full keyboard navigability (`Tab`, `Escape`, `Enter`), skip links, ARIA live regions, and high-contrast color palette.
- **Security:** Strict HTML entity sanitization (`sanitizeInput`) against Cross-Site Scripting (XSS) before storing or rendering data.
- **Telemetry Simulation:** Standardized logging (`[Analytics] User interacted with End-to-End Frequent Flyer Portal - <Action>`) fired on every primary user interaction.

---

## Project Structure
```text
Clint proj 4/
├── index.html            # Semantic HTML5 portal interface
├── styles.css            # Monochromatic corporate design system
├── script.js             # UI Controller, state, network simulator & DOM
├── src/
│   └── portalCore.js     # Core business logic, validation & calculations
├── tests/
│   └── portal.test.js    # Vitest automated test suite (12 tests)
├── package.json          # Node dependencies, scripts (test, dev, build)
├── vitest.config.js      # Vitest configuration for jsdom
├── PROMPTS.md            # Vibe Coding & TDD prompt traceability log
└── README.md             # Project documentation and specifications
```

---

## How to Run & Verify

### Run Development Server
```bash
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.

### Run Automated TDD Test Suite
```bash
npm test
```
Executes all 12 unit tests verifying Happy Path, Unhappy Path, and NFR requirements.

### Production Build
```bash
npm run build
```
Generates production-ready, minified build artifacts in `dist/`.
