// ========== CARD DATABASE (200+ cards) ==========

const RARITY_ORDER = ["common", "uncommon", "rare", "epic", "legendary"];
const RARITY_COLORS = { common: "#9e9e9e", uncommon: "#4caf50", rare: "#2196f3", epic: "#9c27b0", legendary: "#ff9800" };

// --- Common card generators (60 cards) ---
const COMMON_TEMPLATES = [
  { name: "Mossy Golem", emoji: "🗿", desc: "A slow-moving rock creature covered in moss." },
  { name: "Dust Sprite", emoji: "✨", desc: "Tiny spirit that swirls around old libraries." },
  { name: "Pebble Cat", emoji: "🐱", desc: "A feline that collects stones in its fur." },
  { name: "Rusty Key", emoji: "🗝️", desc: "Opens nothing. But it looks important." },
  { name: "Willow Wisp", emoji: "🌿", desc: "A gentle light that guides lost hikers." },
  { name: "Stone Frog", emoji: "🐸", desc: "Indistinguishable from actual rocks." },
  { name: "Copper Beetle", emoji: "🪲", desc: "Shiny. Durable. Does absolutely nothing." },
  { name: "Cloud Sheep", emoji: "🐑", desc: "Floats lazily above the mountain peaks." },
  { name: "Dirt Mole", emoji: "🐀", desc: "Excavates tunnels no one ever finds." },
  { name: "Paper Crane", emoji: "🦢", desc: "Folds itself. Falters in the rain." },
  { name: "Stray Kitten", emoji: "😺", desc: "Wanders between worlds looking for warmth." },
  { name: "Field Mouse", emoji: "🐭", desc: "Survives on courage and stolen grain." },
  { name: "Hedgehog Scout", emoji: "🦔", desc: "Rolls into a ball when the world gets loud." },
  { name: "Garden Snail", emoji: "🐌", desc: "Carries its home on its back. Efficient." },
  { name: "Sparrow Flock", emoji: "🐦", desc: "Never alone. Never silent." },
  { name: "Lizard Tail", emoji: "🦎", desc: "Regrows endlessly. Gets bored easily." },
  { name: "Wood Frog", emoji: "🐸", desc: "Freezes in winter. Wakes up with opinions." },
  { name: "Pine Cone", emoji: "🌲", desc: "A gift from the forest. No one knows why." },
  { name: "River Stone", emoji: "🪨", desc: "Smoothed by centuries of patient water." },
  { name: "Wildflower Seed", emoji: "🌸", desc: "Waits for spring with infinite patience." },
  { name: "Copper Coin", emoji: "🪙", desc: "Worthless now. Maybe someday." },
  { name: "Old Boot", emoji: "👢", desc: "Has walked more miles than you have." },
  { name: "Tin Can", emoji: "🥫", desc: "Rattling with unexpressed thoughts." },
  { name: "Broken Compass", emoji: "🧭", desc: "Points to somewhere. Not north though." },
  { name: "Dried Leaf", emoji: "🍂", desc: "Autumn's last message before winter." },
  { name: "Crumpled Map", emoji: "🗺️", desc: "Shows a path that may or may not exist." },
  { name: "Faded Letter", emoji: "✉️", desc: "Words worn soft by time and handling." },
  { name: "Pocket Watch", emoji: "⌚", desc: "Ticks backwards. No one noticed." },
  { name: "Glass Marble", emoji: "🔮", desc: "Swirls with captured sky on cloudy days." },
  { name: "Feather Quill", emoji: "🪶", desc: "Once wrote poetry. Now writes lists." },
  { name: "Stone Owl", emoji: "🦉", desc: "Watches everything. Judges silently." },
  { name: "Mossy Log", emoji: "🪵", desc: "Home to a thousand tiny civilizations." },
  { name: "Wild Herb", emoji: "🌿", desc: "Smells like someone's grandmother's garden." },
  { name: "Pebble Beach", emoji: "🏖️", desc: "A thousand stones, each with a story." },
  { name: "Dewdrop Spider", emoji: "🕷️", desc: "Webs glisten with morning promises." },
  { name: "Grasshopper", emoji: "🦗", desc: "One leap at a time. Mostly forward." },
  { name: "Firefly Jar", emoji: "🏺", desc: "Captured light. Regretted immediately." },
  { name: "Mushroom Cap", emoji: "🍄", desc: "An umbrella for the smallest rain." },
  { name: "Acorn Sprite", emoji: "🌰", desc: "Planted by forgetful hands. Grew anyway." },
  { name: "Raccoon Bandit", emoji: "🦝", desc: "Steals shiny things. Returns them... sometimes." },
  { name: "Turtle Shell", emoji: "🐢", desc: "A fortress that walks. Slowly." },
  { name: "Dragonfly Wing", emoji: "🪰", desc: "Translucent. Delicate. Unbreakable." },
  { name: "Seashell Whisper", emoji: "🐚", desc: "Holds the ocean's last secret." },
  { name: "Cactus Bloom", emoji: "🌵", desc: "Flowers despite everything." },
  { name: "Pine Needle", emoji: "🌲", desc: "Sharp but necessary. Like truth." },
  { name: "Wild Berry", emoji: "🫐", desc: "Sweet if you find it first." },
  { name: "Stone Garden", emoji: "🪨", desc: "A collection of rocks that love each other." },
  { name: "Frog Prince", emoji: "🤴", desc: "Still waiting. The curse wasn't real." },
  { name: "Dandelion Wish", emoji: "🌼", desc: "Make a wish. It won't come true. But try." },
  { name: "Bamboo Sprout", emoji: "🎋", desc: "Grows faster than your patience." },
  { name: "Koi Pond", emoji: "🐟", desc: "Swims in circles. Contentedly." },
  { name: "Stone Lantern", emoji: "🏮", desc: "Glows when no one's watching." },
  { name: "Paper Boat", emoji: "⛵", desc: "Sails on puddles like the ocean." },
  { name: "Cherry Blossom", emoji: "🌸", desc: "Beautiful because it won't last." },
  { name: "Old Book", emoji: "📖", desc: "Full of stories that forgot their names." },
  { name: "Wind Chime", emoji: "🎐", desc: "Music for the breeze. Breeze doesn't care." },
  { name: "Stone Bridge", emoji: "🌉", desc: "Crossed by millions. Stands anyway." },
  { name: "Morning Dew", emoji: "💧", desc: "Gone by noon. Beautiful while here." },
];

