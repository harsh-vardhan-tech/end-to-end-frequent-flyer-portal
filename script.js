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
} from "./src/portalCore.js";

const DEFAULT_MEMBERS = [
  {
    id: "FF-10492",
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    tier: "Gold",
    milesBalance: 68500,
    qualifyingMiles: 52000,
    segments: 18,
    status: "Active",
    joinedDate: "15 Jan 2024",
    flights: [
      {
        id: "SEG-901234",
        flightNumber: "AI-101",
        origin: "DEL",
        destination: "JFK",
        distance: 7300,
        cabinClass: "Business",
        earnedMiles: 10950,
        loggedAt: "2026-10-18T08:30:00Z"
      },
      {
        id: "SEG-812736",
        flightNumber: "AI-144",
        origin: "BOM",
        destination: "EWR",
        distance: 7800,
        cabinClass: "Economy",
        earnedMiles: 7800,
        loggedAt: "2026-09-22T14:15:00Z"
      }
    ],
    redemptions: [
      {
        id: "RED-1729000000000",
        rewardId: "REWARD_LOUNGE_PASS",
        rewardName: "Airport Premium Lounge Access Pass",
        cost: 4000,
        voucherCode: "VCH-LN7829",
        redeemedAt: "2026-10-10T12:00:00Z"
      }
    ]
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
    joinedDate: "04 May 2024",
    flights: [
      {
        id: "SEG-723145",
        flightNumber: "AI-312",
        origin: "DEL",
        destination: "LHR",
        distance: 4180,
        cabinClass: "Business",
        earnedMiles: 6270,
        loggedAt: "2026-10-02T16:20:00Z"
      }
    ],
    redemptions: []
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
    joinedDate: "12 Aug 2026",
    flights: [],
    redemptions: []
  },
  {
    id: "FF-40998",
    name: "Priya Nair",
    email: "priya.nair@corporate.com",
    tier: "Platinum",
    milesBalance: 145000,
    qualifyingMiles: 112000,
    segments: 32,
    status: "Active",
    joinedDate: "20 Nov 2023",
    flights: [
      {
        id: "SEG-512903",
        flightNumber: "AI-127",
        origin: "DEL",
        destination: "ORD",
        distance: 7480,
        cabinClass: "First",
        earnedMiles: 14960,
        loggedAt: "2026-10-15T11:00:00Z"
      }
    ],
    redemptions: [
      {
        id: "RED-1728000000000",
        rewardId: "REWARD_FLIGHT_DXB",
        rewardName: "Reward Seat: DEL to DXB (Economy)",
        cost: 25000,
        voucherCode: "VCH-DX1044",
        redeemedAt: "2026-09-28T09:10:00Z"
      }
    ]
  },
  {
    id: "FF-50221",
    name: "Kabir Mehta",
    email: "kabir.mehta@traveler.org",
    tier: "Bronze",
    milesBalance: 1200,
    qualifyingMiles: 1200,
    segments: 1,
    status: "Active",
    joinedDate: "01 Oct 2026",
    flights: [
      {
        id: "SEG-341908",
        flightNumber: "AI-805",
        origin: "BOM",
        destination: "BLR",
        distance: 520,
        cabinClass: "Economy",
        earnedMiles: 520,
        loggedAt: "2026-10-05T07:15:00Z"
      }
    ],
    redemptions: []
  }
];

const STORAGE_KEY = "aerofleet_frequent_flyer_members_v1";

let members = [];
let selectedMemberId = null;
let activeTierFilter = "ALL";
let activeModalTrigger = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      members = JSON.parse(raw);
    } else {
      members = JSON.parse(JSON.stringify(DEFAULT_MEMBERS));
      saveState();
    }
  } catch (e) {
    members = JSON.parse(JSON.stringify(DEFAULT_MEMBERS));
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch (e) {
    console.error("Failed to save state to localStorage", e);
  }
  updateGlobalMetrics();
}

const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeToggleIcon = document.getElementById("themeToggleIcon");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navCenter = document.querySelector(".nav-center");

const metricTotalMembers = document.getElementById("metricTotalMembers");
const metricTierUpgrades = document.getElementById("metricTierUpgrades");
const metricFlightsLogged = document.getElementById("metricFlightsLogged");
const metricTotalMiles = document.getElementById("metricTotalMiles");

