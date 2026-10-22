# Prompt Engineering & Development Log

This document records the prompt progression used while pair programming with Antigravity to build the Frequent Flyer Portal.

---

### Prompt 1: Initial Architecture & Test Suite Setup
> "Hey, I need to build a web-based Frequent Flyer Portal for airline ground staff. We need to follow TDD with Vitest. Can you write the unit tests first in `tests/portal.test.js`? It should test member search by ID/name/email, tier calculation (Bronze, Silver, Gold, Platinum), cabin class mileage multipliers (Economy 1x, Premium Economy 1.25x, Business 1.5x, First 2x), flight logging, miles redemption with unique voucher codes, and edge cases like invalid form inputs, empty search, and XSS sanitization."

**Result:**
Vitest test suite created with 12 tests covering happy path and edge cases. Initial run failed as expected (red stage).

---

### Prompt 2: Core Logic Implementation
> "The tests are failing as expected. Now write the core module in `src/portalCore.js` to satisfy all 12 tests. Keep it clean and modular with no comments. Export the redemption catalog, calculation functions, member search, flight logging, validation functions, and analytics logger."

**Result:**
Created `src/portalCore.js`. All 12 unit tests passed cleanly (`12 passed in 19ms`).

---

### Prompt 3: UI Layout & Corporate Styling
> "Now let's build `index.html` and `styles.css`. Keep the design clean, corporate, and monochromatic (black, white, and slate). I want a top navbar with navigation tabs (Dashboard, Members, Flights, Rewards), a quick summary metrics bar, a left sidebar for member directory search and tier filters, and a main area showing the active member's tier progress, flight manifest table, rewards catalog, and voucher history. Also add modals for registering new members and logging flights."

**Result:**
Built the semantic HTML structure and CSS design system with responsive grid layout and accessible form elements.

---

### Prompt 4: UI/UX Bug Fixes & Interaction Polish
> "Can you review the HTML and CSS for bugs? When a modal opens, the background page still scrolls—please lock the background scroll (`body.modal-open`). Also, when clicking outside the modal backdrop or pressing Escape, close the modal smoothly. Make sure the buttons have good tactile click feedback and add a live estimated miles calculator in the flight modal when typing distance and selecting cabin class."

**Result:**
Added modal backdrop click-to-close, body scroll lock, Escape key handler, and live calculation preview in `script.js` and `styles.css`.

---

### Prompt 5: Live Form Validation & Error Clearance
> "In the forms, if required fields are missing, highlight them with a red border and show error text. But as soon as the user starts typing in that field, clear the red border and error immediately so it doesn't feel stuck. Also make sure the search bar has a clear button that shows only when text is entered."

**Result:**
Added real-time input event listeners that immediately remove `.is-invalid` and clear error spans on user keystroke. Debounced search input with dynamic clear button.

---

### Prompt 6: Dark/Light Mode Theme Toggle & Network Simulator
> "Add a theme toggle button in the navbar to switch between clean White mode and sleek Black dark mode. Store the preference in localStorage so it persists. Also add a network simulator button that toggles between Online, Slow 3G (with a 1.2s delay spinner), and Offline mode (blocking redemption mutations). Make sure the footer simply says 'Made by Harsh Vardhan' centered at the bottom."

**Result:**
Implemented CSS theme variables for `[data-theme="dark"]`, instant toggle with moon/sun icon, 3-state network simulator with user toast alerts, and centered clean footer.

---

### Prompt 7: Mobile Responsiveness & Navigation Drawer
> "Check the responsive layout on smaller screens under 768px. The navbar items should collapse into a mobile hamburger menu drawer. When a user clicks a nav tab on mobile, close the drawer and smoothly scroll to the section. When selecting a member from the directory on mobile, smoothly scroll down to the dashboard view."

**Result:**
Added mobile menu toggle, slide-down drawer styling, and smooth auto-scroll to member details on mobile viewports.