// --- Uncommon card generators (50 cards) ---
const UNCOMMON_TEMPLATES = [
  { name: "Frost Wolf", emoji: "🐺", desc: "Breathes cold air that frosts the ground." },
  { name: "Ember Fox", emoji: "🦊", desc: "Tail flame brightens dark caves." },
  { name: "Iron Heron", emoji: "🦢", desc: "Metallic feathers deflect small projectiles." },
  { name: "Thorn Lizard", emoji: "🦎", desc: "Spikes along its back are razor sharp." },
  { name: "Lantern Moth", emoji: "🦋", desc: "Wings glow with bioluminescent patterns." },
  { name: "Tide Bear", emoji: "🐻", desc: "Swims through rivers like they're puddles." },
  { name: "Storm Crow", emoji: "🐦‍⬛", desc: "Calls storms with a single caw." },
  { name: "Crystal Spider", emoji: "🕷️", desc: "Webs refract light into rainbows." },
  { name: "Iron Boar", emoji: "🐗", desc: "Charges through forests like a battering ram." },
  { name: "Mist Panther", emoji: "🐆", desc: "Paces between fog layers. Unseen." },
  { name: "Thunder Snake", emoji: "🐍", desc: "Body crackles with stored lightning." },
  { name: "Frost Jaguar", emoji: "🐾", desc: "Leaves ice prints wherever it walks." },
  { name: "Ember Owl", emoji: "🦉", desc: "Eyes glow like banked coals." },
  { name: "Stone Tiger", emoji: "🐯", desc: "Skin like granite. Roar like thunder." },
  { name: "Silver Stag", emoji: "🦌", desc: "Antlers branch with silver light." },
  { name: "Shadow Hound", emoji: "🐕", desc: "Chases things that aren't there." },
  { name: "Crystal Hawk", emoji: "🦅", desc: "Eyes see through stone and steel." },
  { name: "Thunder Wolf", emoji: "⚡", desc: "Runs on lightning. Leaves sparks." },
  { name: "Frost Serpent", emoji: "❄️", desc: "Body coils with frozen breath." },
  { name: "Ember Cat", emoji: "🐈", desc: "Purrs with the sound of crackling fire." },
  { name: "Iron Bear", emoji: "🐻‍❄️", desc: "Fur like steel wool. Claws like daggers." },
  { name: "Mist Dragon", emoji: "🐉", desc: "Small but fierce. Wraps around mountains." },
  { name: "Storm Falcon", emoji: "🦅", desc: "Rides thunderstorms like a surfer." },
  { name: "Crystal Wolf", emoji: "💎", desc: "Howls make the air shiver with light." },
  { name: "Shadow Lynx", emoji: "🐱", desc: "Moves between shadows. Appears behind you." },
  { name: "Thunder Panther", emoji: "⚡", desc: "Paces bring rain. Roars bring lightning." },
  { name: "Frost Eagle", emoji: "🦅", desc: "Wings spread blizzards across the sky." },
  { name: "Ember Drake", emoji: "🔥", desc: "Breathes warm smoke. Not fire. Warmth." },
  { name: "Iron Wolf", emoji: "🐺", desc: "Pack leader of the steel forest." },
  { name: "Crystal Fox", emoji: "🦊", desc: "Tail refracts light into prisms." },
  { name: "Storm Serpent", emoji: "🌪️", desc: "Coils around clouds like a living tornado." },
  { name: "Shadow Bear", emoji: "🐻", desc: "Darkness clings to its fur like velvet." },
  { name: "Frost Panther", emoji: "❄️", desc: "Every step freezes the earth beneath." },
  { name: "Thunder Hawk", emoji: "🦅", desc: "Eyes see through any storm." },
  { name: "Ember Stag", emoji: "🦌", desc: "Antlers burn with eternal flame." },
  { name: "Crystal Bear", emoji: "💎", desc: "Body refracts sunlight into rainbows." },
  { name: "Iron Eagle", emoji: "🦅", desc: "Wingspan wider than a house." },
  { name: "Shadow Wolf", emoji: "🐺", desc: "Howls echo from places that don't exist." },
  { name: "Frost Hawk", emoji: "❄️", desc: "Eyes see heat signatures through ice." },
  { name: "Thunder Lion", emoji: "⚡", desc: "Mane crackles with stored energy." },
  { name: "Ember Panther", emoji: "🔥", desc: "Paces leave burning footprints." },
  { name: "Crystal Serpent", emoji: "💎", desc: "Body refracts light into blinding prisms." },
  { name: "Storm Wolf", emoji: "🌩️", desc: "Lead of the thunder pack. Never lost." },
  { name: "Shadow Hawk", emoji: "🦅", desc: "Wings block out the sun. Briefly." },
  { name: "Frost Dragon", emoji: "❄️", desc: "Breath freezes rivers solid in seconds." },
  { name: "Iron Stag", emoji: "🦌", desc: "Antlers of polished steel. Unbreakable." },
  { name: "Thunder Bear", emoji: "⚡", desc: "Roars summon lightning from clear skies." },
  { name: "Ember Wolf", emoji: "🔥", desc: "Eyes burn like hot coals. Pack follows." },
];

