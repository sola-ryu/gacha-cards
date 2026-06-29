// ========== STATE ==========
let state = loadState();

// Animation speed multiplier (1=slowest, 5=fastest)
const ANIM_SPEED_LABELS = ['Very Slow', 'Slow', 'Normal', 'Fast', 'Instant'];
let animSpeed = 3; // default normal

function animDuration(baseMs) {
  const factors = [4, 2.5, 1, 0.5, 0]; // speed 1-5 maps to multiplier
  return Math.max(baseMs * factors[animSpeed - 1], 0);
}

function defaultState() {
  return {
    gems: 200,
    collection: {},    // { cardId: count }
    totalPulls: 0,
    totalCards: 0,
    pity: {           // per-pack pity counters
      basic: { rare: 0, epic: 0, legendary: 0 },
      premium: { rare: 0, epic: 0, legendary: 0 },
      legendary: { rare: 0, epic: 0, legendary: 0 },
    }
    lastFreeGems: 0,  // timestamp of last free gems
    autoReveal: false,
    pullHistory: [],   // [{ cardId, name, rarity, emoji, time }]
    freePullCooldown: 0,   // timestamp when cooldown ends
    freePullsToday: 0,     // count of free pulls today
    freePullDate: null,    // date string of last reset
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem("gacha_state");
    if (saved) {
      const loaded = JSON.parse(saved);
      const today = new Date().toISOString().slice(0, 10);
      // Reset daily counters at midnight
      if (loaded.freePullDate !== today) {
        loaded.freePullsToday = 0;
        loaded.freePullDate = today;
        loaded.freePullCooldown = 0;
      }
      // Migrate old pity format to per-pack
      if (!loaded.pity || !loaded.pity.basic) {
        loaded.pity = { basic: { rare: loaded.pityRare || 0, epic: loaded.pityEpic || 0, legendary: loaded.pityLegendary || 0 }, premium: { rare: 0, epic: 0, legendary: 0 }, legendary: { rare: 0, epic: 0, legendary: 0 } };
      }
      return { ...defaultState(), ...loaded };
    }
  } catch {}
  const today = new Date().toISOString().slice(0, 10);
  const fresh = defaultState();
  fresh.freePullDate = today;
  return fresh;
}

function saveState() {
  localStorage.setItem("gacha_state", JSON.stringify(state));
}

// ========== PULL LOGIC ==========
function pull(packId, count) {
  const pack = PACKS[packId];
  if (!pack) return;

  // Check cost
  const totalCost = pack.cost * count;
  if (state.gems < totalCost) {
    shakeElement(document.querySelector(`[data-pack="${packId}"] .btn-pull`));
    return;
  }

  // Free pack cooldown & daily cap check
  if (packId === "basic") {
    const now = Date.now();
    // Check cooldown
    if (state.freePullCooldown > now) {
      const remaining = Math.ceil((state.freePullCooldown - now) / 1000);
      alert(`Please wait ${remaining}s between free pulls.`);
      return;
    }
    // Check daily limit
    if (state.freePullsToday >= 10) {
      alert("You've reached the daily limit of 10 free pulls. Come back tomorrow!");
      return;
    }
  }

  state.gems -= totalCost;

  // Generate cards
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(doPull(pack, packId));
  }

  // Track free pull cooldown & daily count
  if (packId === "basic") {
    state.freePullCooldown = Date.now() + 3000; // 3s cooldown
    state.freePullsToday++;
    const today = new Date().toISOString().slice(0, 10);
    state.freePullDate = today;
  }

  // Apply gem reward for paid packs
  if (pack.gemReward && packId !== "basic") {
    state.gems += pack.gemReward * count;
  }

  saveState();
  updateStats();

  // Show pack opening animation then reveal
  showPackOpening(results, packId);
}

