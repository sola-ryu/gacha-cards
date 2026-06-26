// ========== CARD DATABASE ==========
const CARD_DB = [
  // --- COMMON ---
  { id: "c01", name: "Mossy Golem", rarity: "common", emoji: "🗿", desc: "A slow-moving rock creature covered in moss.", stats: { atk: 3, def: 5, spd: 2 } },
  { id: "c02", name: "Dust Sprite", rarity: "common", emoji: "✨", desc: "Tiny spirit that swirls around old libraries.", stats: { atk: 2, def: 1, spd: 4 } },
  { id: "c03", name: "Pebble Cat", rarity: "common", emoji: "🐱", desc: "A feline that collects stones in its fur.", stats: { atk: 2, def: 3, spd: 3 } },
  { id: "c04", name: "Rusty Key", rarity: "common", emoji: "🗝️", desc: "Opens nothing. But it looks important.", stats: { atk: 1, def: 4, spd: 1 } },
  { id: "c05", name: "Willow Wisp", rarity: "common", emoji: "🌿", desc: "A gentle light that guides lost hikers.", stats: { atk: 2, def: 3, spd: 3 } },
  { id: "c06", name: "Stone Frog", rarity: "common", emoji: "🐸", desc: "Indistinguishable from actual rocks.", stats: { atk: 1, def: 4, spd: 2 } },
  { id: "c07", name: "Copper Beetle", rarity: "common", emoji: "🪲", desc: "Shiny. Durable. Does absolutely nothing.", stats: { atk: 2, def: 5, spd: 1 } },
  { id: "c08", name: "Cloud Sheep", rarity: "common", emoji: "🐑", desc: "Floats lazily above the mountain peaks.", stats: { atk: 1, def: 2, spd: 4 } },

  // --- UNCOMMON ---
  { id: "u01", name: "Frost Wolf", rarity: "uncommon", emoji: "🐺", desc: "Breathes cold air that frosts the ground.", stats: { atk: 6, def: 4, spd: 5 } },
  { id: "u02", name: "Ember Fox", rarity: "uncommon", emoji: "🦊", desc: "Tail flame brightens dark caves.", stats: { atk: 5, def: 3, spd: 7 } },
  { id: "u03", name: "Iron Heron", rarity: "uncommon", emoji: "🦢", desc: "Metallic feathers deflect small projectiles.", stats: { atk: 4, def: 7, spd: 5 } },
  { id: "u04", name: "Thorn Lizard", rarity: "uncommon", emoji: "🦎", desc: "Spikes along its back are razor sharp.", stats: { atk: 7, def: 5, spd: 3 } },
  { id: "u05", name: "Lantern Moth", rarity: "uncommon", emoji: "🦋", desc: "Wings glow with bioluminescent patterns.", stats: { atk: 3, def: 4, spd: 8 } },
  { id: "u06", name: "Tide Bear", rarity: "uncommon", emoji: "🐻", desc: "Swims through rivers like they're puddles.", stats: { atk: 8, def: 6, spd: 3 } },

  // --- RARE ---
  { id: "r01", name: "Storm Drake", rarity: "rare", emoji: "🐉", desc: "Calls lightning with every wingbeat.", stats: { atk: 9, def: 7, spd: 8 } },
  { id: "r02", name: "Crystal Serpent", rarity: "rare", emoji: "🐍", desc: "Body refracts light into blinding prisms.", stats: { atk: 8, def: 9, spd: 7 } },
  { id: "r03", name: "Void Raven", rarity: "rare", emoji: "🐦‍⬛", desc: "Its shadow moves independently.", stats: { atk: 10, def: 5, spd: 10 } },
  { id: "r04", name: "Glacier Lion", rarity: "rare", emoji: "🦁", desc: "Mane of frozen wind, roar that freezes.", stats: { atk: 11, def: 8, spd: 6 } },
  { id: "r05", name: "Aurora Stag", rarity: "rare", emoji: "🦌", desc: "Antlers emit the colors of the northern lights.", stats: { atk: 7, def: 10, spd: 9 } },
  { id: "r06", name: "Thunder Hawk", rarity: "rare", emoji: "🦅", desc: "Eyes see through any storm.", stats: { atk: 9, def: 6, spd: 12 } },

  // --- EPIC ---
  { id: "e01", name: "Phoenix Emperor", rarity: "epic", emoji: "🔥", desc: "Rises from ashes with every defeat.", stats: { atk: 14, def: 12, spd: 11 } },
  { id: "e02", name: "Celestial Whale", rarity: "epic", emoji: "🐋", desc: "Swims through the night sky between stars.", stats: { atk: 10, def: 18, spd: 8 } },
  { id: "e03", name: "Shadow Monarch", rarity: "epic", emoji: "👤", desc: "Commands an army of darkness.", stats: { atk: 16, def: 10, spd: 12 } },
  { id: "e04", name: "Crystal Dragon", rarity: "epic", emoji: "💎", desc: "Body made of living gemstone. Immortal.", stats: { atk: 13, def: 20, spd: 7 } },
  { id: "e05", name: "Storm Titan", rarity: "epic", emoji: "⚡", desc: "A walking thunderstorm given form.", stats: { atk: 18, def: 14, spd: 9 } },

  // --- LEGENDARY ---
  { id: "l01", name: "World Serpent", rarity: "legendary", emoji: "🐲", desc: "Encircles the world. Its tail is its head.", stats: { atk: 25, def: 22, spd: 15 } },
  { id: "l02", name: "Star Forge Dragon", rarity: "legendary", emoji: "🌟", desc: "Creates new stars with every breath.", stats: { atk: 30, def: 18, spd: 20 } },
  { id: "l03", name: "Eclipse Phoenix", rarity: "legendary", emoji: "🌑", desc: "Exists in both light and darkness simultaneously.", stats: { atk: 28, def: 25, spd: 22 } },
  { id: "l04", name: "Cosmic Leviathan", rarity: "legendary", emoji: "🌀", desc: "Born from the void between universes.", stats: { atk: 35, def: 30, spd: 18 } },
];

// ========== PACK DEFINITIONS ==========
const PACKS = {
  basic: {
    name: "Basic Pack",
    rates: { common: 50, uncommon: 30, rare: 15, epic: 4, legendary: 1 },
    cost: 0,
    gems: 10, // returned per pull
  },
  premium: {
    name: "Premium Pack",
    rates: { common: 0, uncommon: 35, rare: 35, epic: 20, legendary: 10 },
    cost: 100,
    gems: 5,
  },
  legendary: {
    name: "Legendary Pack",
    rates: { common: 0, uncommon: 0, rare: 30, epic: 40, legendary: 30 },
    cost: 200,
    gems: 3,
  },
};

// ========== RARITY ORDER ==========
const RARITY_ORDER = ["common", "uncommon", "rare", "epic", "legendary"];
const RARITY_COLORS = {
  common: "#9e9e9e",
  uncommon: "#4caf50",
  rare: "#2196f3",
  epic: "#9c27b0",
  legendary: "#ff9800",
};