// --- Rare card generators (40 cards) ---
const RARE_TEMPLATES = [
  { name: "Storm Drake", emoji: "🐉", desc: "Calls lightning with every wingbeat." },
  { name: "Crystal Serpent", emoji: "💎", desc: "Body refracts light into blinding prisms." },
  { name: "Void Raven", emoji: "🐦‍⬛", desc: "Its shadow moves independently." },
  { name: "Glacier Lion", emoji: "🦁", desc: "Mane of frozen wind, roar that freezes." },
  { name: "Aurora Stag", emoji: "🦌", desc: "Antlers emit the colors of the northern lights." },
  { name: "Thunder Hawk", emoji: "⚡", desc: "Eyes see through any storm." },
  { name: "Shadow Phoenix", emoji: "🔥", desc: "Rises from darkness as easily as from fire." },
  { name: "Crystal Dragon", emoji: "💎", desc: "Body made of living gemstone. Immortal." },
  { name: "Storm Titan", emoji: "⚡", desc: "A walking thunderstorm given form." },
  { name: "Frost Wyrm", emoji: "🐉", desc: "Breath freezes time itself." },
  { name: "Ember Dragon", emoji: "🔥", desc: "Scales burn with inner fire. Cannot be extinguished." },
  { name: "Iron Colossus", emoji: "🗿", desc: "A mountain that learned to walk." },
  { name: "Shadow Serpent", emoji: "🐍", desc: "Coils through dimensions between yours." },
  { name: "Crystal Wolf", emoji: "💎", desc: "Howls resonate across frozen landscapes." },
  { name: "Thunder Dragon", emoji: "⚡", desc: "Wings generate storms. Tail crackles." },
  { name: "Frost Titan", emoji: "❄️", desc: "Breath creates blizzards that never end." },
  { name: "Ember Phoenix", emoji: "🔥", desc: "Feathers burn eternal. Ashes sing." },
  { name: "Void Dragon", emoji: "🌑", desc: "Exists between realities. Always watching." },
  { name: "Crystal Hawk", emoji: "💎", desc: "Wings refract light into weaponized prisms." },
  { name: "Shadow Lion", emoji: "🦁", desc: "Mane of living darkness. Roars silence." },
  { name: "Storm Serpent", emoji: "🌪️", desc: "Body is a living tornado. Eyes are lightning." },
  { name: "Frost Dragon", emoji: "❄️", desc: "Breath freezes rivers solid in seconds." },
  { name: "Ember Titan", emoji: "🔥", desc: "Heart is a furnace. Steps cause earthquakes." },
  { name: "Crystal Phoenix", emoji: "💎", desc: "Rises from gemstone as phoenix from fire." },
  { name: "Shadow Dragon", emoji: "🌑", desc: "Wings block stars. Presence chills blood." },
  { name: "Thunder Serpent", emoji: "⚡", desc: "Body crackles with eternal lightning." },
  { name: "Frost Hawk", emoji: "❄️", desc: "Eyes see heat through any ice." },
  { name: "Ember Wyrm", emoji: "🔥", desc: "Breath burns hotter than any forge." },
  { name: "Void Titan", emoji: "🌑", desc: "A walking void. Stars fear its gaze." },
  { name: "Crystal Titan", emoji: "💎", desc: "Body is a living crystal. Immovable." },
  { name: "Shadow Serpent", emoji: "🐍", desc: "Coils through shadows between worlds." },
  { name: "Storm Phoenix", emoji: "🌪️", desc: "Rises from thunderstorms with lightning mane." },
  { name: "Frost Wyrm", emoji: "❄️", desc: "Breath freezes time itself." },
  { name: "Ember Drake", emoji: "🔥", desc: "Breathes warm smoke. Not fire. Warmth." },
  { name: "Void Serpent", emoji: "🌑", desc: "Exists between heartbeats. Always hungry." },
  { name: "Crystal Dragon", emoji: "💎", desc: "Wings refract light into rainbows of power." },
  { name: "Shadow Titan", emoji: "🌑", desc: "A walking darkness. Light cannot reach it." },
  { name: "Thunder Wyrm", emoji: "⚡", desc: "Body crackles with stored lightning storms." },
  { name: "Storm Dragon", emoji: "🌪️", desc: "Wings are tornadoes. Eyes are lightning." },
];

