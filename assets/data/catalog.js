/**
 * Authentic Unbound Suns game catalog synced with UnboundSuns.Server & world.json.
 */
window.UNBOUND_CATALOG = {
  ships: [
    {
      id: "craft_frigate",
      tier: "TIER I",
      tierNum: 1,
      name: "Vanguard Frigate",
      role: "Starter Multi-Role Hull",
      img: "assets/img/ships/f0s1.png",
      tagline: "Balanced orbital workhorse engineered for Blue-zone mining, station hauling, and early pirate patrols.",
      stats: { armor: 38, shield: 32, speed: 68, firepower: 34, cargo: 42 },
      craftCost: { credits: "2,400 Silver", scrap: "10 Alloy Scrap", ores: "No refined ores required" },
      zoneRec: "Blue & Yellow Sectors"
    },
    {
      id: "craft_scout",
      tier: "TIER II",
      tierNum: 2,
      name: "Horizon Scout Interceptor",
      role: "High-Velocity Recon & Tackle",
      img: "assets/img/ships/poc_scout_901.png",
      tagline: "Twin-thruster interceptor built to outrun gank squads, scout Red warp gates, and secure derelict wrecks first.",
      stats: { armor: 42, shield: 45, speed: 94, firepower: 46, cargo: 36 },
      craftCost: { credits: "3,600 Silver", scrap: "18 Alloy Scrap", ores: "30 Ferrite · 16 Argent" },
      zoneRec: "Yellow & Red Scouting"
    },
    {
      id: "craft_vanguard_corvette",
      tier: "TIER III",
      tierNum: 3,
      name: "Aegis Vanguard Corvette",
      role: "Twin-Railgun Skirmisher",
      img: "assets/img/ships/f1s1.png",
      tagline: "Forward-swept strike craft packing twin axial railguns and plasma afterburners for lethal small-gang PvP.",
      stats: { armor: 58, shield: 64, speed: 84, firepower: 70, cargo: 50 },
      craftCost: { credits: "8,500 Silver", scrap: "40 Alloy Scrap", ores: "48 Argent · 28 Aurum" },
      zoneRec: "Red Frontier Raids"
    },
    {
      id: "hull_destroyer",
      tier: "TIER IV",
      tierNum: 4,
      name: "Bastion Assault Destroyer",
      role: "Line-Breaker Escort",
      img: "assets/img/ships/f2s1.png",
      tagline: "Reinforced titanium bulkhead frame designed to absorb heavy pulse volleys while shredding hostile interceptors.",
      stats: { armor: 72, shield: 68, speed: 64, firepower: 78, cargo: 64 },
      craftCost: { credits: "14,500 Silver", scrap: "62 Alloy Scrap", ores: "60 Aurum · 30 Plasmite" },
      zoneRec: "Red & Outer Black Sectors"
    },
    {
      id: "craft_war_cruiser",
      tier: "TIER V",
      tierNum: 5,
      name: "Tempest Heavy War Cruiser",
      role: "Fleet Command & Siege",
      img: "assets/img/ships/f5s1.png",
      tagline: "Armored fleet anchor mounting crystallized Bionic Armor, Shield Matrix Mk.V, and sustained Heavy Railgun batteries.",
      stats: { armor: 84, shield: 82, speed: 54, firepower: 88, cargo: 78 },
      craftCost: { credits: "22,000 Silver", scrap: "85 Alloy Scrap", ores: "75 Aurum · 40 Plasmite" },
      zoneRec: "Black Void Fleet Battles"
    },
    {
      id: "craft_abyss_dreadnought",
      tier: "TIER VI",
      tierNum: 6,
      name: "Abyssal Dreadnought",
      role: "Full-Loot Capital Titan",
      img: "assets/img/ships/f8s1.png",
      tagline: "Colossal twin-prow capital hull forged from pure Voidite. Commands Black-Zone anomalies, World Bosses, and Guild citadels.",
      stats: { armor: 98, shield: 92, speed: 38, firepower: 97, cargo: 96 },
      craftCost: { credits: "55,000 Silver", scrap: "160 Alloy Scrap", ores: "100 Plasmite · 50 Voidite" },
      zoneRec: "Central Abyssal PK Core"
    },
    {
      id: "armada_sovereign",
      tier: "SOVEREIGN",
      tierNum: 7,
      name: "Sovereign Solar Flagship",
      role: "Armada Banner Showcase Hull",
      img: "assets/img/ships/fns6.png",
      tagline: "Gilded white-titanium flagship featuring an axial plasma lance core and ceremonial AetherForge livery.",
      stats: { armor: 95, shield: 98, speed: 62, firepower: 96, cargo: 88 },
      craftCost: { credits: "Sovereign Armada Banner", scrap: "30-Pull Hard Pity", ores: "Sovereign Seals & Armada Crests" },
      zoneRec: "All Frontiers & Arena"
    },
    {
      id: "armada_siege_carrier",
      tier: "CAPITAL",
      tierNum: 7,
      name: "Ironclad Twin-Hull Carrier",
      role: "Deep-Space Salvage & Siege",
      img: "assets/img/ships/ship9.png",
      tagline: "Twin-fuselage industrial warship bristling with flak batteries and reinforced salvage bays for extended Void expeditions.",
      stats: { armor: 96, shield: 85, speed: 44, firepower: 92, cargo: 100 },
      craftCost: { credits: "Guild Shipyard Blueprint", scrap: "Fleet Assembly", ores: "High-Grade Plasmite & Voidite" },
      zoneRec: "Black Zone Guild Ops"
    }
  ],

  frontiers: [
    {
      id: "Blue",
      name: "BLUE SAFE ZONES",
      count: 108,
      color: "#38e8ff",
      risk: "ZERO PVP LOSS",
      pvpRule: "Non-lethal protected space. Hostile player weapons are suppressed by Citadel Defense Relays.",
      ores: ["Ferrite Ore (T1)", "Argent Ore (T2)"],
      bounty: "1.0× Base Silver · Starter Contracts",
      cap: "100 Pilots / Sector",
      img: "assets/img/scenery/blue_ringed_gas_giant.png",
      desc: "Home to the primary orbital Citadels, Trade Exchanges, and Shipyard Foundries. Ideal for fitting ships, placing market orders, crafting T1–T2 gear, and preparing your fleet before jumping outward."
    },
    {
      id: "Yellow",
      name: "YELLOW CONTESTED ZONES",
      count: 112,
      color: "#f5c542",
      risk: "KNOCKDOWN PVP",
      pvpRule: "Flagged combat enabled — defeated ships suffer durability damage and warp-out, keeping fitted gear intact.",
      ores: ["Ferrite Ore (T1)", "Argent Ore (T2)", "Aurum Ore (T3)"],
      bounty: "1.6× Silver & Scrap · Rich Asteroid Belts",
      cap: "100 Pilots / Sector",
      img: "assets/img/scenery/yellow_cracked_mining_moon.png",
      desc: "Abandoned refineries and cracked mining moons contested by roaming raiders and rival pilots. Test PvP builds without risking hull destruction while farming T2–T3 crafting materials."
    },
    {
      id: "Red",
      name: "RED LETHAL FRONTIER",
      count: 76,
      color: "#ff4b6b",
      risk: "FULL-LOOT PVP",
      pvpRule: "Lethal open PvP. Destroyed vessels drop salvageable cargo and fittings into persistent wreckage fields.",
      ores: ["Aurum Ore (T3)", "Plasmite Ore (T4)"],
      bounty: "2.8× Silver · High-Tier Salvage & Boss Relics",
      cap: "100 Pilots / Sector",
      img: "assets/img/scenery/red_shattered_dreadnought.png",
      desc: "Shattered dreadnought graveyards and bleeding magma worlds where scouts watch every warp gate. High-risk expeditions yield Plasmite veins and elite blueprint salvage."
    },
    {
      id: "Black",
      name: "BLACK ABYSSAL VOID",
      count: 53,
      color: "#b47aff",
      risk: "UNRESTRICTED FULL-LOOT",
      pvpRule: "Zero Concord security. Free-fire open-world warfare, Guild territory clashes, and Central PK Core World Bosses.",
      ores: ["Plasmite Ore (T4)", "Voidite Ore (T5–T6)"],
      bounty: "4.5× Silver (+1,600S/Mob) · Voidite & Abyssal Loot",
      cap: "100 Pilots / Sector",
      img: "assets/img/scenery/black_dead_necropolis_planet.png",
      desc: "The deepest frontier surrounding the Abyssal Singularity. Home to Leviathan ruins, World Boss encounters, and Voidite deposits required to commission Tier VI Abyssal Dreadnoughts."
    }
  ],

  banners: [
    {
      id: "banner_silver_frontier",
      name: "FRONTIER SURPLUS CACHE",
      currency: "Silver (Free Earned)",
      cost1x: "3,200 Silver",
      cost10x: "28,800 Silver",
      pity: "20-Pull Hard Pity (Guaranteed T3 Module)",
      img: "assets/img/npcs/npc_forge_master.png",
      desc: "100% Silver-accessible supply cache stocked with T1–T3 Titanium Armor, Reactors, Fuel Cells, and Pulse Cannons."
    },
    {
      id: "banner_gold_arsenal",
      name: "SOVEREIGN ARSENAL BANNER",
      currency: "Gold",
      cost1x: "60 Gold",
      cost10x: "540 Gold",
      pity: "30-Pull Hard Pity (Guaranteed T5/T6 Masterpiece)",
      img: "assets/img/npcs/npc_grand_broker.png",
      desc: "High-grade combat arsenal featuring T3–T6 Bionic Armor, Heavy Railguns, and Crystallized Shield Generators."
    },
    {
      id: "banner_gold_armada",
      name: "SOVEREIGN ARMADA BANNER",
      currency: "Gold",
      cost1x: "120 Gold",
      cost10x: "1,080 Gold",
      pity: "30-Pull Hard Pity + Sovereign Armada Crests",
      img: "assets/img/npcs/npc_shipyard_admiral.png",
      desc: "Elite hull requisition banner awarding rare Armada Crests, Sovereign Flagship schematics, and top-tier tactical modules."
    }
  ],

  shopBundles: [
    {
      sku: "citadel_pack_starter",
      title: "FRONTIER STARTER PACK",
      inAppUsd: 1.99,
      priceUsd: 1.39,
      discountPct: 30,
      badge: "SAVE 30% · 1-TIME",
      highlight: false,
      icon: "assets/img/ships/poc_scout_901.png",
      gold: 180,
      seals: 30,
      perks: [
        "180 Gold Reserve (Instant Delivery)",
        "+30 Sovereign Seals (◊)",
        "50,000 Silver + 150 Alloy Scrap",
        "7-Day Citadel Premium Status",
        "T2 Scout Interceptor Hull + 5× T3 Repair Kits"
      ]
    },
    {
      sku: "citadel_vip_pass_30d",
      title: "30-DAY CITADEL PREMIUM PASS",
      inAppUsd: 14.99,
      priceUsd: 10.49,
      discountPct: 30,
      badge: "BEST SELLER · -30% WEB",
      highlight: true,
      icon: "assets/img/scenery/citadel_dyson_halo.png",
      gold: 0,
      seals: 180,
      perks: [
        "+50% Silver, EXP & Ore Mining Yield",
        "Market Tax Reduced to 4% + +1,000 Focus/Day",
        "60 Gold/Day Exchange Cap Unlocked",
        "+180 Sovereign Seals (◊) + 25,000 Silver",
        "Sovereign Livery + 5× T2 Repair Kits"
      ]
    },
    {
      sku: "citadel_pack_commander",
      title: "ARMADA COMMANDER BUNDLE",
      inAppUsd: 29.99,
      priceUsd: 20.99,
      discountPct: 30,
      badge: "SAVE $9.00 · 1-TIME",
      highlight: false,
      icon: "assets/img/ships/f1s1.png",
      gold: 1200,
      seals: 240,
      perks: [
        "1,200 Gold Reserve (Instant Delivery)",
        "+240 Sovereign Seals (◊)",
        "180,000 Silver + 500 Alloy Scrap",
        "30-Day Citadel Premium + Sovereign Livery",
        "T3 Vanguard Corvette Hull + 10× T4 XL Kits"
      ]
    }
  ],

  goldPacks: [
    { sku: "citadel_gold_60", title: "POUCH OF GOLD", inAppUsd: 0.99, priceUsd: 0.69, discountPct: 30, baseGold: 60, repeatBonus: 0, seals: 10, badge: "STARTER · -30% WEB" },
    { sku: "citadel_gold_300", title: "CACHE OF GOLD", inAppUsd: 4.99, priceUsd: 3.49, discountPct: 30, baseGold: 300, repeatBonus: 30, seals: 50, badge: "-30% WEB · +10% REPEAT" },
    { sku: "citadel_gold_600", title: "STRONGHOLD CHEST", inAppUsd: 9.99, priceUsd: 6.99, discountPct: 30, baseGold: 600, repeatBonus: 90, seals: 110, badge: "-30% WEB · +15% REPEAT" },
    { sku: "citadel_gold_1500", title: "CITADEL VAULT", inAppUsd: 24.99, priceUsd: 17.49, discountPct: 30, baseGold: 1500, repeatBonus: 300, seals: 280, badge: "POPULAR · SAVE $7.50", popular: true },
    { sku: "citadel_gold_3200", title: "WARLORD TREASURY", inAppUsd: 49.99, priceUsd: 34.99, discountPct: 30, baseGold: 3200, repeatBonus: 800, seals: 600, badge: "SAVE $15.00 · +25% REPEAT" },
    { sku: "citadel_gold_6500", title: "SOVEREIGN MINT", inAppUsd: 99.99, priceUsd: 69.99, discountPct: 30, baseGold: 6500, repeatBonus: 1950, seals: 1300, badge: "MAX VALUE · SAVE $30.00" }
  ],

  news: [
    {
      id: "patch-2026-11-20",
      date: "NOV 20, 2026",
      tag: "SERVER UPDATE",
      title: "Full Server Authority, Authenticated UDP Tickets & Anti-Cheat Live on AETHER-01",
      excerpt: "Every Citadel Foundry craft, Gacha pull, Quest milestone, P2P Trade, PvE mob kill, and UDP sector join is now 100% server-validated on our global cloud shard.",
      img: "assets/img/scenery/citadel_dyson_halo.png",
      body: [
        "The latest authoritative UnboundSuns.Server build is now live on our global shard, bringing end-to-end cryptographic UDP ticket handshakes, server-side PvE mob health tracking, and real-time movement anomaly enforcement.",
        "Every pilot entering Open World space now authenticates through PBKDF2-hardened account credentials and receives a single-use UDP join ticket before entering any of the 349 sectors.",
        "Double-entry SQLite ledger auditing guarantees zero item duplication across Player Trading, Market OrderBooks, Guild Vault transfers, and Foundry crafting."
      ]
    },
    {
      id: "zone-cap-100",
      date: "NOV 19, 2026",
      tag: "DESIGN BRIEF",
      title: "Albion-Style 100-Pilot Sector Cap & Smooth Overcrowding Protection",
      excerpt: "To preserve crisp 20Hz fleet combat and zero rubber-banding during mega-guild clashes, each sector enforces a strict 100-pilot hard ceiling.",
      img: "assets/img/keyart/warfare_banner.jpg",
      body: [
        "Large-scale full-loot battles are the heart of Unbound Suns, but unbounded crowds degrade simulation fidelity. Starting with this release, every sector enforces a deterministic 100-pilot ceiling.",
        "When a zone reaches capacity, inbound pilots attempting to warp across a jump gate receive an instant Sector Overcrowded alert and safely remain in their departure sector until slots open.",
        "Server-side stealth culling also prevents wallhack clients from ever receiving coordinates of cloaked scouts."
      ]
    },
    {
      id: "closed-beta-2026",
      date: "NOV 18, 2026",
      tag: "ROADMAP",
      title: "Global Closed Beta Recruitment & Cross-Platform Playtest Program",
      excerpt: "Android & Windows PC pilots share a single persistent universe. Join Closed Beta to stress-test Black-Zone Dreadnought sieges and earn Pioneer honors.",
      img: "assets/img/scenery/black_abyssal_singularity.png",
      body: [
        "Unbound Suns operates strictly as a persistent online-only universe shared across Android and Windows PC clients.",
        "Pioneer Closed Beta waves are rolling out internationally via Google Play Closed Testing (excluding restricted territories) and direct PC Playtest packages.",
        "All verified bug reports submitted through the in-game Feedback panel or Pilot Support Center go directly to the core engineering team."
      ]
    }
  ],

  faqs: [
    {
      q: "Is Unbound Suns truly online-only and single-shard?",
      a: "Yes. Unbound Suns is built strictly as a persistent online-only open-world MMORPG. All 349 sectors, player markets, guild vaults, and fleet battles run on authoritative 20Hz servers with zero offline save-editing exploits."
    },
    {
      q: "How do the four security zones (Blue, Yellow, Red, Black) work?",
      a: "Blue zones (108 sectors) are completely safe for trading and crafting. Yellow zones (112 sectors) feature non-lethal knockdown PvP. Red (76 sectors) and Black Abyssal zones (53 sectors) are full-loot PvP frontiers with massively higher Silver bounties and rare Plasmite/Voidite ores."
    },
    {
      q: "What happens if a sector is full during a large guild battle?",
      a: "Each sector supports up to 100 simultaneous pilots to guarantee smooth 20Hz combat. If a destination sector is at 100/100 capacity, the jump gate notifies you that the sector is overcrowded and keeps your ship safely in your current sector."
    },
    {
      q: "How does the Official Web Shop relate to Google Play?",
      a: "Our standalone Web Shop operates independently outside Google Play for global international players (USD, excluding Vietnam and restricted territories). Purchases credit directly to your shared Unbound Suns server account and sync automatically when you log in on any supported platform."
    },
    {
      q: "Are gacha and loot drop rates transparent?",
      a: "Yes. All three Citadel Banners use server-side cryptographic RNG with fixed hard-pity guarantees (20 pulls on the free Silver Frontier Surplus Cache; 30 pulls on both Gold Sovereign Banners)."
    },
    {
      q: "How do I request deletion of my Pilot Account and data?",
      a: "You can request permanent deletion of your Pilot Account and economy records at any time via the in-game Feedback panel or by following the instructions on our Privacy Policy & Data Deletion page. Verified requests are completed within 7 days."
    }
  ]
};