function doPull(pack, packId) {
  let remaining = 100;
  let selectedRarity = null;

  const pity = state.pity[packId];
  // Pity thresholds per pack
  const PITY_LEGENDARY = 100;
  const PITY_EPIC = 50;
  const PITY_RARE = 25;

  for (const rarity of RARITY_ORDER) {
    const rate = pack.rates[rarity] || 0;
    if (rate > 0 && rate <= remaining) {
      selectedRarity = rarity;
      break;
    }
    remaining -= rate;
  }

  // If no rarity matched, default to highest available
  if (!selectedRarity) {
    for (let i = RARITY_ORDER.length - 1; i >= 0; i--) {
      if (pack.rates[RARITY_ORDER[i]] > 0) {
        selectedRarity = RARITY_ORDER[i];
        break;
      }
    }
  }

  // Pity override at threshold
  if (pity.legendary >= PITY_LEGENDARY && pack.rates.legendary) {
    selectedRarity = "legendary";
  } else if (pity.epic >= PITY_EPIC && selectedRarity !== "legendary" && pack.rates.epic) {
    selectedRarity = "epic";
  } else if (pity.rare >= PITY_RARE && RARITY_ORDER.indexOf(selectedRarity) < RARITY_ORDER.indexOf("rare") && pack.rates.rare) {
    selectedRarity = "rare";
  }

  const card = getCard(selectedRarity);

  // Update pity counters for this pack
  state.totalPulls++;
  if (selectedRarity === "legendary") {
    pity.legendary = 0;
    pity.epic = 0;
    pity.rare = 0;
  } else if (selectedRarity === "epic") {
    pity.epic = 0;
    pity.rare = 0;
    pity.legendary++;
  } else if (selectedRarity === "rare") {
    pity.rare = 0;
    pity.epic++;
    pity.legendary++;
  } else {
    pity.rare++;
    pity.epic++;
    pity.legendary++;
  }

  return card;
}

function getCard(rarity) {
  const pool = CARD_DB.filter(c => c.rarity === rarity);
  const card = pool[Math.floor(Math.random() * pool.length)];
  state.collection[card.id] = (state.collection[card.id] || 0) + 1;
  state.totalCards++;
  return { ...card };
}

// ========== PACK OPENING ANIMATION ==========
function hasLegendary(cards) {
  return cards.some(c => c.rarity === "legendary");
}

function hasEpic(cards) {
  return cards.some(c => c.rarity === "epic");
}

function showPackOpening(cards, packId) {
  const overlay = document.getElementById("pack-overlay");
  const packClosed = document.getElementById("pack-closed");
  const packAnim = document.getElementById("pack-opening-anim");
  const particles = document.getElementById("particles");

  // Reset
  packClosed.classList.remove("hidden");
  packAnim.classList.add("hidden"); // keep hidden until user clicks
  particles.innerHTML = "";
  overlay.classList.remove("hidden");

  const isLegendary = hasLegendary(cards);
  const isEpic = hasEpic(cards);

  // Click to open (pack box or backdrop)
  function openPack() {
    packClosed.classList.add("hidden");
    packAnim.classList.remove("hidden"); // show animation after click

    if (isLegendary) {
      triggerLegendaryVFX();
    } else if (isEpic) {
      triggerEpicVFX();
    }

    // Create particles
    const colors = getParticleColors(cards);
    for (let i = 0; i < 30; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.background = colors[i % colors.length];
      p.style.left = "50%";
      p.style.top = "50%";
      p.style.setProperty("--tx", (Math.random() - 0.5) * 400 + "px");
      p.style.setProperty("--ty", (Math.random() - 0.5) * 400 + "px");
      p.style.animationDelay = Math.random() * 0.3 + "s";
      // Scale animation duration by speed
      const dur = animDuration(1000);
      p.style.animationDuration = dur + "ms";
      particles.appendChild(p);
    }

    // Show reveal after flash — longer pause for legendary
    const revealDelay = isLegendary ? animDuration(1500) : animDuration(800);
    setTimeout(() => {
      overlay.classList.add("hidden");
      showReveal(cards);
      recordPullHistory(cards);
    }, revealDelay);
  }

  packClosed.onclick = openPack;

  // Also allow clicking the dark backdrop to open
  overlay.onclick = (e) => {
    if (e.target === overlay || e.target.id === "pack-opening") {
      openPack();
    }
  };
}