// --- Epic card generators (30 cards) ---
const EPIC_TEMPLATES = [
  { name: "Phoenix Emperor", emoji: "🔥", desc: "Rises from ashes with every defeat." },
  { name: "Celestial Whale", emoji: "🐋", desc: "Swims through the night sky between stars." },
  { name: "Shadow Monarch", emoji: "👤", desc: "Commands an army of darkness." },
  { name: "Crystal Dragon", emoji: "💎", desc: "Body made of living gemstone. Immortal." },
  { name: "Storm Titan", emoji: "⚡", desc: "A walking thunderstorm given form." },
  { name: "Void Dragon", emoji: "🌑", desc: "Exists between realities. Always watching." },
  { name: "Ember Phoenix", emoji: "🔥", desc: "Feathers burn eternal. Ashes sing." },
  { name: "Frost Titan", emoji: "❄️", desc: "Breath creates blizzards that never end." },
  { name: "Thunder Dragon", emoji: "⚡", desc: "Wings generate storms. Tail crackles." },
  { name: "Crystal Phoenix", emoji: "💎", desc: "Rises from gemstone as phoenix from fire." },
  { name: "Shadow Dragon", emoji: "🌑", desc: "Wings block stars. Presence chills blood." },
  { name: "Void Titan", emoji: "🌑", desc: "A walking void. Stars fear its gaze." },
  { name: "Crystal Titan", emoji: "💎", desc: "Body is a living crystal. Immovable." },
  { name: "Storm Phoenix", emoji: "🌪️", desc: "Rises from thunderstorms with lightning mane." },
  { name: "Ember Wyrm", emoji: "🔥", desc: "Breath burns hotter than any forge." },
  { name: "Void Serpent", emoji: "🌑", desc: "Exists between heartbeats. Always hungry." },
  { name: "Shadow Titan", emoji: "🌑", desc: "A walking darkness. Light cannot reach it." },
  { name: "Thunder Wyrm", emoji: "⚡", desc: "Body crackles with stored lightning storms." },
  { name: "Storm Dragon", emoji: "🌪️", desc: "Wings are tornadoes. Eyes are lightning." },
  { name: "Celestial Serpent", emoji: "🐍", desc: "Coils around constellations like a living necklace." },
  { name: "Aurora Dragon", emoji: "🌈", desc: "Wings paint the sky with living colors." },
  { name: "Void Phoenix", emoji: "🌑", desc: "Rises from nothing. Becomes everything." },
  { name: "Crystal Wyrm", emoji: "💎", desc: "Body refracts reality into prismatic shards." },
  { name: "Shadow Phoenix", emoji: "🔥", desc: "Rises from darkness as easily as from fire." },
  { name: "Ember Titan", emoji: "🔥", desc: "Heart is a furnace. Steps cause earthquakes." },
  { name: "Frost Dragon", emoji: "❄️", desc: "Breath freezes rivers solid in seconds." },
  { name: "Thunder Phoenix", emoji: "⚡", desc: "Wings generate storms. Feathers crackle." },
  { name: "Void Wyrm", emoji: "🌑", desc: "Exists between dimensions. Hunger is eternal." },
  { name: "Crystal Serpent", emoji: "💎", desc: "Body refracts light into blinding prisms." },
  { name: "Shadow Dragon", emoji: "🌑", desc: "Wings block stars. Presence chills blood." },
];