const memberSearchInput = document.getElementById("memberSearchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const memberCountBadge = document.getElementById("memberCountBadge");
const membersListContainer = document.getElementById("membersListContainer");
const sidebarEmptyState = document.getElementById("sidebarEmptyState");
const sidebarLoading = document.getElementById("sidebarLoading");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const tierPillButtons = document.querySelectorAll(".tier-pill");

const noMemberSelectedView = document.getElementById("noMemberSelectedView");
const memberDashboardView = document.getElementById("memberDashboardView");

const tierAvatarWrap = document.getElementById("tierAvatarWrap");
const tierInitial = document.getElementById("tierInitial");
const viewMemberName = document.getElementById("viewMemberName");
const viewMemberId = document.getElementById("viewMemberId");
const viewMemberEmail = document.getElementById("viewMemberEmail");
const viewMemberJoined = document.getElementById("viewMemberJoined");
const viewMemberTierBadge = document.getElementById("viewMemberTierBadge");
const viewMemberTierName = document.getElementById("viewMemberTierName");

const viewMilesBalance = document.getElementById("viewMilesBalance");
const viewQualifyingMiles = document.getElementById("viewQualifyingMiles");
const viewSegmentsCount = document.getElementById("viewSegmentsCount");
const tierProgressBar = document.getElementById("tierProgressBar");
const tierProgressFill = document.getElementById("tierProgressFill");
const viewTierRequirementHint = document.getElementById("viewTierRequirementHint");

const tabFlightsBtn = document.getElementById("tabFlightsBtn");
const tabRedeemBtn = document.getElementById("tabRedeemBtn");
const tabHistoryBtn = document.getElementById("tabHistoryBtn");
const flightsTabPanel = document.getElementById("flightsTabPanel");
const redeemTabPanel = document.getElementById("redeemTabPanel");
const historyTabPanel = document.getElementById("historyTabPanel");
const tabFlightCount = document.getElementById("tabFlightCount");
const tabRedemptionCount = document.getElementById("tabRedemptionCount");

const flightsTableBody = document.getElementById("flightsTableBody");
const flightsEmptyState = document.getElementById("flightsEmptyState");
const openLogFlightModalBtn = document.getElementById("openLogFlightModalBtn");

const redeemAvailableMiles = document.getElementById("redeemAvailableMiles");
const rewardCatalogGrid = document.getElementById("rewardCatalogGrid");
const redemptionsTableBody = document.getElementById("redemptionsTableBody");
const redemptionsEmptyState = document.getElementById("redemptionsEmptyState");

const modalNewMember = document.getElementById("modalNewMember");
const openNewMemberModalBtn = document.getElementById("openNewMemberModalBtn");
const closeNewMemberModalBtn = document.getElementById("closeNewMemberModalBtn");
const cancelNewMemberBtn = document.getElementById("cancelNewMemberBtn");
const newMemberForm = document.getElementById("newMemberForm");
const newMemberName = document.getElementById("newMemberName");
const newMemberEmail = document.getElementById("newMemberEmail");
const newMemberMiles = document.getElementById("newMemberMiles");
const newMemberTier = document.getElementById("newMemberTier");

const modalLogFlight = document.getElementById("modalLogFlight");
const closeLogFlightModalBtn = document.getElementById("closeLogFlightModalBtn");
const cancelLogFlightBtn = document.getElementById("cancelLogFlightBtn");
const logFlightForm = document.getElementById("logFlightForm");
const flightNumberInput = document.getElementById("flightNumberInput");
const flightOriginInput = document.getElementById("flightOriginInput");
const flightDestInput = document.getElementById("flightDestInput");
const flightDistanceInput = document.getElementById("flightDistanceInput");
const flightClassInput = document.getElementById("flightClassInput");
const previewCalculatedMiles = document.getElementById("previewCalculatedMiles");

const toastNotification = document.getElementById("toastNotification");
const toastIcon = document.getElementById("toastIcon");
const toastMessage = document.getElementById("toastMessage");

let toastTimer = null;
function showToast(message, type = "success") {
  if (toastTimer) clearTimeout(toastTimer);
  toastMessage.textContent = message;
  toastNotification.className = "toast toast-" + type;

  if (type === "success") {
    toastIcon.className = "fa-solid fa-circle-check";
  } else if (type === "error") {
    toastIcon.className = "fa-solid fa-triangle-exclamation";
  } else {
    toastIcon.className = "fa-solid fa-circle-info";
  }

  toastNotification.classList.remove("hidden");
  toastTimer = setTimeout(() => {
    toastNotification.classList.add("hidden");
  }, 3500);
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    if (themeToggleIcon) themeToggleIcon.className = "fa-solid fa-sun";
  } else {
    document.documentElement.removeAttribute("data-theme");
    if (themeToggleIcon) themeToggleIcon.className = "fa-solid fa-moon";
  }
  localStorage.setItem("aerofleet_theme", theme);
}

