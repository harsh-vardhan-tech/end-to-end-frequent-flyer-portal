import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  sanitizeInput,
  calculateTier,
  calculateFlightMiles,
  searchMembers,
  logFlightSegment,
  redeemMiles,
  validateMemberInput,
  validateFlightInput,
  logAnalytics,
  PORTAL_REDEEM_CATALOG
} from "../src/portalCore.js";

describe("End-to-End Frequent Flyer Portal - Core Test Suite (TDD)", () => {
  let sampleMembers;

  beforeEach(() => {
    sampleMembers = [
      {
        id: "FF-10492",
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        tier: "Gold",
        milesBalance: 68500,
        qualifyingMiles: 52000,
        segments: 18,
        status: "Active",
        flights: []
      },
      {
        id: "FF-20811",
        name: "Ananya Iyer",
        email: "ananya.iyer@example.com",
        tier: "Silver",
        milesBalance: 34200,
        qualifyingMiles: 29000,
        segments: 10,
        status: "Active",
        flights: []
      },
      {
        id: "FF-30155",
        name: "Vikram Malhotra",
        email: "vikram.m@example.com",
        tier: "Bronze",
        milesBalance: 8400,
        qualifyingMiles: 8400,
        segments: 3,
        status: "Active",
        flights: []
      }
    ];
  });

  describe("1. Agile User Stories (Happy Path)", () => {
    it("should search and find member by Member ID, Name, or Email", () => {
      const byId = searchMembers(sampleMembers, "FF-10492");
      expect(byId.length).toBe(1);
      expect(byId[0].name).toBe("Rahul Sharma");

      const byName = searchMembers(sampleMembers, "ananya");
      expect(byName.length).toBe(1);
      expect(byName[0].id).toBe("FF-20811");

      const byEmail = searchMembers(sampleMembers, "vikram.m@example.com");
      expect(byEmail.length).toBe(1);
      expect(byEmail[0].tier).toBe("Bronze");
    });

    it("should accurately determine tier status based on qualifying miles", () => {
      expect(calculateTier(15000)).toBe("Bronze");
      expect(calculateTier(25000)).toBe("Silver");
      expect(calculateTier(50000)).toBe("Gold");
      expect(calculateTier(100000)).toBe("Platinum");
      expect(calculateTier(145000)).toBe("Platinum");
    });

    it("should calculate flight miles with cabin class multiplier", () => {
      const economyMiles = calculateFlightMiles(1000, "Economy");
      expect(economyMiles).toBe(1000);

      const premiumMiles = calculateFlightMiles(1000, "Premium Economy");
      expect(premiumMiles).toBe(1250);

      const businessMiles = calculateFlightMiles(1000, "Business");
      expect(businessMiles).toBe(1500);

      const firstMiles = calculateFlightMiles(1000, "First");
      expect(firstMiles).toBe(2000);
    });

    it("should log a flight segment and update member miles and tier", () => {
      const member = sampleMembers[1];
      const flightData = {
        flightNumber: "AI-101",
        origin: "DEL",
        destination: "JFK",
        distance: 7300,
        cabinClass: "Business"
      };

      const result = logFlightSegment(member, flightData);
      expect(result.success).toBe(true);
      expect(member.flights.length).toBe(1);
      expect(member.milesBalance).toBe(34200 + 10950);
      expect(member.qualifyingMiles).toBe(29000 + 10950);
      expect(member.tier).toBe("Silver");
    });

    it("should upgrade tier when qualifying miles cross threshold", () => {
      const member = sampleMembers[1];
      const flightData = {
        flightNumber: "AI-144",
        origin: "BOM",
        destination: "EWR",
        distance: 15000,
        cabinClass: "Business"
      };

      const result = logFlightSegment(member, flightData);
      expect(result.success).toBe(true);
      expect(member.qualifyingMiles).toBe(51500);
      expect(member.tier).toBe("Gold");
      expect(result.tierUpgraded).toBe(true);
    });

    it("should successfully redeem miles if balance is sufficient", () => {
      const member = sampleMembers[0];
      const reward = PORTAL_REDEEM_CATALOG.find((r) => r.id === "REWARD_UPGRADE_BIZ");

      const redemption = redeemMiles(member, reward);
      expect(redemption.success).toBe(true);
      expect(redemption.voucherCode).toBeDefined();
      expect(member.milesBalance).toBe(68500 - 15000);
    });
  });

  describe("2. Unhappy Path (Edge Case Handling)", () => {
    it("should handle empty search results without crashing", () => {
      const results = searchMembers(sampleMembers, "NonExistentUser123");
      expect(results).toEqual([]);
    });

    it("should reject redemption when miles balance is insufficient", () => {
      const member = sampleMembers[2];
      const reward = PORTAL_REDEEM_CATALOG.find((r) => r.id === "REWARD_FLIGHT_DXB");

      const redemption = redeemMiles(member, reward);
      expect(redemption.success).toBe(false);
      expect(redemption.error).toMatch(/insufficient miles/i);
      expect(member.milesBalance).toBe(8400);
    });

    it("should validate and reject invalid member input fields", () => {
      const invalidData = {
        name: "",
        email: "not-an-email",
        initialMiles: -500
      };

      const validation = validateMemberInput(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.name).toBeDefined();
      expect(validation.errors.email).toBeDefined();
      expect(validation.errors.initialMiles).toBeDefined();
    });

    it("should validate and reject invalid flight segment inputs", () => {
      const invalidFlight = {
        flightNumber: "",
        origin: "DELHI",
        destination: "",
        distance: 0,
        cabinClass: "InvalidClass"
      };

      const validation = validateFlightInput(invalidFlight);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.flightNumber).toBeDefined();
      expect(validation.errors.origin).toBeDefined();
      expect(validation.errors.destination).toBeDefined();
      expect(validation.errors.distance).toBeDefined();
    });
  });

  describe("3. Non-Functional Requirements (NFRs)", () => {
    it("should sanitize text inputs against XSS attacks", () => {
      const maliciousInput = "<script>alert('pwned')</script>John Doe & Associates";
      const cleaned = sanitizeInput(maliciousInput);
      expect(cleaned).not.toContain("<script>");
      expect(cleaned).not.toContain("</script>");
      expect(cleaned).toBe("&lt;script&gt;alert(&#x27;pwned&#x27;)&lt;/script&gt;John Doe &amp; Associates");
    });

    it("should output required telemetry simulation message on primary actions", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      logAnalytics("Member Search Executed", { query: "Rahul" });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Analytics] User interacted with End-to-End Frequent Flyer Portal - Member Search Executed"),
        expect.anything()
      );

      consoleSpy.mockRestore();
    });
  });
});