// --- Legendary card generators (20 cards) ---
const LEGENDARY_TEMPLATES = [
  { name: "World Serpent", emoji: "🐲", desc: "Encircles the world. Its tail is its head." },
  { name: "Star Forge Dragon", emoji: "🌟", desc: "Creates new stars with every breath." },
  { name: "Eclipse Phoenix", emoji: "🌑", desc: "Exists in both light and darkness simultaneously." },
  { name: "Cosmic Leviathan", emoji: "🌀", desc: "Born from the void between universes." },
  { name: "Aurora Titan", emoji: "🌈", desc: "Body is the northern lights given form." },
  { name: "Void Emperor", emoji: "👑", desc: "Rules over nothing. And therefore everything." },
  { name: "Crystal Sovereign", emoji: "💎", desc: "Body is living gemstone. Immortal. Unbreakable." },
  { name: "Thunder Monarch", emoji: "⚡", desc: "Roar summons storms. Eyes hold lightning." },
  { name: "Shadow Emperor", emoji: "🌑", desc: "A walking darkness. Light cannot reach it." },
  { name: "Ember Sovereign", emoji: "🔥", desc: "Heart is a star. Breath is the sun." },
  { name: "Frost Monarch", emoji: "❄️", desc: "Breath creates eternal blizzards. Steps freeze time." },
  { name: "Storm Sovereign", emoji: "🌪️", desc: "Body is a living storm. Wings are tornadoes." },
  { name: "Void Leviathan", emoji: "🌀", desc: "Swims through the space between stars." },
  { name: "Crystal Emperor", emoji: "💎", desc: "Body refracts reality into prismatic shards." },
  { name: "Thunder Sovereign", emoji: "⚡", desc: "Eyes hold lightning. Roar summons storms." },
  { name: "Aurora Dragon", emoji: "🌈", desc: "Wings paint the sky with living colors." },
  { name: "Void Phoenix", emoji: "🌑", desc: "Rises from nothing. Becomes everything." },
  { name: "Ember Emperor", emoji: "🔥", desc: "Heart is a star. Breath is the sun." },
  { name: "Crystal Monarch", emoji: "💎", desc: "Body is living crystal. Immovable. Eternal." },
  { name: "Shadow Sovereign", emoji: "🌑", desc: "A walking darkness. Light cannot reach it." },
];