const savedTheme = localStorage.getItem("aerofleet_theme") || "light";
applyTheme(savedTheme);

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const nextTheme = isDark ? "light" : "dark";
    applyTheme(nextTheme);
    logAnalytics("Theme Toggled", { theme: nextTheme });
  });
}

if (mobileMenuBtn && navCenter) {
  mobileMenuBtn.addEventListener("click", () => {
    const isOpen = navCenter.classList.toggle("mobile-open");
    mobileMenuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}

function updateGlobalMetrics() {
  const total = members.length;
  let flightsCount = 0;
  let totalMiles = 0;
  let goldOrPlatinumCount = 0;

  members.forEach((m) => {
    flightsCount += Array.isArray(m.flights) ? m.flights.length : 0;
    totalMiles += Number(m.milesBalance) || 0;
    if (m.tier === "Gold" || m.tier === "Platinum") {
      goldOrPlatinumCount++;
    }
  });

  metricTotalMembers.textContent = total.toLocaleString();
  metricTierUpgrades.textContent = goldOrPlatinumCount.toLocaleString();
  metricFlightsLogged.textContent = flightsCount.toLocaleString();
  metricTotalMiles.textContent = totalMiles.toLocaleString();
}

async function simulateNetworkDelay(ms = 300) {
  if (sidebarLoading) {
    sidebarLoading.classList.remove("hidden");
    await new Promise((resolve) => setTimeout(resolve, ms));
    sidebarLoading.classList.add("hidden");
  }
}

function formatNumber(num) {
  return Number(num || 0).toLocaleString();
}

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const day = d.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const m = months[d.getMonth()];
  const y = d.getFullYear();
  return `${day} ${m} ${y}`;
}

function renderMembersList() {
  const query = memberSearchInput.value.trim();
  let filtered = searchMembers(members, query);

  if (activeTierFilter !== "ALL") {
    filtered = filtered.filter((m) => m.tier.toUpperCase() === activeTierFilter.toUpperCase());
  }

  memberCountBadge.textContent = filtered.length;
  membersListContainer.innerHTML = "";

  if (filtered.length === 0) {
    sidebarEmptyState.classList.remove("hidden");
    return;
  }

  sidebarEmptyState.classList.add("hidden");

  filtered.forEach((m) => {
    const itemBtn = document.createElement("button");
    itemBtn.type = "button";
    itemBtn.className = "member-item-btn" + (m.id === selectedMemberId ? " selected" : "");
    itemBtn.setAttribute("data-id", m.id);
    itemBtn.setAttribute("aria-label", `${m.name}, Member ID ${m.id}, Tier ${m.tier}, ${formatNumber(m.milesBalance)} miles`);

    const meta = document.createElement("div");
    meta.className = "member-card-meta";
    meta.innerHTML = `
      <span class="member-item-name">${m.name}</span>
      <span class="member-item-sub">${m.id} &bull; ${m.email}</span>
    `;

    const right = document.createElement("div");
    right.className = "member-card-right";
    right.innerHTML = `
      <span class="tier-badge tier-${m.tier.toLowerCase()}">${m.tier}</span>
      <span class="miles-pill">${formatNumber(m.milesBalance)} mi</span>
    `;

    itemBtn.appendChild(meta);
    itemBtn.appendChild(right);

    itemBtn.addEventListener("click", () => {
      selectMember(m.id);
      if (window.innerWidth < 1024) {
        memberDashboardView.scrollIntoView({ behavior: "smooth" });
      }
    });

    membersListContainer.appendChild(itemBtn);
  });
}

async function selectMember(id) {
  await simulateNetworkDelay(250);
  selectedMemberId = id;
  const member = members.find((m) => m.id === id);

  if (!member) {
    noMemberSelectedView.classList.remove("hidden");
    memberDashboardView.classList.add("hidden");
    renderMembersList();
    return;
  }

  logAnalytics("Member Selected", { memberId: member.id, name: member.name });

  noMemberSelectedView.classList.add("hidden");
  memberDashboardView.classList.remove("hidden");

  viewMemberName.textContent = member.name;
  viewMemberId.textContent = member.id;
  viewMemberEmail.textContent = member.email;
  viewMemberJoined.textContent = `Member Since: ${member.joinedDate || "Jan 2024"}`;

  tierInitial.textContent = member.name.charAt(0).toUpperCase();

  viewMemberTierName.textContent = member.tier;
  viewMemberTierBadge.className = `tier-badge tier-${member.tier.toLowerCase()}`;

  viewMilesBalance.textContent = formatNumber(member.milesBalance);
  viewQualifyingMiles.textContent = formatNumber(member.qualifyingMiles);
  viewSegmentsCount.textContent = (member.flights ? member.flights.length : 0);

  updateTierProgress(member);

  tabFlightCount.textContent = (member.flights ? member.flights.length : 0);
  tabRedemptionCount.textContent = (member.redemptions ? member.redemptions.length : 0);
  redeemAvailableMiles.textContent = formatNumber(member.milesBalance);

  renderFlightHistory(member);
  renderRewardsCatalog(member);
  renderRedemptionsLog(member);

  renderMembersList();
}

function updateTierProgress(member) {
  const qMiles = Number(member.qualifyingMiles) || 0;
  let target = 25000;
  let nextTier = "Silver";
  let percent = 0;

  if (member.tier === "Bronze") {
    target = 25000;
    nextTier = "Silver";
    percent = Math.min(100, Math.round((qMiles / target) * 100));
    viewTierRequirementHint.textContent = `${formatNumber(target - qMiles)} Q-Miles needed for ${nextTier}`;
  } else if (member.tier === "Silver") {
    target = 50000;
    nextTier = "Gold";
    const delta = qMiles - 25000;
    percent = Math.min(100, Math.max(0, Math.round((delta / 25000) * 100)));
    viewTierRequirementHint.textContent = `${formatNumber(target - qMiles)} Q-Miles needed for ${nextTier}`;
  } else if (member.tier === "Gold") {
    target = 100000;
    nextTier = "Platinum";
    const delta = qMiles - 50000;
    percent = Math.min(100, Math.max(0, Math.round((delta / 50000) * 100)));
    viewTierRequirementHint.textContent = `${formatNumber(target - qMiles)} Q-Miles needed for ${nextTier}`;
  } else {
    percent = 100;
    viewTierRequirementHint.textContent = "Top Tier Achieved (Platinum Elite Status)";
  }

  tierProgressBar.setAttribute("aria-valuenow", percent);
  tierProgressFill.style.width = percent + "%";
}

function renderFlightHistory(member) {
  flightsTableBody.innerHTML = "";
  const flights = member.flights || [];

  if (flights.length === 0) {
    flightsEmptyState.classList.remove("hidden");
    return;
  }

  flightsEmptyState.classList.add("hidden");

  flights.forEach((f) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="table-mono">${f.flightNumber}</td>
      <td><strong>${f.origin}</strong> &rarr; <strong>${f.destination}</strong></td>
      <td class="table-mono">${formatNumber(f.distance)} nm</td>
      <td><span class="badge-count">${f.cabinClass}</span></td>
      <td><span class="miles-earned-badge">+${formatNumber(f.earnedMiles)}</span></td>
      <td>${formatDate(f.loggedAt)}</td>
    `;
    flightsTableBody.appendChild(tr);
  });
}

function renderRewardsCatalog(member) {
  rewardCatalogGrid.innerHTML = "";
  const balance = Number(member.milesBalance) || 0;

  PORTAL_REDEEM_CATALOG.forEach((reward) => {
    const card = document.createElement("div");
    card.className = "reward-card";

    const canAfford = balance >= reward.cost;

    card.innerHTML = `
      <div>
        <div class="reward-header">
          <span class="reward-cat-tag">${reward.category}</span>
        </div>
        <h4 class="reward-name">${reward.name}</h4>
        <p class="reward-desc">${reward.description}</p>
      </div>
      <div class="reward-footer">
        <div>
          <span class="reward-cost">${formatNumber(reward.cost)}</span>
          <span class="reward-cost-unit">Miles</span>
        </div>
        <button 
          type="button" 
          class="btn-redeem" 
          data-reward-id="${reward.id}" 
          ${canAfford ? "" : "disabled"} 
          title="${canAfford ? "Redeem this reward" : "Insufficient miles"}"
          aria-label="Redeem ${reward.name} for ${formatNumber(reward.cost)} miles"
        >
          ${canAfford ? "Redeem Reward" : "Short " + formatNumber(reward.cost - balance) + " mi"}
        </button>
      </div>
    `;

    const redeemBtn = card.querySelector(".btn-redeem");
    if (canAfford) {
      redeemBtn.addEventListener("click", () => handleRedeemReward(member, reward));
    }

    rewardCatalogGrid.appendChild(card);
  });
}

async function handleRedeemReward(member, reward) {
  if (!navigator.onLine) {
    showToast("Network Offline: Redemptions cannot be processed in offline mode.", "error");
    return;
  }

  await simulateNetworkDelay(300);

  const res = redeemMiles(member, reward);
  if (!res.success) {
    showToast(res.error, "error");
    return;
  }

  saveState();
  selectMember(member.id);
  showToast(`Voucher ${res.voucherCode} issued! Deducted ${formatNumber(reward.cost)} miles.`, "success");
}

function renderRedemptionsLog(member) {
  redemptionsTableBody.innerHTML = "";
  const list = member.redemptions || [];

  if (list.length === 0) {
    redemptionsEmptyState.classList.remove("hidden");
    return;
  }

  redemptionsEmptyState.classList.add("hidden");

  list.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="table-mono">${r.voucherCode}</td>
      <td><strong>${r.rewardName}</strong></td>
      <td><span class="miles-debited-badge">-${formatNumber(r.cost)}</span></td>
      <td>${formatDate(r.redeemedAt)}</td>
      <td><span class="status-pill active-pill">Issued</span></td>
    `;
    redemptionsTableBody.appendChild(tr);
  });
}

