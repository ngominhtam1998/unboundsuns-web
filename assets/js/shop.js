/**
 * Official Standalone Web Shop powered by TEBEX Headless API (Global USD · −30% vs In-App)
 * Live Flow:
 *   1. POST https://headless.tebex.io/api/accounts/{publicToken}/baskets (with custom: { pilot_id, sku })
 *   2. POST https://headless.tebex.io/api/baskets/{ident}/packages (with package_id, quantity: 1)
 *   3. Redirect pilot to Tebex Hosted Checkout (Visa, Mastercard, Apple Pay, Google Pay, 130+ methods)
 *   4. Tebex fires signed X-Signature webhook -> POST /api/billing/tebex/webhook on UnboundSuns.Server
 * Sandbox Flow (before publicToken & package IDs are filled in config.js):
 *   Interactive Tebex Basket & Webhook Checkout simulator so every SKU can be verified end-to-end.
 */
(function initTebexWebShop() {
  const cat = window.UNBOUND_CATALOG;
  const cfg = window.UNBOUND_CONFIG || {};
  const tebex = cfg.tebex || { mode: "sandbox", headlessApiBase: "https://headless.tebex.io/api", packages: {} };
  if (!cat) return;

  const bundlesEl = document.getElementById("shop-bundles");
  const goldEl = document.getElementById("shop-gold");
  const returnBanner = document.getElementById("tebex-return-banner");
  const firstTimeToggle = document.getElementById("first-time-toggle");
  const pilotInput = document.getElementById("pilot-bind-input");
  const pilotBtn = document.getElementById("pilot-bind-btn");
  const pilotState = document.getElementById("pilot-bind-state");
  const modal = document.getElementById("checkout-modal");
  const modalBody = document.getElementById("checkout-modal-body");

  let linkedPilot = localStorage.getItem("unboundsuns_webshop_pilot") || "";
  if (pilotInput && linkedPilot) pilotInput.value = linkedPilot;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // Handle Tebex complete_url / cancel_url return query params
  (function handleTebexReturnParams() {
    if (!returnBanner) return;
    const params = new URLSearchParams(window.location.search);
    const status = params.get("tebex");
    const sku = params.get("sku") || "";
    const pilot = params.get("pilot") || linkedPilot;
    if (status === "complete") {
      returnBanner.className = "status-msg show ok";
      returnBanner.innerHTML = `<strong>Tebex Checkout Completed!</strong> Order for <code>${escapeHtml(sku || "Citadel Package")}</code> is being credited automatically to Pilot <strong>${escapeHtml(pilot || "your account")}</strong> via verified Tebex Webhook. Log in to AETHER-01 to see your Gold &amp; Sovereign Seals.`;
    } else if (status === "cancel") {
      returnBanner.className = "status-msg show info";
      returnBanner.textContent = "Tebex checkout was cancelled — no charge was made. You can select another package anytime.";
    }
  })();

  function updatePilotBanner() {
    if (!pilotState) return;
    if (linkedPilot) {
      pilotState.innerHTML = `<span style="color:var(--green)">● Linked Pilot: <strong>${escapeHtml(linkedPilot)}</strong></span>`;
    } else {
      pilotState.innerHTML = `<span style="color:var(--text-muted)">Enter your in-game Pilot Username or Account ID for automated Tebex Webhook delivery.</span>`;
    }
  }

  if (pilotBtn && pilotInput) {
    pilotBtn.addEventListener("click", () => {
      const val = pilotInput.value.trim();
      if (!val || val.length < 3) {
        pilotState.innerHTML = `<span style="color:var(--red)">Please enter a valid Pilot Username or Account ID (min 3 characters).</span>`;
        return;
      }
      linkedPilot = val;
      localStorage.setItem("unboundsuns_webshop_pilot", linkedPilot);
      updatePilotBanner();
    });
  }
  updatePilotBanner();

  const SILVER_ICON = `<img src="assets/img/icons/silver_coin.png?v=20261121f" alt="Silver" title="Silver" class="silver-icon" />`;
  const GOLD_ICON = `<img src="assets/img/icons/gold_coin.png?v=20261121f" alt="Gold" title="Gold" class="gold-icon" />`;
  const ALLOY_ICON = `<img src="assets/img/icons/nano_alloy.png?v=20261121f" alt="Nano-Alloy" title="Nano-Alloy" class="alloy-icon" />`;

  function formatPerkCurrency(str) {
    return String(str)
      .replace(/\b([\d,]+)\s*Gold\b/g, `<span class="gold-amt">$1${GOLD_ICON}</span>`)
      .replace(/\b([\d,]+)\s*Silver\b/g, `<span class="silver-amt">$1${SILVER_ICON}</span>`)
      .replace(/\b([\d,]+)\s*Nano-Alloy\b/g, `<span class="alloy-amt">$1${ALLOY_ICON}</span>`);
  }

  function renderBundles() {
    if (!bundlesEl) return;
    bundlesEl.innerHTML = cat.shopBundles.map((b) => {
      const saved = (b.inAppUsd - b.priceUsd).toFixed(2);
      return `
        <article class="shop-card ${b.highlight ? "featured" : ""}">
          <span class="shop-badge">${b.badge}</span>
          <div class="shop-icon-wrap">
            <img src="${b.icon}" alt="${b.title}" loading="lazy" />
          </div>
          <h3>${b.title}</h3>
          <ul class="shop-perks">
            ${b.perks.map((p) => `<li>${formatPerkCurrency(p)}</li>`).join("")}
          </ul>
          <div class="shop-footer">
            <div>
              <div class="price-compare">
                <span class="price-old">$${b.inAppUsd.toFixed(2)}</span>
                <span class="price-save">−${b.discountPct}% · SAVE $${saved}</span>
              </div>
              <div class="shop-price">$${b.priceUsd.toFixed(2)} <span style="font-size:0.75rem;color:var(--text-muted)">USD</span></div>
            </div>
            <button type="button" class="btn ${b.highlight ? "btn-gold" : "btn-cyan"} btn-sm" data-buy-sku="${b.sku}">Checkout via Tebex</button>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderGoldPacks() {
    if (!goldEl) return;
    const isFirst = !firstTimeToggle || firstTimeToggle.checked;

    goldEl.innerHTML = cat.goldPacks.map((g) => {
      const bonusGold = isFirst ? g.baseGold : g.repeatBonus;
      const totalGold = g.baseGold + bonusGold;
      const saved = (g.inAppUsd - g.priceUsd).toFixed(2);
      const bonusLabel = isFirst
        ? `2× FIRST-TIME BONUS (+${g.baseGold.toLocaleString()} GOLD)`
        : (g.repeatBonus > 0 ? `+${g.repeatBonus.toLocaleString()} REPEAT BONUS GOLD` : `STANDARD TOP-UP RESERVE`);

      return `
        <article class="shop-card ${g.popular ? "featured" : ""}">
          <span class="shop-badge">${g.badge}</span>
          <div class="gold-amount">${totalGold.toLocaleString()} <img src="assets/img/icons/gold_coin.png?v=20261121f" alt="Gold" title="Gold" class="gold-icon" style="width:24px;height:24px;vertical-align:-4px" /> <span style="font-size:1rem;color:var(--gold)">GOLD</span></div>
          <div class="gold-bonus-line">${bonusLabel}</div>
          <div class="gold-seals-line">Base ${g.baseGold.toLocaleString()} Gold · Includes <strong style="color:#fff">+${g.seals.toLocaleString()} Sovereign Seals (◊)</strong></div>
          <div style="font-family:var(--font-display);font-size:0.95rem;color:var(--text-secondary);margin-bottom:16px">${g.title}</div>
          <div class="shop-footer" style="margin-top:auto">
            <div>
              <div class="price-compare">
                <span class="price-old">$${g.inAppUsd.toFixed(2)}</span>
                <span class="price-save">−${g.discountPct}% · SAVE $${saved}</span>
              </div>
              <div class="shop-price">$${g.priceUsd.toFixed(2)}</div>
            </div>
            <button type="button" class="btn ${g.popular ? "btn-gold" : "btn-cyan"} btn-sm" data-buy-sku="${g.sku}">Checkout via Tebex</button>
          </div>
        </article>
      `;
    }).join("");
  }

  function getItemBySku(sku) {
    const bundle = cat.shopBundles.find((b) => b.sku === sku);
    const gold = cat.goldPacks.find((g) => g.sku === sku);
    const item = bundle || gold;
    if (!item) return null;
    const isFirst = !firstTimeToggle || firstTimeToggle.checked;
    const deliverySummary = bundle
      ? bundle.perks.join(" · ")
      : `${(gold.baseGold + (isFirst ? gold.baseGold : gold.repeatBonus)).toLocaleString()} Total Gold + ${gold.seals.toLocaleString()} Sovereign Seals (◊)`;
    const tebexPackageId = (tebex.packages && tebex.packages[sku]) || "";
    const isLiveReady = tebex.mode === "live" && !!tebex.publicToken && !!tebexPackageId;
    return { item, bundle, gold, deliverySummary, tebexPackageId, isLiveReady, saved: (item.inAppUsd - item.priceUsd).toFixed(2) };
  }

  function openCheckout(sku) {
    if (!modal || !modalBody) return;
    const ctx = getItemBySku(sku);
    if (!ctx) return;
    const { item, deliverySummary, isLiveReady, saved } = ctx;

    modalBody.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;padding-right:46px">
        <div class="eyebrow gold">TEBEX GLOBAL CHECKOUT</div>
        <span class="card-brand-pill">${isLiveReady ? "TEBEX LIVE" : "TEBEX SANDBOX"}</span>
      </div>

      ${!isLiveReady ? `
        <div class="status-msg info show" style="margin-top:0;margin-bottom:16px;font-size:0.84rem">
          <strong>Tebex Headless Integration Ready:</strong> Paste your personal Tebex <code>publicToken</code> + 9 Package IDs in <code>assets/js/config.js</code> and set <code>mode: "live"</code> to redirect straight to Tebex Hosted Checkout (Visa / Mastercard / Apple Pay / 130+ methods with free Chargeback Protection).
        </div>
      ` : ""}

      <div class="panel-box" style="padding:16px;margin-bottom:16px;border-color:rgba(240,185,86,0.34)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap">
          <div>
            <strong style="font-family:var(--font-display);font-size:1.08rem;display:block">${item.title}</strong>
            <span style="font-size:0.84rem;color:var(--text-secondary)">Server SKU: <code>${item.sku}</code></span>
          </div>
          <div style="text-align:right">
            <div class="price-compare" style="justify-content:flex-end">
              <span class="price-old">$${item.inAppUsd.toFixed(2)}</span>
              <span class="price-save">SAVE $${saved} (−30%)</span>
            </div>
            <div style="font-family:var(--font-display);font-size:1.45rem;font-weight:900;color:var(--gold-bright)">$${item.priceUsd.toFixed(2)} USD</div>
          </div>
        </div>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(116,178,255,0.12);font-size:0.85rem;color:var(--text-secondary)">
          <strong style="color:var(--cyan)">Fulfillment:</strong> ${deliverySummary}
        </div>
      </div>

      <div id="co-stage">
        <form id="tebex-checkout-form" novalidate>
          <div class="co-grid-2">
            <div class="form-group">
              <label for="co-pilot">Target Pilot Username / Account ID *</label>
              <input id="co-pilot" type="text" required placeholder="e.g. CommanderVance" value="${escapeHtml(linkedPilot)}" />
              <div class="field-err" id="err-pilot"></div>
            </div>
            <div class="form-group">
              <label for="co-email">Receipt Email (Optional)</label>
              <input id="co-email" type="email" placeholder="pilot@example.com" />
              <div class="field-err" id="err-email"></div>
            </div>
          </div>

          <div class="panel-box" style="padding:14px;margin-bottom:14px;background:rgba(4,9,20,0.75)">
            <div style="font-family:var(--font-tech);font-size:0.78rem;letter-spacing:0.14em;color:var(--cyan);margin-bottom:8px">HOSTED BY TEBEX (PCI-DSS LEVEL 1 · ZERO CARD DATA ON GAME SERVER)</div>
            <div class="visa-badges">
              <span class="visa-badge">VISA</span>
              <span class="visa-badge">MASTERCARD</span>
              <span class="visa-badge">APPLE PAY</span>
              <span class="visa-badge">GOOGLE PAY</span>
              <span class="visa-badge">PAYSAFECARD</span>
              <span class="visa-badge">+130 METHODS</span>
            </div>
          </div>

          <label style="display:flex;align-items:flex-start;gap:10px;font-size:0.86rem;color:var(--text-secondary);margin:8px 0 16px;cursor:pointer">
            <input id="co-agree" type="checkbox" style="margin-top:3px;accent-color:var(--gold)" checked />
            <span>I confirm I am located outside restricted regions (Vietnam excluded) and accept the <a href="terms.html" target="_blank" style="color:var(--cyan);text-decoration:underline">Terms of Service</a>.</span>
          </label>

          <div id="co-error" class="status-msg err" style="margin:0 0 14px"></div>

          <button type="submit" class="btn btn-gold" style="width:100%" id="co-submit-btn">
            ${isLiveReady ? `Continue to Tebex Hosted Checkout ($${item.priceUsd.toFixed(2)} USD)` : `Simulate Tebex Basket & Checkout ($${item.priceUsd.toFixed(2)} USD)`}
          </button>

          <div style="margin-top:12px;text-align:center;font-size:0.79rem;color:var(--text-muted)">
            Merchant of Record: Tebex Limited · Automated HMAC-SHA256 Webhook Fulfillment to AETHER-01
          </div>
        </form>
      </div>
    `;

    modal.classList.add("open");
    wireTebexForm(ctx);
  }

  function wireTebexForm(ctx) {
    const form = document.getElementById("tebex-checkout-form");
    if (!form) return;

    const elPilot = document.getElementById("co-pilot");
    const elEmail = document.getElementById("co-email");
    const elAgree = document.getElementById("co-agree");
    const elErr = document.getElementById("co-error");
    const elBtn = document.getElementById("co-submit-btn");

    const showErr = (msg) => {
      if (!elErr) return;
      elErr.className = "status-msg show err";
      elErr.textContent = msg;
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      form.querySelectorAll(".field-err").forEach((el) => (el.textContent = ""));
      if (elErr) { elErr.className = "status-msg err"; elErr.textContent = ""; }

      if (!elAgree.checked) {
        showErr("Please accept the Terms of Service and region confirmation to proceed.");
        return;
      }

      const pilot = elPilot.value.trim();
      const email = elEmail.value.trim();
      if (pilot.length < 3) {
        const ep = document.getElementById("err-pilot");
        if (ep) ep.textContent = "Target Pilot Username / Account ID is required (min 3 characters).";
        return;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const ee = document.getElementById("err-email");
        if (ee) ee.textContent = "Invalid email format.";
        return;
      }

      linkedPilot = pilot;
      localStorage.setItem("unboundsuns_webshop_pilot", linkedPilot);
      if (pilotInput) pilotInput.value = linkedPilot;
      updatePilotBanner();

      // LIVE TEBEX HEADLESS API FLOW (Official 2-step Basket -> Package -> Hosted Checkout URL)
      if (ctx.isLiveReady) {
        elBtn.disabled = true;
        elBtn.textContent = "Creating Secure Tebex Basket…";
        try {
          const base = (tebex.headlessApiBase || "https://headless.tebex.io/api").replace(/\/$/, "");
          const shopUrl = `${window.location.origin}${window.location.pathname}`;
          const basketRes = await fetch(`${base}/accounts/${encodeURIComponent(tebex.publicToken)}/baskets`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              complete_url: `${shopUrl}?tebex=complete&sku=${encodeURIComponent(ctx.item.sku)}&pilot=${encodeURIComponent(pilot)}`,
              cancel_url: `${shopUrl}?tebex=cancel`,
              complete_auto_redirect: true,
              custom: { pilot_id: pilot, sku: ctx.item.sku, receipt_email: email || "" }
            })
          });
          const basketJson = await basketRes.json();
          const ident = basketJson?.data?.ident;
          if (!basketRes.ok || !ident) {
            throw new Error(basketJson?.detail || basketJson?.message || `Tebex basket failed (HTTP ${basketRes.status})`);
          }

          const addRes = await fetch(`${base}/baskets/${encodeURIComponent(ident)}/packages`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              package_id: ctx.tebexPackageId,
              quantity: 1,
              variable_data: { pilot_id: pilot, sku: ctx.item.sku }
            })
          });
          const addJson = await addRes.json();
          const checkoutUrl = addJson?.data?.links?.checkout;
          if (!addRes.ok || !checkoutUrl) {
            throw new Error(addJson?.detail || addJson?.message || `Tebex package add failed (HTTP ${addRes.status})`);
          }
          window.location.href = checkoutUrl;
        } catch (err) {
          elBtn.disabled = false;
          elBtn.textContent = `Continue to Tebex Hosted Checkout ($${ctx.item.priceUsd.toFixed(2)} USD)`;
          showErr(err.message || "Could not initialize Tebex checkout basket.");
        }
        return;
      }

      // SANDBOX PREVIEW: Show exact Tebex Headless Basket & Webhook Fulfillment simulation
      const now = new Date();
      const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
      const txId = `tbx-${ym}-${Math.floor(100000 + Math.random() * 900000)}`;
      const stage = document.getElementById("co-stage");
      if (!stage) return;
      stage.innerHTML = `
        <div class="panel-box" style="border-color:rgba(56,242,158,0.45);background:rgba(6,24,22,0.55)">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
            <div style="width:40px;height:40px;border-radius:50%;background:rgba(56,242,158,0.18);border:1px solid var(--green);display:flex;align-items:center;justify-content:center;color:var(--green);font-size:1.25rem;font-weight:900">✓</div>
            <div>
              <div style="font-family:var(--font-display);font-size:1.06rem;color:var(--green)">TEBEX BASKET SIMULATED (STAGING)</div>
              <div style="font-size:0.84rem;color:var(--text-secondary)">Ready for live redirect once <code>tebex.publicToken</code> is configured</div>
            </div>
          </div>
          <div class="dossier-rows" style="margin-bottom:14px">
            <div class="dossier-row"><span>Simulated Tebex Tx</span><strong><code>${txId}</code></strong></div>
            <div class="dossier-row"><span>Custom Metadata</span><strong><code>pilot_id=${escapeHtml(pilot)}</code></strong></div>
            <div class="dossier-row"><span>Fulfillment SKU</span><strong><code>${ctx.item.sku}</code></strong></div>
            <div class="dossier-row"><span>Webhook Target</span><strong><code>POST /api/billing/tebex/webhook</code></strong></div>
            <div class="dossier-row"><span>Direct Web Total</span><strong style="color:var(--gold-bright)">$${ctx.item.priceUsd.toFixed(2)} USD (Saved $${ctx.saved})</strong></div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button type="button" class="btn btn-gold btn-sm" id="co-done-btn">Done &amp; Return to Store</button>
            <button type="button" class="btn btn-ghost btn-sm" id="co-retry-btn">Back</button>
          </div>
        </div>
      `;
      document.getElementById("co-done-btn")?.addEventListener("click", () => modal.classList.remove("open"));
      document.getElementById("co-retry-btn")?.addEventListener("click", () => openCheckout(ctx.item.sku));
    });
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-buy-sku]");
    if (btn) openCheckout(btn.dataset.buySku);
  });

  if (modal) {
    const close = () => modal.classList.remove("open");
    modal.querySelector("[data-close-modal]")?.addEventListener("click", close);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  }

  firstTimeToggle?.addEventListener("change", renderGoldPacks);
  renderBundles();
  renderGoldPacks();
})();