// ========== BUILD CARD ARRAY ==========
function buildCards(templates, rarity, idPrefix) {
  return templates.map((t, i) => ({
    id: `${idPrefix}${String(i + 1).padStart(3, "0")}`,
    name: t.name,
    rarity,
    emoji: t.emoji,
    desc: t.desc,
    stats: { atk: 0, def: 0, spd: 0 },
  }));
}

// Assign stats based on rarity ranges
function assignStats(cards) {
  const statRanges = {
    common:     { atk: [1, 5], def: [2, 6], spd: [1, 5] },
    uncommon:   { atk: [4, 9], def: [3, 8], spd: [4, 9] },
    rare:       { atk: [7, 13], def: [6, 12], spd: [6, 13] },
    epic:       { atk: [12, 20], def: [10, 18], spd: [8, 16] },
    legendary:  { atk: [20, 40], def: [15, 35], spd: [12, 30] },
  };
  const ranges = statRanges[cards[0].rarity];
  cards.forEach(c => {
    c.stats.atk = Math.floor(Math.random() * (ranges.atk[1] - ranges.atk[0] + 1)) + ranges.atk[0];
    c.stats.def = Math.floor(Math.random() * (ranges.def[1] - ranges.def[0] + 1)) + ranges.def[0];
    c.stats.spd = Math.floor(Math.random() * (ranges.spd[1] - ranges.spd[0] + 1)) + ranges.spd[0];
  });
}

const CARD_DB = [
  ...buildCards(COMMON_TEMPLATES, "common", "c"),
  ...buildCards(UNCOMMON_TEMPLATES, "uncommon", "u"),
  ...buildCards(RARE_TEMPLATES, "rare", "r"),
  ...buildCards(EPIC_TEMPLATES, "epic", "e"),
  ...buildCards(LEGENDARY_TEMPLATES, "legendary", "l"),
];

// Assign stats per rarity tier
assignStats(CARD_DB.filter(c => c.rarity === "common"));
assignStats(CARD_DB.filter(c => c.rarity === "uncommon"));
assignStats(CARD_DB.filter(c => c.rarity === "rare"));
assignStats(CARD_DB.filter(c => c.rarity === "epic"));
assignStats(CARD_DB.filter(c => c.rarity === "legendary"));

// ========== PACK DEFINITIONS ==========
const PACKS = {
  basic: {
    name: "Basic Pack",
    rates: { common: 50, uncommon: 30, rare: 15, epic: 4, legendary: 1 },
    cost: 0,
  },
  premium: {
    name: "Premium Pack",
    rates: { common: 0, uncommon: 35, rare: 35, epic: 20, legendary: 10 },
    cost: 100,
  },
  legendary: {
    name: "Legendary Pack",
    rates: { common: 0, uncommon: 0, rare: 30, epic: 40, legendary: 30 },
    cost: 200,
  },
};