// ========== LEGENDARY VFX ==========
function triggerLegendaryVFX() {
  // Screen shake
  document.body.classList.add("shake");
  setTimeout(() => document.body.classList.remove("shake"), 600);

  // Golden flash overlay
  const flash = document.createElement("div");
  flash.className = "golden-flash";
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 800);

  // Legendary banner
  const banner = document.createElement("div");
  banner.className = "legendary-banner";
  banner.innerHTML = `
    <span class="banner-emoji">👑</span>
    <span class="banner-text">LEGENDARY!</span>
  `;
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 2200);
}

// ========== EPIC VFX (lighter version) ==========
function triggerEpicVFX() {
  // Purple flash
  const flash = document.createElement("div");
  flash.className = "golden-flash";
  flash.style.background = "radial-gradient(circle at center, #f3e5f5, #9c27b0 30%, transparent 70%)";
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 600);
}

function getParticleColors(cards) {
  const seen = new Set();
  return cards.map(c => {
    if (!seen.has(c.rarity)) { seen.add(c.rarity); return RARITY_COLORS[c.rarity]; }
    return "#fff";
  });
}

// ========== CARD REVEAL ==========
function showReveal(cards) {
  const overlay = document.getElementById("reveal-overlay");
  const container = document.getElementById("reveal-container");
  container.innerHTML = "";

  // Rarity badge emoji per tier
  const BADGE_EMOJI = { common: "·", uncommon: "✦", rare: "★", epic: "✡", legendary: "👑" };

  cards.forEach((card, i) => {
    const el = document.createElement("div");
    // Rarity class drives the animation speed in CSS
    el.className = `reveal-card ${card.rarity}`;
    // Legendary cards get wider spacing for dramatic effect
    const delayMult = card.rarity === "legendary" ? 0.4 : (card.rarity === "epic" ? 0.25 : 0.1);
    el.style.animationDelay = (i * delayMult) + "s";

    // Legendary particles container
    let particlesHTML = "";
    if (card.rarity === "legendary") {
      particlesHTML = `<div class="legendary-particles"></div>`;
    }

    el.innerHTML = `
      <div class="reveal-rarity-badge ${card.rarity}">${BADGE_EMOJI[card.rarity]}</div>
      <div class="reveal-card-inner">
        <div class="reveal-card-front">🎴</div>
        <div class="reveal-card-back ${card.rarity}">
          <div class="reveal-art ${card.rarity}-bg">${card.emoji}</div>
          <div class="reveal-info">
            <div class="reveal-name">${card.name}</div>
            <div class="reveal-rarity" style="color:${RARITY_COLORS[card.rarity]}">${card.rarity.toUpperCase()}</div>
          </div>
        </div>
      </div>
      ${particlesHTML}
    `;

    // Click to flip
    el.addEventListener("click", () => {
      el.classList.toggle("flipped");
    });

    container.appendChild(el);
  });

  overlay.classList.remove("hidden");

  // Spawn golden particles on legendary cards
  if (cards.some(c => c.rarity === "legendary")) {
    const legendCards = container.querySelectorAll(".reveal-card.legendary");
    legendCards.forEach(cardEl => spawnLegendaryParticles(cardEl));
  }

  // Auto-flip all after delay if enabled
  if (state.autoReveal) {
    document.querySelectorAll(".reveal-card").forEach((el, i) => {
      const card = cards[i];
      // Legendary cards wait longer for dramatic effect
      const extraDelay = card.rarity === "legendary" ? animDuration(1000) : 0;
      setTimeout(() => el.classList.add("flipped"), i * Math.max(animDuration(200), 50) + extraDelay);
    });
  }
}