function updateTopNavActive(activeNav) {
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.getAttribute("data-nav") === activeNav);
  });
}

function switchTab(target) {
  [tabFlightsBtn, tabRedeemBtn, tabHistoryBtn].forEach((btn) => {
    btn.classList.remove("active");
    btn.setAttribute("aria-selected", "false");
  });

  [flightsTabPanel, redeemTabPanel, historyTabPanel].forEach((p) => {
    p.classList.add("hidden");
  });

  if (target === "flights") {
    tabFlightsBtn.classList.add("active");
    tabFlightsBtn.setAttribute("aria-selected", "true");
    flightsTabPanel.classList.remove("hidden");
    updateTopNavActive("flights");
  } else if (target === "redeem") {
    tabRedeemBtn.classList.add("active");
    tabRedeemBtn.setAttribute("aria-selected", "true");
    redeemTabPanel.classList.remove("hidden");
    updateTopNavActive("rewards");
  } else if (target === "history") {
    tabHistoryBtn.classList.add("active");
    tabHistoryBtn.setAttribute("aria-selected", "true");
    historyTabPanel.classList.remove("hidden");
  }

  logAnalytics("Tab Switched", { targetTab: target });
}

tabFlightsBtn.addEventListener("click", () => switchTab("flights"));
tabRedeemBtn.addEventListener("click", () => switchTab("redeem"));
tabHistoryBtn.addEventListener("click", () => switchTab("history"));

