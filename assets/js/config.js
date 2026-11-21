/**
 * UNBOUND SUNS — Central Portal & Tebex Headless Storefront Configuration
 * Edit this single file after attaching your custom domain, HTTPS API proxy,
 * and your personal Tebex Store Public Token + Package IDs.
 */
window.UNBOUND_CONFIG = {
  brand: "UNBOUND SUNS",
  studio: "AetherForge Interactive",
  packageId: "com.aetherforge.unboundsuns",
  supportEmail: "support@aetherforge-games.example",

  // Replace with your HTTPS API domain once SSL reverse proxy is enabled
  // e.g. "https://api.unboundsuns.com" -> proxies to 45.115.16.144:5188
  apiBase: "",

  // Exact topology synced with Assets/Resources/OpenWorld/map_manifest.json
  shardInfo: {
    name: "AETHER-01 GLOBAL SHARD",
    region: "Global Single-Shard (International)",
    tickRate: "20 Hz Authoritative UDP",
    matrixDims: "21×17 Matrix",
    sectorCount: 349,
    stationCount: 16,      // 11 Blue Safe Citadels + 5 Yellow Outpost Citadels
    landmarkCount: 24,     // 6 Portals + 6 Ore Belts + 6 Wrecks + 6 Boss Hazards
    zonePilotCap: 100,
    httpEndpoint: "http://45.115.16.144:5188",
    udpPort: 27777,
    protocolVersion: 2
  },

  links: {
    googlePlay: "#play-modal",
    discord: "https://discord.gg/",
    youtube: "https://youtube.com/",
    x: "https://x.com/",
    pcDownload: "#play-modal"
  },

  // Official Standalone Web Shop powered by TEBEX Headless API (Individual Account)
  // Fill in your Tebex Public Token & 9 numeric Package IDs from https://creator.tebex.io
  // Set mode: "live" to launch real Tebex Hosted Checkout (Visa/Mastercard/130+ global methods).
  tebex: {
    mode: "sandbox", // "sandbox" | "live"
    headlessApiBase: "https://headless.tebex.io/api",
    publicToken: "", // e.g. "t1234-abcdef1234567890..." (Creator Panel -> Integrations -> API Keys -> Public Token)
    webDiscountPercent: 30,
    currency: "USD",
    excludedRegions: ["VN"],
    // Map each UnboundSuns.Server SKU to its Tebex Package ID created in your personal Tebex Store
    packages: {
      citadel_pack_starter: "",
      citadel_vip_pass_30d: "",
      citadel_pack_commander: "",
      citadel_gold_60: "",
      citadel_gold_300: "",
      citadel_gold_600: "",
      citadel_gold_1500: "",
      citadel_gold_3200: "",
      citadel_gold_6500: ""
    }
  }
};