// ========== LEGENDARY PARTICLES ==========
function spawnLegendaryParticles(cardEl) {
  const container = cardEl.querySelector(".legendary-particles");
  if (!container) return;

  // Remove old particles
  container.innerHTML = "";

  // Golden sparkles (explosive burst outward)
  for (let i = 0; i < 20; i++) {
    const p = document.createElement("div");
    p.className = "legendary-particle";
    p.style.left = "50%";
    p.style.top = "50%";
    p.style.setProperty("--lx", (Math.random() - 0.5) * 160 + "px");
    p.style.setProperty("--ly", (Math.random() - 0.5) * 160 + "px");
    p.style.animationDelay = Math.random() * 2 + "s";
    p.style.animationDuration = (1.2 + Math.random() * 1.5) + "s";
    const size = 4 + Math.random() * 6;
    p.style.width = size + "px";
    p.style.height = size + "px";
    container.appendChild(p);
  }

  // Star-shaped particles (rotating, larger)
  for (let i = 0; i < 10; i++) {
    const s = document.createElement("div");
    s.className = "legendary-star";
    s.style.left = "50%";
    s.style.top = "50%";
    s.style.setProperty("--sx", (Math.random() - 0.5) * 140 + "px");
    s.style.setProperty("--sy", (Math.random() - 0.5) * 140 + "px");
    s.style.animationDelay = (0.3 + Math.random() * 2.5) + "s";
    const size = 8 + Math.random() * 8;
    s.style.width = size + "px";
    s.style.height = size + "px";
    container.appendChild(s);
  }

  // Sparkle bursts (4-point, quick flash)
  for (let i = 0; i < 12; i++) {
    const sp = document.createElement("div");
    sp.className = "legendary-sparkle";
    sp.style.left = "50%";
    sp.style.top = "50%";
    sp.style.setProperty("--px", (Math.random() - 0.5) * 180 + "px");
    sp.style.setProperty("--py", (Math.random() - 0.5) * 180 + "px");
    sp.style.animationDelay = (Math.random() * 3) + "s";
    container.appendChild(sp);
  }

  // Firework ring particles (circular burst pattern)
  const ringCount = 16;
  for (let i = 0; i < ringCount; i++) {
    const r = document.createElement("div");
    r.className = "legendary-ring";
    const angle = (i / ringCount) * Math.PI * 2;
    const dist = 40 + Math.random() * 30;
    r.style.left = "50%";
    r.style.top = "50%";
    r.style.setProperty("--rx", Math.cos(angle) * dist + "px");
    r.style.setProperty("--ry", Math.sin(angle) * dist + "px");
    r.style.animationDelay = (0.2 + Math.random() * 1.5) + "s";
    container.appendChild(r);
  }

  // Ambient floating sparkles (drift upward slowly, continuous)
  function spawnFloaters() {
    for (let i = 0; i < 8; i++) {
      const f = document.createElement("div");
      f.className = "legendary-float";
      f.style.left = (20 + Math.random() * 60) + "%";
      f.style.top = (60 + Math.random() * 30) + "%";
      f.style.setProperty("--fy", 40 + Math.random() * 40);
      f.style.setProperty("--fx", (Math.random() - 0.5) * 20);
      f.style.setProperty("--fd", (3 + Math.random() * 3) + "s");
      f.style.animationDelay = Math.random() * 4 + "s";
      const sz = 3 + Math.random() * 4;
      f.style.width = sz + "px";
      f.style.height = sz + "px";
      container.appendChild(f);
    }
  }
  spawnFloaters();
  // Continuously spawn new floaters for persistent effect
  setInterval(() => {
    if (container.parentElement) spawnFloaters();
  }, 4000);

  // Tiny diamond particles (spinning as they fall)
  for (let i = 0; i < 8; i++) {
    const d = document.createElement("div");
    d.className = "legendary-diamond";
    d.style.left = "50%";
    d.style.top = "50%";
    d.style.setProperty("--dx", (Math.random() - 0.5) * 100 + "px");
    d.style.setProperty("--dy", 30 + Math.random() * 60 + "px");
    d.style.animationDelay = (0.5 + Math.random() * 3) + "s";
    d.style.setProperty("--dd", (2 + Math.random() * 2) + "s");
    container.appendChild(d);
  }

  // Glow pulse ring
  const glowRing = document.createElement("div");
  glowRing.className = "legendary-glow-ring";
  container.appendChild(glowRing);
}

