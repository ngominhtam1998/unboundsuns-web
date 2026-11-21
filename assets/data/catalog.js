/**
 * Authentic Unbound Suns game catalog audited 1-to-1 against:
 * - Assets/Resources/OpenWorld/map_manifest.json
 * - Assets/Scripts/Domain/OpenWorld/Citadel/OpenWorldCitadelRules.cs
 * - Assets/Scripts/Domain/OpenWorld/OpenWorldPartyRules.cs
 * - Assets/Scripts/Gui/Combat/OpenWorldWorldMapRenderer.cs
 * - server/UnboundSuns.Server/GameStore.cs & GameStore.OnlineWorld.cs
 */
window.UNBOUND_CATALOG = {
  // Exact 5 playable progression hulls (Ship IDs 17, 901, 71, 73, 74)
  ships: [
    {
      id: "craft_frigate",
      shipId: 17,
      tier: "TIER I",
      tierNum: 1,
      name: "Frontier Frigate",
      role: "Starter Multi-Role Hull",
      img: "assets/img/ships/f1s1.png",
      tagline: "Reliable orbital workhorse designed for Blue-zone mining, early pirate contracts, and safe station hauling between Hearthwell and outer Citadels.",
      stats: { armor: 38, shield: 35, speed: 68, firepower: 38, cargo: 44 },
      craftCost: { credits: "2,400 Silver", scrap: "10 Alloy Scrap", ores: "No refined ores required" },
      zoneRec: "Blue Safe Sectors (108)"
    },
    {
      id: "craft_scout",
      shipId: 901,
      tier: "TIER II",
      tierNum: 2,
      name: "Scout Interceptor",
      role: "High-Velocity Recon & Salvage",
      img: "assets/img/ships/poc_scout_901.png",
      tagline: "High-thrust interceptor engineered to scout contested Yellow jump gates, outrun hostile gank squads, and claim derelict containers first.",
      stats: { armor: 44, shield: 48, speed: 95, firepower: 50, cargo: 38 },
      craftCost: { credits: "3,600 Silver", scrap: "18 Alloy Scrap", ores: "30 Ferrite · 16 Argent" },
      zoneRec: "Yellow Contested Sectors (112)"
    },
    {
      id: "craft_vanguard_corvette",
      shipId: 71,
      tier: "TIER III",
      tierNum: 3,
      name: "Vanguard Corvette",
      role: "Triple-Thruster Combat Skirmisher",
      img: "assets/img/ships/fns1.png",
      tagline: "Heavy-turret gunship with triple plasma drives and balanced shielding. Core frontline vessel for Red Lethal raids and small-gang PvP.",
      stats: { armor: 64, shield: 66, speed: 78, firepower: 74, cargo: 56 },
      craftCost: { credits: "8,500 Silver", scrap: "40 Alloy Scrap", ores: "48 Argent · 28 Aurum" },
      zoneRec: "Red Lethal Frontier (76)"
    },
    {
      id: "craft_war_cruiser",
      shipId: 73,
      tier: "TIER IV",
      tierNum: 4,
      name: "Heavy War Cruiser",
      role: "Axial Plasma Fleet Anchor",
      img: "assets/img/ships/fns6.png",
      tagline: "Gilded white-titanium cruiser built around an axial plasma lance core. Anchors guild battle lines across Black Void anomalies and World Boss hunts.",
      stats: { armor: 84, shield: 86, speed: 56, firepower: 88, cargo: 78 },
      craftCost: { credits: "22,000 Silver", scrap: "85 Alloy Scrap", ores: "75 Aurum · 40 Plasmite (or 45 Armada Crests)" },
      zoneRec: "Black Abyssal Void (53)"
    },
    {
      id: "craft_abyss_dreadnought",
      shipId: 74,
      tier: "TIER V",
      tierNum: 5,
      name: "Abyssal Dreadnought",
      role: "Apex Full-Loot Capital Warship",
      img: "assets/img/ships/fns7.png",
      tagline: "Six-thruster obsidian-and-crimson apex hull forged from pure Voidite. Commands the 3×3 Central PK Zone, Abyssal World Bosses, and guild warfare.",
      stats: { armor: 98, shield: 96, speed: 44, firepower: 99, cargo: 96 },
      craftCost: { credits: "55,000 Silver", scrap: "160 Alloy Scrap", ores: "100 Plasmite · 50 Voidite (or 90 Armada Crests)" },
      zoneRec: "3×3 Central PK Core (J8–L10)"
    }
  ],

  // Exact rules from OpenWorldMapRisk.cs, OpenWorldCitadelRules.cs & GameStore.OnlineWorld.cs
  frontiers: [
    {
      id: "Blue",
      name: "BLUE SAFE ZONES",
      count: 108,
      color: "#34b2ff",
      risk: "ZERO PVP LOSS · 11 CITADELS",
      pvpRule: "Fully protected Concord space. Hostile player weapons are disabled; dock at 11 Blue Citadels for Foundry crafting, OrderBook trading, and Personal Homestead access.",
      ores: ["Ferrite Ore (T1)"],
      bounty: "Mob: 120 Silver / 2 Scrap · Boss: 900 Silver / 15 Scrap",
      cap: "100 Pilots / Sector",
      img: "assets/img/scenery/blue_ringed_gas_giant.png",
      desc: "The outer ring of the 21×17 galactic matrix anchored by Hearthwell (A1). Safe for learning Newtonian drift flight, refining T1–T2 Titanium modules, and staging guild logistics."
    },
    {
      id: "Yellow",
      name: "YELLOW CONTESTED ZONES",
      count: 112,
      color: "#ffc026",
      risk: "KNOCKDOWN PVP · 5 CITADELS",
      pvpRule: "Non-lethal knockdown PvP: defeated ships take 8% gear durability loss and scatter 10% of carried ore, while keeping fitted modules and hull intact.",
      ores: ["Argent Ore (T2)", "Rich Yellow Ore Belts"],
      bounty: "Mob: 260 Silver / 4 Scrap · Boss: 2,200 Silver / 28 Scrap",
      cap: "100 Pilots / Sector",
      img: "assets/img/scenery/yellow_cracked_mining_moon.png",
      desc: "Contested mining moons and derelict refineries ringed around the middle frontier. Features 5 forward Outpost Citadels and high-yield Argent asteroid belts."
    },
    {
      id: "Red",
      name: "RED LETHAL FRONTIER",
      count: 76,
      color: "#ff3e44",
      risk: "FULL-LOOT PVP · NO CITADELS",
      pvpRule: "Lethal open PvP with zero safe docking stations. Destroyed hulls drop salvageable cargo and equipment into persistent wreckage fields.",
      ores: ["Aurum Ore (T3)", "High-Risk Shipwrecks"],
      bounty: "Mob: 520 Silver / 7 Scrap · Boss: 4,800 Silver / 50 Scrap",
      cap: "100 Pilots / Sector",
      img: "assets/img/scenery/red_shattered_dreadnought.png",
      desc: "Shattered dreadnought graveyards and magma worlds guarding the inner perimeter. Former stations here have been converted into Warp Portals, Rich Ore Belts, Shipwrecks, and Boss Hazards."
    },
    {
      id: "Black",
      name: "BLACK ABYSSAL VOID",
      count: 53,
      color: "#bc48ff",
      risk: "UNRESTRICTED FULL-LOOT · 3×3 PK CORE",
      pvpRule: "Total lawless space surrounding the 3×3 Central PK Zone (J8–L10, No-Party Free-For-All). Maximum Silver payouts, Voidite World Bosses, and guild warfare.",
      ores: ["Plasmite Ore (T4)", "Voidite Ore (T5 Boss Drop)"],
      bounty: "Mob: 1,600 Silver / 14 Scrap · Boss: 12,000 Silver / 95 Scrap",
      cap: "100 Pilots / Sector",
      img: "assets/img/scenery/black_dead_necropolis_planet.png",
      desc: "The innermost abyssal ring centered on the colossal 3×3 Central PK Zone with 12 entry ports. Source of Voidite and elite relics required to commission T5 Abyssal Dreadnoughts."
    }
  ],

  // Exact 3 Gacha Banners from OpenWorldCitadelRules.cs & GameStore.OnlineWorld.cs
  banners: [
    {
      id: "banner_silver_frontier",
      name: "FRONTIER SURPLUS CACHE",
      currency: "Silver (100% Free Earned)",
      cost1x: "3,200 Silver",
      cost10x: "28,800 Silver",
      pity: "20-Pull Hard Pity (Guaranteed T3+)",
      img: "assets/img/npcs/npc_forge_master.png",
      desc: "82% T1–T2 modules, 15% T3 modules, and 3% Warship Blueprint chance — all +0 fair base stats, zero Scrap cost."
    },
    {
      id: "banner_gold_arsenal",
      name: "SOVEREIGN ARSENAL BANNER",
      currency: "Gold",
      cost1x: "60 Gold",
      cost10x: "540 Gold",
      pity: "30-Pull Hard Pity (T5/T6 Masterpiece)",
      img: "assets/img/npcs/npc_grand_broker.png",
      desc: "High-tier combat hardware featuring T3–T6 Bionic Armor, Shield Generators, Fuel Cells, and Crystallized Heavy Railguns."
    },
    {
      id: "banner_gold_armada",
      name: "SOVEREIGN ARMADA BANNER",
      currency: "Gold",
      cost1x: "120 Gold",
      cost10x: "1,080 Gold",
      pity: "30-Pull Pity · 45 Crests T4 / 90 Crests T5",
      img: "assets/img/npcs/npc_shipyard_admiral.png",
      desc: "Warship requisition banner dropping T3 Vanguard Corvette, T4 Heavy War Cruiser, and T5 Abyssal Dreadnought plus guaranteed Armada Crests."
    }
  ],

  // Exact 9 official Citadel Store SKUs at -30% direct Web Shop pricing (Tebex Global USD)
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
      badge: "BEST SELLER · −30% WEB",
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
      icon: "assets/img/ships/fns1.png",
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
    { sku: "citadel_gold_60", title: "POUCH OF GOLD", inAppUsd: 0.99, priceUsd: 0.69, discountPct: 30, baseGold: 60, repeatBonus: 0, seals: 10, badge: "STARTER · −30% WEB" },
    { sku: "citadel_gold_300", title: "CACHE OF GOLD", inAppUsd: 4.99, priceUsd: 3.49, discountPct: 30, baseGold: 300, repeatBonus: 30, seals: 50, badge: "−30% WEB · +10% REPEAT" },
    { sku: "citadel_gold_600", title: "STRONGHOLD CHEST", inAppUsd: 9.99, priceUsd: 6.99, discountPct: 30, baseGold: 600, repeatBonus: 90, seals: 110, badge: "−30% WEB · +15% REPEAT" },
    { sku: "citadel_gold_1500", title: "CITADEL VAULT", inAppUsd: 24.99, priceUsd: 17.49, discountPct: 30, baseGold: 1500, repeatBonus: 300, seals: 280, badge: "POPULAR · SAVE $7.50", popular: true },
    { sku: "citadel_gold_3200", title: "WARLORD TREASURY", inAppUsd: 49.99, priceUsd: 34.99, discountPct: 30, baseGold: 3200, repeatBonus: 800, seals: 600, badge: "SAVE $15.00 · +25% REPEAT" },
    { sku: "citadel_gold_6500", title: "SOVEREIGN MINT", inAppUsd: 99.99, priceUsd: 69.99, discountPct: 30, baseGold: 6500, repeatBonus: 1950, seals: 1300, badge: "MAX VALUE · SAVE $30.00" }
  ],

  news: [
    {
      id: "patch-2026-11-21",
      date: "NOV 21, 2026",
      tag: "WEB SHOP & SECURITY",
      title: "Direct Tebex Global Web Shop (−30%) & Cryptographic Webhook Fulfillment",
      excerpt: "Unbound Suns now integrates Tebex Headless Checkout with 130+ international payment methods, zero-penalty chargeback protection, and automated server fulfillment.",
      img: "assets/img/scenery/citadel_dyson_halo.png",
      body: [
        "Players outside restricted regions can now top up Gold Reserves, the 30-Day Citadel Premium Pass, and one-time Armada Bundles at 30% below mobile store prices via our standalone Tebex-powered Web Shop.",
        "Every completed Tebex transaction is cryptographically verified on AETHER-01 via two-step SHA-256 + HMAC-SHA256 X-Signature validation before crediting double-entry SQLite ledger entries.",
        "First-time 2× Gold bonuses and Sovereign Seals (◊) apply identically across web and in-game purchases."
      ]
    },
    {
      id: "zone-cap-100",
      date: "NOV 20, 2026",
      tag: "SERVER AUTHORITY",
      title: "21×17 Galactic Matrix, 100-Pilot Zone Cap & Authenticated UDP Tickets",
      excerpt: "All 349 sectors—including the 3×3 No-Party Central PK Core—enforce authenticated UDP join tickets, server-owned PvE mob HP, and a 100-pilot ceiling per zone.",
      img: "assets/img/keyart/warfare_banner.jpg",
      body: [
        "To guarantee smooth 20Hz Newtonian combat during massive guild battles around Central PK Zone (J8–L10), every sector enforces a deterministic 100-pilot cap.",
        "Inbound pilots attempting to cross into a 100/100 full sector receive an immediate overcrowding alert and safely stay in their departure sector.",
        "All PvE mob kills, World Boss bounties (up to 12,000 Silver + Voidite in Black sectors), and ore mining claims are verified strictly server-side."
      ]
    },
    {
      id: "closed-beta-2026",
      date: "NOV 18, 2026",
      tag: "SANCTUARIES & CO-OP",
      title: "Personal Homesteads, Guild Sanctuaries & +12% Wingman Co-op Bonuses",
      excerpt: "Build your off-grid Automated Harvester Homestead, share loot through Guild Vaults, and deploy squadrons across 16 Citadels and 24 deep-space landmarks.",
      img: "assets/img/scenery/black_abyssal_singularity.png",
      body: [
        "Outside the 21×17 main matrix, pilots can warp to private Personal Homesteads with upgradable Automated Harvesters or rally inside shared Guild Sanctuaries.",
        "Flying in a party grants a +12% Co-op Bonus per wingman outside No-Party zones, encouraging coordinated Yellow/Red/Black raids.",
        "Cross-platform Closed Beta invites for Android 12+ and Windows 64-bit PC are now open via the Support Center."
      ]
    }
  ],

  faqs: [
    {
      q: "Is Unbound Suns strictly online-only and single-shard?",
      a: "Yes. Unbound Suns operates exclusively as a persistent online-only universe across all 349 sectors (21×17 Galactic Matrix), 16 Orbital Citadels, 24 tactical landmarks, and off-grid Personal Homesteads / Guild Sanctuaries."
    },
    {
      q: "What are the exact PvP loss rules across Blue, Yellow, Red, and Black zones?",
      a: "Blue zones (108 sectors, 11 Citadels) are 100% safe. Yellow zones (112 sectors, 5 Citadels) use knockdown PvP (8% durability loss and 10% carried ore scatter, fitted gear stays safe). Red (76 sectors) and Black (53 sectors + 3×3 No-Party Central PK Zone) are full-loot PvP frontiers."
    },
    {
      q: "How does the 100-pilot sector cap work?",
      a: "Every sector supports up to 100 simultaneous pilots to maintain smooth 20Hz authoritative flight. If a sector is full (100/100), jump gates notify you that the sector is overcrowded and keep your ship safely in your current sector."
    },
    {
      q: "How does the −30% Tebex Web Shop deliver Gold to my game account?",
      a: "Enter your Pilot Username or Account ID on shop.html and check out through Tebex (supporting Visa, Mastercard, Apple Pay, Google Pay, and 130+ international methods). Tebex sends a signed HMAC-SHA256 webhook directly to AETHER-01, instantly crediting your shared PC/Android account."
    },
    {
      q: "How do I earn ships without spending Gold?",
      a: "All 5 playable warship classes (T1 Frontier Frigate through T5 Abyssal Dreadnought) can be crafted deterministically at the Citadel Foundry using earned Silver, Alloy Scrap, and mined ores (Ferrite, Argent, Aurum, Plasmite, Voidite), or traded on the player market."
    },
    {
      q: "How do I request deletion of my Pilot Account and data?",
      a: "Submit a Data Deletion request via the in-game Feedback panel or our Support Center (including your Pilot Username/ID). Verified deletion requests are completed permanently within 7 calendar days."
    }
  ]
};