const navTabs = document.querySelectorAll(".nav-tab");
navTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const navTarget = tab.getAttribute("data-nav");
    updateTopNavActive(navTarget);

    if (navCenter && navCenter.classList.contains("mobile-open")) {
      navCenter.classList.remove("mobile-open");
      if (mobileMenuBtn) mobileMenuBtn.setAttribute("aria-expanded", "false");
    }

    if (navTarget === "dashboard") {
      if (selectedMemberId) {
        selectMember(selectedMemberId);
        switchTab("flights");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (navTarget === "members") {
      memberSearchInput.focus();
      const sidebar = document.getElementById("sidebarContainer");
      if (sidebar) sidebar.scrollIntoView({ behavior: "smooth" });
    } else if (navTarget === "flights") {
      switchTab("flights");
      if (window.innerWidth < 1024) {
        memberDashboardView.scrollIntoView({ behavior: "smooth" });
      }
    } else if (navTarget === "rewards") {
      switchTab("redeem");
      if (window.innerWidth < 1024) {
        memberDashboardView.scrollIntoView({ behavior: "smooth" });
      }
    }
    logAnalytics("Navigation Clicked", { section: navTarget });
  });
});

function openModal(modal, triggerBtn) {
  activeModalTrigger = triggerBtn;
  document.body.classList.add("modal-open");
  modal.classList.remove("hidden");
  const firstInput = modal.querySelector("input, select, button");
  if (firstInput) firstInput.focus();
}