function closeReveal() {
  document.getElementById("reveal-overlay").classList.add("hidden");
  document.getElementById("pack-overlay").classList.add("hidden");
  updateStats();
  updatePityUI();
  renderCollection();
}

// ========== TABS ==========
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById("tab-" + tab.dataset.tab).classList.add("active");

    if (tab.dataset.tab === "collection") renderCollection();
    if (tab.dataset.tab === "pity") updatePityUI();
  });
});

// ========== STATS ==========
function updateStats() {
  const unique = Object.keys(state.collection).length;
  document.getElementById("total-pulls").textContent = state.totalPulls;
  document.getElementById("total-cards").textContent = state.totalCards;
  document.getElementById("unique-count").textContent = unique + "/" + CARD_DB.length;
  document.getElementById("gem-count").textContent = state.gems;

  // Update free pack UI state
  updateFreePackUI();
}

// ========== FREE PACK COOLDOWN UI ==========
let cooldownInterval = null;

function updateFreePackUI() {
  const btn = document.querySelector('[data-pack="basic"] .btn-pull');
  const label = document.querySelector('[data-pack="basic"] .pack-label');
  if (!btn || !label) return;

  const now = Date.now();
  const remainingCooldown = Math.max(0, state.freePullCooldown - now);
  const cooldownText = remainingCooldown > 0 ? ` (${Math.ceil(remainingCooldown / 1000)}s)` : "";
  const dailyText = ` ${state.freePullsToday}/10 today`;

  btn.disabled = remainingCooldown > 0 || state.freePullsToday >= 10;
  btn.style.opacity = btn.disabled ? "0.5" : "1";
  label.textContent = `Free Pull${cooldownText}${dailyText}`;
}

function startCooldownTimer() {
  if (cooldownInterval) clearInterval(cooldownInterval);
  cooldownInterval = setInterval(() => {
    updateFreePackUI();
  }, 200);
}

// ========== COLLECTION ==========
let currentFilter = "all";
let currentSearch = "";

function renderCollection() {
  const grid = document.getElementById("collection-grid");
  grid.innerHTML = "";

  const filtered = CARD_DB.filter(card => {
    const matchesRarity = currentFilter === "all" || card.rarity === currentFilter;
    const matchesSearch = !currentSearch || card.name.toLowerCase().includes(currentSearch.toLowerCase());
    return matchesRarity && matchesSearch;
  });

  // Show owned cards first, then unowned
  const owned = filtered.filter(c => state.collection[c.id]);
  const unowned = filtered.filter(c => !state.collection[c.id]);

  [...owned, ...unowned].forEach(card => {
    const el = document.createElement("div");
    const count = state.collection[card.id] || 0;
    el.className = `card ${card.rarity}`;
    if (!count) el.style.opacity = "0.4";
    el.innerHTML = `
      ${count > 0 ? `<div class="card-owned-badge">×${count}</div>` : '<div class="card-owned-badge" style="background:rgba(255,255,255,0.1);color:var(--text-secondary)">?</div>'}
      <div class="card-art ${card.rarity}-bg">${count > 0 ? card.emoji : "❓"}</div>
      <div class="card-info">
        <div class="card-name">${count > 0 ? card.name : "???"}</div>
        <div class="card-rarity-label" style="color:${RARITY_COLORS[card.rarity]}">${count > 0 ? card.rarity.toUpperCase() : "unknown"}</div>
      </div>
    `;

    if (count > 0) {
      el.addEventListener("click", () => showCardDetail(card));
    }

    grid.appendChild(el);
  });

  // Update dupe summary
  updateDupeSummary();
}

