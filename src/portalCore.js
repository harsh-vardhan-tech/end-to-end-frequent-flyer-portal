export const PORTAL_REDEEM_CATALOG = [
  {
    id: "REWARD_FLIGHT_DXB",
    name: "Reward Seat: DEL to DXB (Economy)",
    cost: 25000,
    category: "Flights",
    description: "Confirmed one-way reward flight ticket from Delhi (DEL) to Dubai (DXB)."
  },
  {
    id: "REWARD_UPGRADE_BIZ",
    name: "One-Way Cabin Upgrade to Business",
    cost: 15000,
    category: "Upgrades",
    description: "Complimentary space-available upgrade to Business Class on any domestic/regional route."
  },
  {
    id: "REWARD_LOUNGE_PASS",
    name: "Airport Premium Lounge Access Pass",
    cost: 4000,
    category: "Lounge",
    description: "One single-entry international departure lounge access with dining & showers."
  },
  {
    id: "REWARD_EXTRA_BAGGAGE",
    name: "20kg Excess Baggage Allowance",
    cost: 3500,
    category: "Baggage",
    description: "Pre-paid excess baggage waiver for up to 20kg on any scheduled flight."
  }
];

export function sanitizeInput(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function calculateTier(qualifyingMiles) {
  const miles = Number(qualifyingMiles) || 0;
  if (miles >= 100000) return "Platinum";
  if (miles >= 50000) return "Gold";
  if (miles >= 25000) return "Silver";
  return "Bronze";
}

export function calculateFlightMiles(distance, cabinClass) {
  const dist = Number(distance) || 0;
  const multipliers = {
    "Economy": 1.0,
    "Premium Economy": 1.25,
    "Business": 1.5,
    "First": 2.0
  };
  const mult = multipliers[cabinClass] || 1.0;
  return Math.round(dist * mult);
}

export function searchMembers(membersList, query) {
  if (!Array.isArray(membersList)) return [];
  const q = (query || "").trim().toLowerCase();
  if (!q) return membersList;

  return membersList.filter((m) => {
    const id = (m.id || "").toLowerCase();
    const name = (m.name || "").toLowerCase();
    const email = (m.email || "").toLowerCase();
    return id.includes(q) || name.includes(q) || email.includes(q);
  });
}

export function logFlightSegment(member, flightData) {
  if (!member) return { success: false, error: "Member not provided" };

  const earnedMiles = calculateFlightMiles(flightData.distance, flightData.cabinClass);
  member.milesBalance = (member.milesBalance || 0) + earnedMiles;
  member.qualifyingMiles = (member.qualifyingMiles || 0) + earnedMiles;
  member.segments = (member.segments || 0) + 1;

  const previousTier = member.tier || "Bronze";
  const newTier = calculateTier(member.qualifyingMiles);
  const tierUpgraded = newTier !== previousTier;
  member.tier = newTier;

  if (!Array.isArray(member.flights)) {
    member.flights = [];
  }

  const segment = {
    id: "SEG-" + Math.floor(100000 + Math.random() * 900000),
    flightNumber: sanitizeInput(flightData.flightNumber),
    origin: sanitizeInput(flightData.origin).toUpperCase(),
    destination: sanitizeInput(flightData.destination).toUpperCase(),
    distance: Number(flightData.distance) || 0,
    cabinClass: flightData.cabinClass,
    earnedMiles: earnedMiles,
    loggedAt: new Date().toISOString()
  };

  member.flights.unshift(segment);

  logAnalytics("Flight Segment Logged", {
    memberId: member.id,
    flightNumber: segment.flightNumber,
    earnedMiles,
    newTier
  });

  return {
    success: true,
    earnedMiles,
    newBalance: member.milesBalance,
    tierUpgraded,
    newTier
  };
}

export function redeemMiles(member, reward) {
  if (!member || !reward) {
    return { success: false, error: "Invalid member or reward item" };
  }

  const cost = Number(reward.cost) || 0;
  if ((member.milesBalance || 0) < cost) {
    return {
      success: false,
      error: "Insufficient miles balance. Required: " + cost + ", Available: " + (member.milesBalance || 0)
    };
  }

  member.milesBalance -= cost;

  const voucherCode = "VCH-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  const redemptionRecord = {
    id: "RED-" + Date.now(),
    rewardId: reward.id,
    rewardName: reward.name,
    cost: cost,
    voucherCode: voucherCode,
    redeemedAt: new Date().toISOString()
  };

  if (!Array.isArray(member.redemptions)) {
    member.redemptions = [];
  }
  member.redemptions.unshift(redemptionRecord);

  logAnalytics("Miles Redeemed", {
    memberId: member.id,
    rewardId: reward.id,
    cost,
    remainingBalance: member.milesBalance
  });

  return {
    success: true,
    voucherCode,
    remainingMiles: member.milesBalance
  };
}

export function validateMemberInput(data) {
  const errors = {};
  const name = (data.name || "").trim();
  const email = (data.email || "").trim();
  const miles = data.initialMiles !== undefined ? Number(data.initialMiles) : 0;

  if (!name || name.length < 2) {
    errors.name = "Member full name must be at least 2 characters long.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.email = "Please enter a valid corporate or personal email address.";
  }

  if (isNaN(miles) || miles < 0) {
    errors.initialMiles = "Initial miles cannot be negative.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateFlightInput(data) {
  const errors = {};
  const flightNumber = (data.flightNumber || "").trim();
  const origin = (data.origin || "").trim().toUpperCase();
  const destination = (data.destination || "").trim().toUpperCase();
  const distance = Number(data.distance);
  const cabinClass = data.cabinClass;

  if (!flightNumber || flightNumber.length < 3) {
    errors.flightNumber = "Flight number is required (e.g., AI-101).";
  }

  if (!origin || origin.length !== 3) {
    errors.origin = "Origin must be a 3-letter IATA airport code (e.g., DEL).";
  }

  if (!destination || destination.length !== 3) {
    errors.destination = "Destination must be a 3-letter IATA airport code (e.g., JFK).";
  } else if (origin && origin === destination) {
    errors.destination = "Destination airport cannot be the same as origin.";
  }

  if (isNaN(distance) || distance <= 0) {
    errors.distance = "Flight distance in nautical miles must be greater than 0.";
  }

  const validClasses = ["Economy", "Premium Economy", "Business", "First"];
  if (!validClasses.includes(cabinClass)) {
    errors.cabinClass = "Please select a valid cabin class.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function logAnalytics(action, details = {}) {
  const logMessage = `[Analytics] User interacted with End-to-End Frequent Flyer Portal - ${action}`;
  console.log(logMessage, details);
  return logMessage;
}
