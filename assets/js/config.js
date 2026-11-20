/**
 * UNBOUND SUNS — Central Portal Configuration
 * Edit this single file after attaching your custom domain, HTTPS API proxy,
 * Google Play listing URL, and live Visa/Mastercard gateway / Merchant of Record.
 */
window.UNBOUND_CONFIG = {
  brand: "UNBOUND SUNS",
  studio: "AetherForge Interactive",
  packageId: "com.aetherforge.unboundsuns",
  supportEmail: "support@aetherforge-games.example",

  // Replace with your HTTPS API domain once SSL reverse proxy is enabled
  // e.g. "https://api.unboundsuns.com" -> proxies to 45.115.16.144:5188
  apiBase: "",

  // Direct shard endpoints shown in technical specs / Playtest modal
  shardInfo: {
    name: "AETHER-01 GLOBAL SHARD",
    region: "Global Single-Shard (International)",
    tickRate: "20 Hz Authoritative UDP",
    sectorCount: 349,
    stationCount: 24,
    zonePilotCap: 100,
    httpEndpoint: "http://45.115.16.144:5188",
    udpPort: 27777,
    protocolVersion: 2
  },

  // Update with official URLs once published
  links: {
    googlePlay: "#play-modal",
    discord: "https://discord.gg/",
    youtube: "https://youtube.com/",
    x: "https://x.com/",
    pcDownload: "#play-modal"
  },

  // Standalone Global USD Web Shop (Visa / Mastercard / JCB — ~30% cheaper than In-App Store)
  // mode: "sandbox" (interactive MSoftware-grade Visa/3DS sandbox) | "live" (live hosted checkout / API)
  webShop: {
    mode: "sandbox",
    webDiscountPercent: 30,
    currency: "USD",
    excludedRegions: ["VN"],
    liveCheckoutEndpoint: "", // e.g. "https://api.unboundsuns.com/api/webshop/visa/checkout"
    hostedCheckoutBaseUrl: "" // e.g. Xsolla / Stripe / Tebex hosted checkout URL
  }
};