function filterCollection() {
  currentSearch = document.getElementById("search-cards").value;
  renderCollection();
}

function setFilter(rarity, btn) {
  currentFilter = rarity;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderCollection();
}

// ========== CARD DETAIL ==========
function showCardDetail(card) {
  const overlay = document.createElement("div");
  overlay.className = "card-detail-overlay";
  overlay.innerHTML = `
    <div class="card-detail" style="border:2px solid ${RARITY_COLORS[card.rarity]}">
      <div class="card-detail-art ${card.rarity}-bg" style="border-radius:12px">${card.emoji}</div>
      <div class="card-detail-name">${card.name}</div>
      <div class="card-detail-rarity" style="color:${RARITY_COLORS[card.rarity]}">${card.rarity.toUpperCase()}</div>
      <div class="card-detail-desc">${card.desc}</div>
      <div class="card-detail-stats">
        <div class="card-detail-stat"><div class="card-detail-stat-val" style="color:#ef5350">${card.stats.atk}</div><div class="card-detail-stat-label">ATK</div></div>
        <div class="card-detail-stat"><div class="card-detail-stat-val" style="color:#42a5f5">${card.stats.def}</div><div class="card-detail-stat-label">DEF</div></div>
        <div class="card-detail-stat"><div class="card-detail-stat-val" style="color:#66bb6a">${card.stats.spd}</div><div class="card-detail-stat-label">SPD</div></div>
      </div>
      <div style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:12px">Owned: ×${state.collection[card.id]}</div>
      <button class="btn-close-detail" onclick="this.closest('.card-detail-overlay').remove()">Close</button>
    </div>
  `;

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);
}

// ========== PITY UI ==========
function updatePityUI() {
  const PACKS_PITY = { basic: 25, premium: 25, legendary: 25 };
  const PACKS_EPIC = { basic: 50, premium: 50, legendary: 50 };
  const PACKS_LEG = { basic: 100, premium: 100, legendary: 100 };

  for (const packId of ["basic", "premium", "legendary"]) {
    const p = state.pity[packId];
    if (!p) continue;
    const rareEl = document.getElementById(`pity-${packId === 'legendary' ? 'legendary-pack' : packId}-rare`);
    const epicEl = document.getElementById(`pity-${packId === 'legendary' ? 'legendary-pack' : packId}-epic`);
    const legEl = document.getElementById(`pity-${packId === 'legendary' ? 'legendary-pack' : packId}-legendary`);
    if (rareEl) rareEl.textContent = `${p.rare}/${PACKS_PITY[packId]}`;
    if (epicEl) epicEl.textContent = `${p.epic}/${PACKS_EPIC[packId]}`;
    if (legEl) legEl.textContent = `${p.legendary}/${PACKS_LEG[packId]}`;
  }
}

// ========== FREE GEMS ==========
function claimFreeGems() {
  const now = Date.now();
  if (now - state.lastFreeGems < 86400000) {
    const remaining = Math.ceil((86400000 - (now - state.lastFreeGems)) / 3600000);
    alert(`Come back in ${remaining} hour(s)!`);
    return;
  }
  state.gems += 50;
  state.lastFreeGems = now;
  saveState();
  updateStats();
  alert("Claimed 50 free gems! 💎");
}

// ========== DUPLICATE CONVERSION ==========
function getDupeGemValue(rarity) {
  const values = { common: 5, uncommon: 15, rare: 40, epic: 100, legendary: 300 };
  return values[rarity] || 0;
}

function calculateDupes() {
  let totalGems = 0;
  const dupeList = [];

  for (const card of CARD_DB) {
    const count = state.collection[card.id] || 0;
    if (count > 3) {
      const dupes = count - 3;
      const gems = dupes * getDupeGemValue(card.rarity);
      totalGems += gems;
      dupeList.push({ card, dupes, gems });
    }
  }

  return { totalGems, dupeList };
}

