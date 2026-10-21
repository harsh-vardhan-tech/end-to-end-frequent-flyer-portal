# PROMPTS.md — Vibe Coding & TDD Prompt Traceability Log

**Ticket ID:** ENG-163087  
**Epic:** Core Infrastructure Overhaul  
**Module:** End-to-End Frequent Flyer Portal  
**Primary Owner:** Harsh Vardhan [PDIT-INT-1260]  
**Reporter:** Amit Sharma (Senior Staff Engineer / Module Lead)  
**Date:** October 21, 2026  

---

## Overview

This document contains the prompt engineering journey and iterative workflow used to guide the Antigravity AI assistant in developing the **End-to-End Frequent Flyer Portal**. The project follows a strict Test-Driven Development (TDD) approach, implementing both Happy Paths (Agile user stories) and Unhappy Paths (empty states, spotty 3G/offline connectivity, invalid input validation, and XSS sanitization).

---

## Phase 1: Test-Driven Development (TDD) & Core Business Logic

### Prompt 1.1: Test Suite Specification (Vitest)
```text
Role: Staff QA & Core Infrastructure Engineer.
Context: We are replacing an airline floor staff paper and Excel system with a digital End-to-End Frequent Flyer Portal (Ticket ENG-163087).

Before writing any UI or implementation code, write a comprehensive test suite in `tests/portal.test.js` using Vitest covering:
1. Agile User Stories (Happy Path):
   - Member search across ID, Name, and Email.
   - Tier status calculations (Bronze < 25k, Silver 25k-50k, Gold 50k-100k, Platinum >= 100k).
   - Flight mileage multipliers (Economy 1.0x, Premium Economy 1.25x, Business 1.5x, First 2.0x).
   - Flight segment logging with tier upgrade detection.
   - Miles redemption with balance deduction and unique voucher generation.
2. Unhappy Path (Edge Cases):
   - Empty search results handling without crashes.
   - Insufficient miles redemption prevention.
   - Form field input validation (empty names, invalid emails, negative numbers, bad IATA codes).
3. Non-Functional Requirements (NFRs):
   - XSS input sanitization.
   - Telemetry simulation logging: `[Analytics] User interacted with End-to-End Frequent Flyer Portal - <Action>`.

Ensure the tests initially fail so we can verify the red-green-refactor loop.
```

### AI Response & Outcome:
- Antigravity created `tests/portal.test.js` importing from `src/portalCore.js`.
- Ran `npm test`, resulting in expected suite failure (`Cannot find module ../src/portalCore.js`). Red phase verified.

---

### Prompt 1.2: Core Business Logic Implementation
```text
Now write the complete core logic in `src/portalCore.js` to satisfy all 12 tests in `tests/portal.test.js`.
Requirements:
1. Export `PORTAL_REDEEM_CATALOG` with rewards for Flights, Upgrades, Lounge Access, and Excess Baggage.
2. Export `sanitizeInput(str)` encoding HTML entities to prevent XSS injection.
3. Export `calculateTier(qualifyingMiles)` with exact thresholds.
4. Export `calculateFlightMiles(distance, cabinClass)` applying cabin multipliers.
5. Export `searchMembers(membersList, query)` supporting multi-field search.
6. Export `logFlightSegment(member, flightData)` returning earned miles, updated balance, and tier upgrade flags.
7. Export `redeemMiles(member, reward)` ensuring atomic balance deduction and voucher generation.
8. Export `validateMemberInput(data)` and `validateFlightInput(data)` returning granular field-level validation errors.
9. Export `logAnalytics(action, details)` outputting standardized analytics telemetry.
```

### AI Response & Outcome:
- Antigravity generated `src/portalCore.js`.
- Ran `npm test`. All 12 unit tests passed with 100% test coverage. Green phase achieved.

---

## Phase 2: User Interface & Corporate Monochromatic Design System

