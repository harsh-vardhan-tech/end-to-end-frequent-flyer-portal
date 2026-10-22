# AeroFleet | Frequent Flyer Operations Portal

A web application designed for airline floor staff and operations to manage passenger loyalty accounts, credit flight mileage, process tier upgrades, and issue redemption vouchers with offline resiliency.

## Live Demo
- [Live Portal](https://harsh-vardhan-tech.github.io/end-to-end-frequent-flyer-portal/)

## Features
- **Member Directory & Search:** Real-time lookup across Member ID, passenger name, and email with instant tier filtering (Platinum, Gold, Silver, Bronze).
- **Automated Tier Progression:** Real-time calculation of member tier status based on qualifying flight miles with an interactive progress meter.
- **Flight Mileage Crediting:** Automatic calculation of earned flight miles based on distance and cabin class multipliers (Economy 1.0x, Premium Economy 1.25x, Business 1.5x, First 2.0x).
- **Miles Redemption Desk:** Catalog of airline rewards (Flight tickets, Cabin upgrades, Lounge passes, Excess baggage) with real-time affordability checks and unique voucher code generation.
- **Network Latency Simulator:** Built-in network simulator supporting Online (Fast), Slow 3G (with loading spinner delay), and Offline mode (blocking remote mutations to prevent data inconsistency).
- **Dark & Light Mode:** Corporate monochromatic design system with an instant theme toggle and local storage persistence.
- **Form Validation & Security:** Strict field-level input validation with instant error clearance and HTML entity sanitization against XSS attacks.

## Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES Modules)
- **Tooling & Bundling:** Vite
- **Testing:** Vitest & JSDOM (12 comprehensive unit tests)
- **Icons:** FontAwesome

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

### 3. Run Unit Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```
The optimized build output will be generated in the `dist/` directory.