function updateDupeSummary() {
  const { totalGems, dupeList } = calculateDupes();
  const summary = document.getElementById("dupes-summary");

  if (dupeList.length === 0) {
    summary.innerHTML = '<span class="dupe-item" style="color:var(--text-secondary)">No duplicates to convert yet</span>';
    return;
  }

  summary.innerHTML = dupeList.map(d => `
    <div class="dupe-item" style="border-left:3px solid ${RARITY_COLORS[d.card.rarity]}">
      ${d.card.emoji} ×${d.dupes} →
      <span class="dupe-gems">+${d.gems} 💎</span>
    </div>
  `).join('') + `
    <div class="dupe-total">Total: +${totalGems} 💎</div>
  `;

  // Update convert button state
  const btn = document.querySelector(".btn-dupe-convert");
  if (btn) btn.disabled = totalGems === 0;
}

function convertAllDupes() {
  const { totalGems, dupeList } = calculateDupes();
  if (totalGems === 0) return;

  // Reduce collection counts
  for (const d of dupeList) {
    state.collection[d.card.id] -= d.dupes;
    if (state.collection[d.card.id] <= 3) delete state.collection[d.card.id];
  }

  state.gems += totalGems;
  saveState();
  updateStats();
  renderCollection();

  alert(`Converted duplicates for +${totalGems} gems! 💎`);
}

function resetDupes() {
  updateDupeSummary();
}

// ========== ANIMATION SPEED ==========
function updateAnimSpeed(val) {
  animSpeed = parseInt(val);
  const label = document.getElementById("anim-speed-label");
  label.textContent = ANIM_SPEED_LABELS[animSpeed - 1];
}

// ========== DATA MANAGEMENT ==========
function exportState() {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gacha-save-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importState() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        state = { ...defaultState(), ...imported };
        saveState();
        updateStats();
        renderCollection();
        updatePityUI();
        alert("Save data imported successfully! 💾");
      } catch (err) {
        alert("Invalid save file. Please check the format.");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function resetAll() {
  if (confirm("Are you sure? This will delete ALL your progress, gems, and collection.")) {
    if (confirm("Really? This cannot be undone!")) {
      localStorage.removeItem("gacha_state");
      state = defaultState();
      updateStats();
      renderCollection();
      updatePityUI();
      alert("All data has been reset. Fresh start! 🆕");
    }
  }
}

// ========== UTILS ==========
function shakeElement(el) {
  if (!el) return;
  el.style.animation = "none";
  el.offsetHeight; // reflow
  el.style.animation = "shake 0.4s ease";
  setTimeout(() => el.style.animation = "", 400);
}

// ========== PULL HISTORY ==========
const PULL_HISTORY_LIMIT = 50;

function recordPullHistory(cards) {
  for (const card of cards) {
    state.pullHistory.unshift({
      cardId: card.id,
      name: card.name,
      rarity: card.rarity,
      emoji: card.emoji,
      time: Date.now(),
    });
  }
  // Keep only the last N entries
  if (state.pullHistory.length > PULL_HISTORY_LIMIT) {
    state.pullHistory = state.pullHistory.slice(0, PULL_HISTORY_LIMIT);
  }
  saveState();
  renderPullHistory();
}

function renderPullHistory() {
  const list = document.getElementById("pull-history-list");
  if (!list) return;

  const pulls = state.pullHistory || [];
  if (pulls.length === 0) {
    list.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;font-size:0.9rem">No pulls yet — start gachaing!</div>';
    return;
  }

  list.innerHTML = pulls.map(p => {
    const timeStr = new Date(p.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `
      <div class="pull-entry ${p.rarity}">
        <span class="pull-emoji">${p.emoji}</span>
        <span class="pull-name">${p.name}</span>
        <span class="pull-rarity ${p.rarity}">${p.rarity}</span>
        <span class="pull-time">${timeStr}</span>
      </div>
    `;
  }).join('');
}

// ========== INIT ==========
updateStats();
updatePityUI();
renderCollection();
renderPullHistory();
updateFreePackUI();
startCooldownTimer();