### Prompt 2.1: Semantic HTML5 Structure & a11y Foundation
```text
Build `index.html` for the Frequent Flyer Portal complying with WCAG 2.1 AA and 100% Lighthouse Accessibility:
- Include a skip link (`#mainContent`).
- Ensure all interactive elements have explicit accessible labels (`aria-label`, `aria-labelledby`, `aria-describedby`).
- Layout structure:
  - Header: Brand identity, quick metrics bar (members, tier upgrades, flights logged, total miles), and a Network Connectivity Simulator button (`Online ⚡`, `Slow 3G ⏱️`, `Offline 🚫`).
  - Left Sidebar: Member search box with clear button, tier filter pills (`All`, `Platinum`, `Gold`, `Silver`, `Bronze`), async loading spinner for spotty connections, member cards list, and empty state message.
  - Right Main View: Active member summary card, tier progression progress bar, KPI metrics cards, and 3 tab panels:
    1. Flight Segments history table + "+ Log Flight" modal button.
    2. Miles Redemption Desk grid showing reward cards with affordability checks.
    3. Redemptions Voucher log.
- Modals for "Register New Member" and "Log Flight Segment" with keyboard traps and ESC handling.
- Footer: "End-to-End Frequent Flyer Portal • Ticket ENG-163087 • Made by Harsh Vardhan".
```

### AI Response & Outcome:
- Antigravity constructed a clean, semantic HTML5 document with complete ARIA landmarks, roles, and accessibility metadata.

---

### Prompt 2.2: Monochromatic Enterprise Corporate Styling
```text
Write `styles.css` strictly adhering to the corporate monochromatic design guidelines from the ticket handoff:
1. Palette: Deep slate and enterprise obsidian (`#090d16`, `#111827`, `#1e293b`, `#334155`) with high-contrast text (`#f8fafc`, `#94a3b8`) and metallic tier accents (Bronze `#b45309`, Silver `#94a3b8`, Gold `#eab308`, Platinum `#e2e8f0`).
2. Spacing: Maintain consistent steps in 16px/32px steps (`var(--spacing-md): 16px`, `var(--spacing-xl): 32px`).
3. Form Validation: Offending input fields must highlight with a high-visibility red border (`#ef4444`) and display field-level error messages.
4. Focus States: Clear `:focus-visible` outline rings for complete keyboard navigation.
5. Responsive Grid: Smooth responsiveness adapting from multi-column desktop displays down to mobile tablets.
```

### AI Response & Outcome:
- Antigravity generated `styles.css` adhering to all design constraints with zero rogue hex colors.

---

## Phase 3: State Management, Offline Simulation & Edge Case Handling

### Prompt 3.1: Controller Logic & Connectivity Simulator
```text
Write `script.js` wiring up the DOM with `src/portalCore.js`:
1. Pre-seed with 5 realistic airline passenger records across all tiers so staff can test immediate functionality.
2. Persist state changes in `localStorage`.
3. Implement the Network Simulator (`Online (Fast)`, `Slow 3G (Simulated)` with 1.2s spinner delay, and `Offline (Local Queue)` preventing cloud sync).
4. Implement dynamic flight mileage preview: when staff types distance and selects cabin class in the modal, show live estimated miles to credit.
5. Implement field-level validation on both forms with red borders (`.is-invalid`), `aria-invalid="true"`, and descriptive error text.
6. Connect telemetry logging to fire on every search, filter change, flight log, redemption, and tab switch.
7. Show toast alerts for success/failure with auto-dismissal.
```

### AI Response & Outcome:
- Antigravity delivered `script.js` connecting all workflows, handling edge cases, and satisfying all DoD items.

---

## Verification & Final Audit

| Test Case / Metric | Requirement | Result |
| :--- | :--- | :--- |
| Vitest Unit Tests | All tests passing | 12 / 12 Passed (100%) |
| Empty States | Friendly "No data found" | Verified for search, flights, redemptions |
| Spotty Connection | Visual loading spinner & offline block | Verified via Network Simulator |
| Invalid Inputs | Highlight offending fields in red | Verified with `.is-invalid` & ARIA |
| Accessibility | Keyboard navigable & ARIA ready | 100% Accessible structure |
| Security | XSS Sanitization | Sanitized before state storage |
| Telemetry | Simulated analytics logging | Verified in browser console |
