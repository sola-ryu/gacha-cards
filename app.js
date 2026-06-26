// ========== STATE ==========
let state = loadState();

function defaultState() {
  return {
    gems: 500,
    collection: {},    // { cardId: count }
    totalPulls: 0,
    totalCards: 0,
    pityRare: 0,      // pulls since last rare+
    pityEpic: 0,      // pulls since last epic+
    pityLegendary: 0, // pulls since last legendary
    lastFreeGems: 0,  // timestamp of last free gems
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem("gacha_state");
    if (saved) return { ...defaultState(), ...JSON.parse(saved) };
  } catch {}
  return defaultState();
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

  state.gems -= totalCost;

  // Generate cards
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(doPull(pack));
  }

  saveState();
  updateStats();

  // Show pack opening animation then reveal
  showPackOpening(results, packId);
}

function doPull(pack) {
  let remaining = 100;
  let selectedRarity = null;

  // Pity checks
  if (state.pityLegendary >= 50 && !pack.rates.legendary) {
    state.pityLegendary = 0;
    return getCard("legendary");
  }
  if (state.pityEpic >= 30 && !pack.rates.epic) {
    state.pityEpic = 0;
    return getCard("epic");
  }
  if (state.pityRare >= 15 && !pack.rates.rare) {
    state.pityRare = 0;
    return getCard("rare");
  }

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

  // Pity override: guarantee rare+ if pity reached
  if (state.pityLegendary >= 50) selectedRarity = "legendary";
  else if (state.pityEpic >= 30 && selectedRarity !== "legendary") selectedRarity = "epic";
  else if (state.pityRare >= 15 && !RARITY_ORDER.indexOf(selectedRarity) < RARITY_ORDER.indexOf("rare")) selectedRarity = "rare";

  const card = getCard(selectedRarity);

  // Update pity counters
  state.totalPulls++;
  const ri = RARITY_ORDER.indexOf(selectedRarity);

  if (selectedRarity === "legendary") {
    state.pityLegendary = 0;
    state.pityEpic = 0;
    state.pityRare = 0;
  } else if (selectedRarity === "epic") {
    state.pityEpic = 0;
    state.pityRare = 0;
    state.pityLegendary++;
  } else if (selectedRarity === "rare") {
    state.pityRare = 0;
    state.pityEpic++;
    state.pityLegendary++;
  } else {
    state.pityRare++;
    state.pityEpic++;
    state.pityLegendary++;
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
function showPackOpening(cards, packId) {
  const overlay = document.getElementById("pack-overlay");
  const packClosed = document.getElementById("pack-closed");
  const packAnim = document.getElementById("pack-opening-anim");
  const particles = document.getElementById("particles");

  // Reset
  packClosed.classList.remove("hidden");
  packAnim.classList.add("hidden");
  particles.innerHTML = "";
  overlay.classList.remove("hidden");

  // Click to open
  packClosed.onclick = () => {
    packClosed.classList.add("hidden");
    packAnim.classList.remove("hidden");

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
      particles.appendChild(p);
    }

    // Show reveal after flash
    setTimeout(() => {
      overlay.classList.add("hidden");
      showReveal(cards);
    }, 1000);
  };
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

  cards.forEach((card, i) => {
    const el = document.createElement("div");
    el.className = "reveal-card";
    el.style.animationDelay = (i * 0.1) + "s";
    el.innerHTML = `
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
    `;

    // Click to flip
    el.addEventListener("click", () => {
      el.classList.toggle("flipped");
    });

    container.appendChild(el);
  });

  overlay.classList.remove("hidden");

  // Auto-flip all after delay
  setTimeout(() => {
    document.querySelectorAll(".reveal-card").forEach((el, i) => {
      setTimeout(() => el.classList.add("flipped"), i * 200);
    });
  }, 500);
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
  const rPct = Math.min((state.pityRare / 15) * 100, 100);
  const ePct = Math.min((state.pityEpic / 30) * 100, 100);
  const lPct = Math.min((state.pityLegendary / 50) * 100, 100);

  document.getElementById("pity-rare").style.width = rPct + "%";
  document.getElementById("pity-epic").style.width = ePct + "%";
  document.getElementById("pity-legendary").style.width = lPct + "%";

  document.getElementById("pity-rare-count").textContent = `${state.pityRare} / 15`;
  document.getElementById("pity-epic-count").textContent = `${state.pityEpic} / 30`;
  document.getElementById("pity-legendary-count").textContent = `${state.pityLegendary} / 50`;
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

// ========== UTILS ==========
function shakeElement(el) {
  if (!el) return;
  el.style.animation = "none";
  el.offsetHeight; // reflow
  el.style.animation = "shake 0.4s ease";
  setTimeout(() => el.style.animation = "", 400);
}

// ========== INIT ==========
updateStats();
updatePityUI();
renderCollection();
