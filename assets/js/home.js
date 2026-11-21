/**
 * Home Page Interactive Modules:
 * 1. Fleet Hangar Drydock Showcase
 * 2. Four Security Frontiers (Blue / Yellow / Red / Black) Switcher
 * 3. Citadel Sovereign Banners Grid
 * 4. Dev Dispatches / Patch Notes Reader Modal
 */
(function initHome() {
  const cat = window.UNBOUND_CATALOG;
  if (!cat) return;

  const SILVER_ICON = `<img src="assets/img/icons/silver_coin.png?v=20261121f" alt="Silver" title="Silver" class="silver-icon" />`;
  const GOLD_ICON = `<img src="assets/img/icons/gold_coin.png?v=20261121f" alt="Gold" title="Gold" class="gold-icon" />`;
  const ALLOY_ICON = `<img src="assets/img/icons/nano_alloy.png?v=20261121f" alt="Nano-Alloy" title="Nano-Alloy" class="alloy-icon" />`;
  const withCurrencyIcons = (text) => String(text)
    .replace(/\b([\d,]+)\s*Gold\b/g, `<span class="gold-amt">$1${GOLD_ICON}</span>`)
    .replace(/\b([\d,]+)\s*Silver\b/g, `<span class="silver-amt">$1${SILVER_ICON}</span>`)
    .replace(/\b([\d,]+)\s*(?:Nano-Alloy|Alloy)\b/g, `<span class="alloy-amt">$1${ALLOY_ICON}</span>`);

  // ---------- 1. Fleet Hangar ----------
  const fleetList = document.getElementById("fleet-list");
  const hangarStage = document.getElementById("hangar-stage");

  function renderShip(ship) {
    if (!hangarStage || !ship) return;
    const bars = [
      ["Hull Integrity", ship.stats.armor],
      ["Shield Matrix", ship.stats.shield],
      ["Cruise Velocity", ship.stats.speed],
      ["Weapon Output", ship.stats.firepower],
      ["Cargo Hold", ship.stats.cargo]
    ];
    hangarStage.innerHTML = `
      <div class="drydock-visual">
        <div class="drydock-ring outer"></div>
        <div class="drydock-ring"></div>
        <img src="${ship.img}" alt="${ship.name}" />
      </div>
      <div class="ship-dossier">
        <span class="ship-tier-badge">${ship.tier} · ${ship.zoneRec}</span>
        <h3>${ship.name}</h3>
        <div class="ship-role">${ship.role}</div>
        <p>${ship.tagline}</p>
        <div class="stat-bars">
          ${bars.map(([label, val]) => `
            <div>
              <div class="stat-row-head"><span>${label}</span><span>${val} / 100</span></div>
              <div class="stat-track"><div class="stat-fill" style="width:${val}%"></div></div>
            </div>
          `).join("")}
        </div>
        <div class="craft-box">
          <div class="craft-box-title">Citadel Foundry Acquisition</div>
          <div class="craft-meta">
            <div>Silver: <strong>${withCurrencyIcons(ship.craftCost.credits)}</strong></div>
            <div>Nano-Alloy: <strong>${withCurrencyIcons(ship.craftCost.scrap)}</strong></div>
            <div style="grid-column:1/-1">Materials: <strong>${ship.craftCost.ores}</strong></div>
          </div>
        </div>
      </div>
    `;
  }

  if (fleetList && hangarStage) {
    fleetList.innerHTML = cat.ships.map((s, idx) => `
      <button type="button" class="fleet-item ${idx === 2 ? "active" : ""}" data-ship-idx="${idx}">
        <img src="${s.img}" alt="${s.name}" loading="lazy" />
        <div>
          <small>${s.tier}</small>
          <strong>${s.name}</strong>
        </div>
      </button>
    `).join("");

    fleetList.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-ship-idx]");
      if (!btn) return;
      fleetList.querySelectorAll(".fleet-item").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderShip(cat.ships[Number(btn.dataset.shipIdx)]);
    });
    renderShip(cat.ships[2]); // Default spotlight: T3 Vanguard Corvette (fns1.png)
  }

  // ---------- 2. Four Security Frontiers ----------
  const frontierTabs = document.getElementById("frontier-tabs");
  const frontierPanel = document.getElementById("frontier-panel");

  function renderFrontier(f) {
    if (!frontierPanel || !f) return;
    frontierPanel.style.borderColor = `${f.color}55`;
    frontierPanel.innerHTML = `
      <div class="frontier-visual">
        <img src="${f.img}" alt="${f.name}" />
      </div>
      <div>
        <div class="dossier-pill" style="background:${f.color}22;border:1px solid ${f.color}88;color:${f.color}">
          ● ${f.risk} · ${f.count} SECTORS
        </div>
        <h3 style="margin:0 0 10px;font-family:var(--font-display);font-size:1.6rem">${f.name}</h3>
        <p style="color:var(--text-secondary);margin:0 0 12px">${f.desc}</p>
        <p style="color:#d6e6ff;font-size:0.93rem;margin:0;padding:12px 14px;border-left:3px solid ${f.color};background:rgba(255,255,255,0.03)">
          <strong>PvP Engagement Rule:</strong> ${f.pvpRule}
        </p>
        <div class="frontier-grid-meta">
          <div class="frontier-stat"><span>Native Ores</span><strong>${f.ores.join(" · ")}</strong></div>
          <div class="frontier-stat"><span>Bounty &amp; Salvage</span><strong>${withCurrencyIcons(f.bounty).replace(/\s*\|\s*/g, "<br />")}</strong></div>
          <div class="frontier-stat"><span>Zone Population Cap</span><strong>${f.cap}</strong></div>
          <div class="frontier-stat"><span>Active Sectors</span><strong>${f.count} Connected Nodes</strong></div>
        </div>
      </div>
    `;
  }

  if (frontierTabs && frontierPanel) {
    frontierTabs.innerHTML = cat.frontiers.map((f, idx) => `
      <button type="button" class="frontier-tab ${idx === 3 ? "active" : ""}" data-frontier-idx="${idx}" style="border-top:3px solid ${f.color}">
        <strong style="color:${f.color}">${f.name}</strong>
        <small>${f.count} Sectors · ${f.risk}</small>
      </button>
    `).join("");

    frontierTabs.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-frontier-idx]");
      if (!btn) return;
      frontierTabs.querySelectorAll(".frontier-tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderFrontier(cat.frontiers[Number(btn.dataset.frontierIdx)]);
    });
    renderFrontier(cat.frontiers[3]); // Showcase Black Abyssal Void by default
  }

  // ---------- 3. Sovereign Banners ----------
  const bannersGrid = document.getElementById("banners-grid");
  if (bannersGrid) {
    bannersGrid.innerHTML = cat.banners.map((b) => `
      <article class="banner-card">
        <div class="banner-head">
          <img src="${b.img}" alt="${b.name}" loading="lazy" />
          <div>
            <span>${b.currency}</span>
            <h3>${b.name}</h3>
          </div>
        </div>
        <p style="margin:0;color:var(--text-secondary);font-size:0.92rem;flex:1">${b.desc}</p>
        <div class="banner-specs">
          <div><span>Single Pull (1×)</span><strong>${withCurrencyIcons(b.cost1x)}</strong></div>
          <div><span>Multi Pull (10×)</span><strong>${withCurrencyIcons(b.cost10x)}</strong></div>
          <div><span>Server Hard Pity</span><strong style="color:var(--cyan)">${b.pity}</strong></div>
        </div>
      </article>
    `).join("");
  }

  // ---------- 4. Dev Dispatches & Article Modal ----------
  const newsGrid = document.getElementById("news-grid");
  const newsModal = document.getElementById("news-modal");
  const newsModalBody = document.getElementById("news-modal-body");

  if (newsGrid) {
    newsGrid.innerHTML = cat.news.map((n, idx) => {
      const contain = n.img.endsWith(".png") ? "contain" : "";
      return `
        <article class="news-card" data-news-idx="${idx}" tabindex="0">
          <div class="news-thumb">
            <img src="${n.img}" alt="${n.title}" class="${contain}" loading="lazy" />
          </div>
          <div class="news-body">
            <div class="news-meta"><span>${n.tag}</span><span>${n.date}</span></div>
            <h3>${n.title}</h3>
            <p>${n.excerpt}</p>
            <span class="news-read">Read Dispatch →</span>
          </div>
        </article>
      `;
    }).join("");

    const openArticle = (idx) => {
      const n = cat.news[idx];
      if (!n || !newsModal || !newsModalBody) return;
      newsModalBody.innerHTML = `
        <div class="eyebrow" style="margin-bottom:8px">${n.tag} · ${n.date}</div>
        <h2 style="font-family:var(--font-display);margin:0 0 16px;font-size:1.45rem">${n.title}</h2>
        ${n.body.map((p) => `<p style="color:var(--text-secondary);line-height:1.75">${p}</p>`).join("")}
      `;
      newsModal.classList.add("open");
    };

    newsGrid.addEventListener("click", (e) => {
      const card = e.target.closest("[data-news-idx]");
      if (card) openArticle(Number(card.dataset.newsIdx));
    });
    newsGrid.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        const card = e.target.closest("[data-news-idx]");
        if (card) { e.preventDefault(); openArticle(Number(card.dataset.newsIdx)); }
      }
    });

    if (newsModal) {
      const close = () => newsModal.classList.remove("open");
      newsModal.querySelector("[data-close-news]")?.addEventListener("click", close);
      newsModal.addEventListener("click", (e) => { if (e.target === newsModal) close(); });
    }
  }
})();