function closeModal(modal) {
  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  if (activeModalTrigger) {
    activeModalTrigger.focus();
    activeModalTrigger = null;
  }
}

[modalNewMember, modalLogFlight].forEach((m) => {
  m.addEventListener("click", (e) => {
    if (e.target === m) {
      closeModal(m);
    }
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!modalNewMember.classList.contains("hidden")) closeModal(modalNewMember);
    if (!modalLogFlight.classList.contains("hidden")) closeModal(modalLogFlight);
  }
});

openNewMemberModalBtn.addEventListener("click", () => {
  newMemberForm.reset();
  clearFieldErrors(newMemberForm);
  openModal(modalNewMember, openNewMemberModalBtn);
});

closeNewMemberModalBtn.addEventListener("click", () => closeModal(modalNewMember));
cancelNewMemberBtn.addEventListener("click", () => closeModal(modalNewMember));

openLogFlightModalBtn.addEventListener("click", () => {
  logFlightForm.reset();
  clearFieldErrors(logFlightForm);
  flightClassInput.value = "Business";
  updateCalcPreview();
  openModal(modalLogFlight, openLogFlightModalBtn);
});

closeLogFlightModalBtn.addEventListener("click", () => closeModal(modalLogFlight));
cancelLogFlightBtn.addEventListener("click", () => closeModal(modalLogFlight));

function clearFieldErrors(form) {
  form.querySelectorAll(".form-input").forEach((input) => {
    input.classList.remove("is-invalid");
    input.removeAttribute("aria-invalid");
  });
  form.querySelectorAll(".field-err").forEach((span) => {
    span.textContent = "";
  });
}

function setFieldError(fieldId, errorSpanId, message) {
  const field = document.getElementById(fieldId);
  const span = document.getElementById(errorSpanId);
  if (field) {
    field.classList.add("is-invalid");
    field.setAttribute("aria-invalid", "true");
  }
  if (span) {
    span.textContent = message;
  }
}

[newMemberName, newMemberEmail, newMemberMiles].forEach((input) => {
  input.addEventListener("input", () => {
    input.classList.remove("is-invalid");
    input.removeAttribute("aria-invalid");
    const errSpan = input.parentElement.querySelector(".field-err");
    if (errSpan) errSpan.textContent = "";
  });
});

[flightNumberInput, flightOriginInput, flightDestInput, flightDistanceInput, flightClassInput].forEach((input) => {
  input.addEventListener("input", () => {
    input.classList.remove("is-invalid");
    input.removeAttribute("aria-invalid");
    const errSpan = input.parentElement.querySelector(".field-err");
    if (errSpan) errSpan.textContent = "";
  });
});

newMemberForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearFieldErrors(newMemberForm);

  const rawData = {
    name: newMemberName.value,
    email: newMemberEmail.value,
    initialMiles: newMemberMiles.value
  };

  const validation = validateMemberInput(rawData);
  if (!validation.isValid) {
    if (validation.errors.name) setFieldError("newMemberName", "errorNewMemberName", validation.errors.name);
    if (validation.errors.email) setFieldError("newMemberEmail", "errorNewMemberEmail", validation.errors.email);
    if (validation.errors.initialMiles) setFieldError("newMemberMiles", "errorNewMemberMiles", validation.errors.initialMiles);
    return;
  }

  await simulateNetworkDelay(300);

  const newId = "FF-" + Math.floor(10000 + Math.random() * 90000);
  const cleanName = sanitizeInput(rawData.name.trim());
  const cleanEmail = sanitizeInput(rawData.email.trim());
  const miles = Number(rawData.initialMiles) || 0;
  const tier = newMemberTier.value;

  const newMemberObj = {
    id: newId,
    name: cleanName,
    email: cleanEmail,
    tier: tier,
    milesBalance: miles,
    qualifyingMiles: miles,
    segments: 0,
    status: "Active",
    joinedDate: formatDate(new Date().toISOString()),
    flights: [],
    redemptions: []
  };

  members.unshift(newMemberObj);
  saveState();
  closeModal(modalNewMember);
  selectMember(newId);
  showToast(`Member ${cleanName} (${newId}) registered successfully!`, "success");
});

