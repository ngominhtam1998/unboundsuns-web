/**
 * Shared Navigation, Footer, Play Now Modal & Scroll Reveal across all pages.
 */
(function () {
  const cfg = window.UNBOUND_CONFIG || {};
  const page = document.body.dataset.page || "home";

  function navLink(href, label, id, extraClass = "") {
    const active = page === id ? "active" : "";
    return `<a href="${href}" class="${active} ${extraClass}".trim()>${label}</a>`;
  }

  function renderHeader() {
    const mount = document.getElementById("site-header");
    if (!mount) return;
    mount.innerHTML = `
      <header class="site-nav" id="main-nav">
        <div class="container nav-inner">
          <a href="index.html" class="brand-link" aria-label="Unbound Suns Home">
            <img src="assets/img/favicon.svg" alt="Unbound Suns Emblem" width="36" height="36" />
            <span>UNBOUND SUNS<small>AETHERFORGE INTERACTIVE</small></span>
          </a>
          <nav class="nav-links" aria-label="Primary">
            ${navLink("index.html#pillars", "Universe", "home")}
            ${navLink("index.html#atlas", "Star Atlas", "atlas")}
            ${navLink("index.html#fleet", "Fleet", "fleet")}
            ${navLink("index.html#news", "News", "news")}
            ${navLink("shop.html", "Web Shop", "shop", "shop-highlight")}
            ${navLink("account.html", "Pilot Portal", "account")}
            ${navLink("support.html", "Support", "support")}
          </nav>
          <div class="nav-actions">
            <a href="account.html" class="shard-pill" title="AETHER-01 Global Shard Status">
              <span class="shard-dot"></span>
              <span id="nav-shard-status">AETHER-01 · ONLINE</span>
            </a>
            <button type="button" class="btn btn-gold btn-sm" data-open-play>Play Now</button>
            <button type="button" class="mobile-toggle" id="mobile-toggle" aria-label="Toggle Menu" aria-expanded="false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M3 12h18M3 18h18"/>
              </svg>
            </button>
          </div>
        </div>
      </header>
      <div class="mobile-drawer" id="mobile-drawer">
        <a href="index.html">Home</a>
        <a href="index.html#atlas">349-Sector Star Atlas</a>
        <a href="index.html#fleet">Fleet Hangar</a>
        <a href="index.html#zones">Security Frontiers</a>
        <a href="shop.html" style="color:var(--gold-bright)">Official Web Shop (Global USD)</a>
        <a href="account.html">Pilot Command Portal</a>
        <a href="support.html">Support & FAQ</a>
        <a href="privacy.html">Privacy Policy & Data Deletion</a>
        <button type="button" class="btn btn-gold" data-open-play style="margin-top:8px">Deploy / Download</button>
      </div>
    `;

    const nav = document.getElementById("main-nav");
    const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const toggle = document.getElementById("mobile-toggle");
    const drawer = document.getElementById("mobile-drawer");
    if (toggle && drawer) {
      toggle.addEventListener("click", () => {
        const open = drawer.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
      drawer.querySelectorAll("a, button").forEach((el) => {
        el.addEventListener("click", () => {
          drawer.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  function renderFooter() {
    const mount = document.getElementById("site-footer");
    if (!mount) return;
    mount.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <a href="index.html" class="brand-link" style="margin-bottom:14px">
                <img src="assets/img/favicon.svg" alt="Unbound Suns" width="36" height="36" />
                <span>UNBOUND SUNS<small>AETHERFORGE INTERACTIVE</small></span>
              </a>
              <p style="color:var(--text-secondary);font-size:0.9rem;max-width:340px;margin:10px 0 16px">
                A strictly online, single-shard full-loot sci-fi sandbox MMORPG spanning 349 interconnected sectors, a 100% player-driven Citadel economy, and 20Hz server-authoritative space warfare.
              </p>
              <div class="rating-badge">
                <strong style="color:var(--gold-bright)">13+ / TEEN</strong>
                <span>Sci-Fi Combat · Online Interactions · In-Game Purchases</span>
              </div>
            </div>
            <div class="footer-col">
              <h4>Explore</h4>
              <ul>
                <li><a href="index.html#pillars">Universe Overview</a></li>
                <li><a href="index.html#atlas">349-Sector Star Atlas</a></li>
                <li><a href="index.html#fleet">Fleet Hangar</a></li>
                <li><a href="index.html#zones">Security Frontiers</a></li>
                <li><a href="index.html#news">Dev Dispatches</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Services</h4>
              <ul>
                <li><a href="shop.html">Official Web Shop (Global USD)</a></li>
                <li><a href="account.html">Pilot Command Portal</a></li>
                <li><a href="support.html">Support &amp; FAQ</a></li>
                <li><a href="#" data-open-play>Download Android / PC</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Legal &amp; Compliance</h4>
              <ul>
                <li><a href="privacy.html">Privacy Policy</a></li>
                <li><a href="privacy.html#data-deletion">Data Deletion Request</a></li>
                <li><a href="terms.html">Terms of Service</a></li>
                <li><a href="terms.html#anti-cheat">Fair Play &amp; Anti-Cheat Charter</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <div>&copy; ${new Date().getFullYear()} ${cfg.studio || "AetherForge Interactive"}. All rights reserved. Package ID: <code>${cfg.packageId || "com.aetherforge.unboundsuns"}</code></div>
            <div>Global International Release · Excluding Restricted Territories</div>
          </div>
        </div>
      </footer>
    `;
  }

  function renderPlayModal() {
    if (document.getElementById("play-modal")) return;
    const shard = cfg.shardInfo || {};
    const div = document.createElement("div");
    div.className = "modal-backdrop";
    div.id = "play-modal";
    div.setAttribute("role", "dialog");
    div.setAttribute("aria-modal", "true");
    div.setAttribute("aria-labelledby", "play-modal-title");
    div.innerHTML = `
      <div class="modal-dialog">
        <button type="button" class="modal-close" data-close-modal aria-label="Close">&times;</button>
        <div class="eyebrow gold" style="margin-bottom:8px">DEPLOY TO AETHER-01</div>
        <h2 id="play-modal-title" style="font-family:var(--font-display);margin:0 0 10px;font-size:1.5rem">CHOOSE YOUR DEPLOYMENT PLATFORM</h2>
        <p style="color:var(--text-secondary);font-size:0.94rem;margin:0 0 22px">
          Unbound Suns is a persistent online-only cross-platform universe. Your Pilot Account, fleet, Silver, Gold, and market orders sync seamlessly between Android and Windows PC.
        </p>
        <div style="display:grid;gap:14px;margin-bottom:22px">
          <div class="panel-box" style="padding:18px;border-color:rgba(56,232,255,0.34)">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
              <div>
                <strong style="font-family:var(--font-display);font-size:1.02rem;display:block">ANDROID (GOOGLE PLAY CLOSED BETA)</strong>
                <span style="color:var(--text-secondary);font-size:0.86rem">Android 12+ (ARM64) · Native Touch Controls · Google Play Billing</span>
              </div>
              <a href="support.html#beta-access" class="btn btn-cyan btn-sm">Join Closed Beta</a>
            </div>
          </div>
          <div class="panel-box" style="padding:18px;border-color:rgba(240,185,86,0.34)">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
              <div>
                <strong style="font-family:var(--font-display);font-size:1.02rem;display:block">WINDOWS PC (64-BIT CLIENT)</strong>
                <span style="color:var(--text-secondary);font-size:0.86rem">Windows 10/11 x64 · Full Mouse/Keyboard &amp; Wide Tactical HUD</span>
              </div>
              <a href="account.html" class="btn btn-gold btn-sm">Pilot Portal &amp; Access</a>
            </div>
          </div>
        </div>
        <div style="background:rgba(4,8,18,0.85);border:1px solid var(--border-subtle);border-radius:8px;padding:14px 16px;font-size:0.84rem;color:var(--text-secondary)">
          <strong style="color:var(--cyan);font-family:var(--font-tech);letter-spacing:0.12em">LIVE SHARD TELEMETRY SPECIFICATION</strong>
          <div style="margin-top:6px;display:grid;grid-template-columns:repeat(2,1fr);gap:6px">
            <div>Shard: <strong style="color:#fff">${shard.name || "AETHER-01"}</strong></div>
            <div>Tick Rate: <strong style="color:#fff">${shard.tickRate || "20 Hz UDP"}</strong></div>
            <div>Sectors: <strong style="color:#fff">${shard.sectorCount || 349} Connected</strong></div>
            <div>Zone Cap: <strong style="color:#fff">${shard.zonePilotCap || 100} Pilots / Zone</strong></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(div);

    const close = () => div.classList.remove("open");
    div.querySelector("[data-close-modal]").addEventListener("click", close);
    div.addEventListener("click", (e) => { if (e.target === div) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-open-play]");
      if (trigger) {
        e.preventDefault();
        div.classList.add("open");
      }
    });
  }

  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  }

  async function probeLiveShard() {
    if (!cfg.apiBase) return;
    try {
      const resp = await fetch(`${cfg.apiBase.replace(/\/$/, "")}/health`, { cache: "no-store" });
      if (!resp.ok) return;
      const h = await resp.json();
      const el = document.getElementById("nav-shard-status");
      if (el && h && h.openWorldUdp && h.openWorldUdp.running) {
        el.textContent = `SHARD ONLINE · ${h.openWorldUdp.peers} PILOTS · CAP ${h.openWorldUdp.maxPeersPerZone || 100}`;
      }
    } catch (_) {
      // Static fallback remains active when HTTPS API proxy is not yet bound
    }
  }

  renderHeader();
  renderFooter();
  renderPlayModal();
  initReveal();
  probeLiveShard();
})();