function updateCalcPreview() {
  const dist = Number(flightDistanceInput.value) || 0;
  const cabin = flightClassInput.value;
  const calc = calculateFlightMiles(dist, cabin);
  previewCalculatedMiles.textContent = formatNumber(calc);
}

flightDistanceInput.addEventListener("input", updateCalcPreview);
flightClassInput.addEventListener("change", updateCalcPreview);

logFlightForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearFieldErrors(logFlightForm);

  const currentMember = members.find((m) => m.id === selectedMemberId);
  if (!currentMember) {
    showToast("Please select a frequent flyer member first.", "error");
    return;
  }

  const rawFlight = {
    flightNumber: flightNumberInput.value,
    origin: flightOriginInput.value,
    destination: flightDestInput.value,
    distance: flightDistanceInput.value,
    cabinClass: flightClassInput.value
  };

  const validation = validateFlightInput(rawFlight);
  if (!validation.isValid) {
    if (validation.errors.flightNumber) setFieldError("flightNumberInput", "errorFlightNumber", validation.errors.flightNumber);
    if (validation.errors.origin) setFieldError("flightOriginInput", "errorFlightOrigin", validation.errors.origin);
    if (validation.errors.destination) setFieldError("flightDestInput", "errorFlightDest", validation.errors.destination);
    if (validation.errors.distance) setFieldError("flightDistanceInput", "errorFlightDistance", validation.errors.distance);
    if (validation.errors.cabinClass) setFieldError("flightClassInput", "errorFlightClass", validation.errors.cabinClass);
    return;
  }

  await simulateNetworkDelay(300);

  const res = logFlightSegment(currentMember, rawFlight);
  saveState();
  closeModal(modalLogFlight);
  selectMember(currentMember.id);

  if (res.tierUpgraded) {
    showToast(`Flight logged! Tier Upgraded to ${res.newTier} (+${formatNumber(res.earnedMiles)} miles)!`, "success");
  } else {
    showToast(`Flight logged! Credited +${formatNumber(res.earnedMiles)} miles to account.`, "success");
  }
});

let searchDebounceTimer = null;
memberSearchInput.addEventListener("input", () => {
  clearSearchBtn.classList.toggle("hidden", !memberSearchInput.value);
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    renderMembersList();
    logAnalytics("Search Input Changed", { query: memberSearchInput.value });
  }, 150);
});

clearSearchBtn.addEventListener("click", () => {
  memberSearchInput.value = "";
  clearSearchBtn.classList.add("hidden");
  renderMembersList();
  memberSearchInput.focus();
});

resetFiltersBtn.addEventListener("click", () => {
  memberSearchInput.value = "";
  clearSearchBtn.classList.add("hidden");
  activeTierFilter = "ALL";
  tierPillButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-tier") === "ALL");
    btn.setAttribute("aria-checked", btn.getAttribute("data-tier") === "ALL");
  });
  renderMembersList();
});

tierPillButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tierPillButtons.forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-checked", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-checked", "true");
    activeTierFilter = btn.getAttribute("data-tier");
    renderMembersList();
    logAnalytics("Tier Filter Changed", { tier: activeTierFilter });
  });
});

window.addEventListener("offline", () => {
  showToast("Network Offline: Operating in offline mode.", "error");
});

window.addEventListener("online", () => {
  showToast("Network Connected: Back online.", "success");
});

function init() {
  loadState();
  updateGlobalMetrics();
  renderMembersList();

  if (members.length > 0) {
    selectMember(members[0].id);
  }

  logAnalytics("Portal Initialized", { totalMembers: members.length });
}

window.addEventListener("DOMContentLoaded", init);
