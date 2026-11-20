/**
 * Official Standalone Web Shop (Global USD · 30% Cheaper Direct on Web)
 * International Visa / Mastercard / JCB Checkout modeled on MSoftware CheckoutContent:
 * - All 9 official Citadel SKUs (~30% off vs In-App Store)
 * - Card validation (15-19 digits, cardholder name, future MM/YY expiry, 3-4 digit CVC)
 * - Interactive sandbox presets: Success (4242...), Declined (5200...), 3DS OTP (4000...)
 * - 3D Secure OTP Challenge Modal (123456 / 000000)
 * - Order Receipt Card + Idempotency-Key live API adapter for production switch
 */
(function initWebShop() {
  const cat = window.UNBOUND_CATALOG;
  const cfg = window.UNBOUND_CONFIG || {};
  const shopCfg = cfg.webShop || { mode: "sandbox", webDiscountPercent: 30 };
  if (!cat) return;

  const bundlesEl = document.getElementById("shop-bundles");
  const goldEl = document.getElementById("shop-gold");
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

  function detectCardBrand(raw) {
    const digits = raw.replace(/\D/g, "");
    if (/^4/.test(digits)) return "VISA";
    if (/^(5[1-5]|2[2-7])/.test(digits)) return "MASTERCARD";
    if (/^3[47]/.test(digits)) return "AMEX";
    if (/^35/.test(digits)) return "JCB";
    return "CARD";
  }

  function formatCardDigits(raw) {
    const digits = raw.replace(/\D/g, "").slice(0, 19);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  }

  function updatePilotBanner() {
    if (!pilotState) return;
    if (linkedPilot) {
      pilotState.innerHTML = `<span style="color:var(--green)">● Linked Pilot: <strong>${escapeHtml(linkedPilot)}</strong></span>`;
    } else {
      pilotState.innerHTML = `<span style="color:var(--text-muted)">Enter your in-game Pilot Username or Account ID for instant server delivery.</span>`;
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
            ${b.perks.map((p) => `<li>${p}</li>`).join("")}
          </ul>
          <div class="shop-footer">
            <div>
              <div class="price-compare">
                <span class="price-old">$${b.inAppUsd.toFixed(2)}</span>
                <span class="price-save">−${b.discountPct}% · SAVE $${saved}</span>
              </div>
              <div class="shop-price">$${b.priceUsd.toFixed(2)} <span style="font-size:0.75rem;color:var(--text-muted)">USD</span></div>
            </div>
            <button type="button" class="btn ${b.highlight ? "btn-gold" : "btn-cyan"} btn-sm" data-buy-sku="${b.sku}">Pay with Visa</button>
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
          <div class="gold-amount">${totalGold.toLocaleString()} <span style="font-size:1rem;color:var(--gold)">GOLD</span></div>
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
            <button type="button" class="btn ${g.popular ? "btn-gold" : "btn-cyan"} btn-sm" data-buy-sku="${g.sku}">Pay with Visa</button>
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
    return { item, bundle, gold, deliverySummary, saved: (item.inAppUsd - item.priceUsd).toFixed(2) };
  }

  function openCheckout(sku) {
    if (!modal || !modalBody) return;
    const ctx = getItemBySku(sku);
    if (!ctx) return;
    const { item, deliverySummary, saved } = ctx;
    const isSandbox = shopCfg.mode !== "live";

    modalBody.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;padding-right:46px">
        <div class="eyebrow gold">VISA / MASTERCARD DIRECT CHECKOUT</div>
        <span class="card-brand-pill" id="co-brand-pill">VISA</span>
      </div>

      ${isSandbox ? `
        <div class="status-msg info show" style="margin-top:0;margin-bottom:16px;font-size:0.84rem">
          <strong>Interactive Visa Sandbox Mode (MSoftware Engine):</strong> No real money charged. Test Success (<code>4242...</code>), Declined (<code>5200...</code>), and 3D Secure OTP (<code>4000...</code>, OTP <code>123456</code>). Switch <code>webShop.mode = "live"</code> in <code>config.js</code> once your merchant key is active.
        </div>
      ` : ""}

      <div class="panel-box" style="padding:16px;margin-bottom:16px;border-color:rgba(240,185,86,0.34)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap">
          <div>
            <strong style="font-family:var(--font-display);font-size:1.08rem;display:block">${item.title}</strong>
            <span style="font-size:0.84rem;color:var(--text-secondary)">SKU: <code>${item.sku}</code></span>
          </div>
          <div style="text-align:right">
            <div class="price-compare" style="justify-content:flex-end">
              <span class="price-old">$${item.inAppUsd.toFixed(2)}</span>
              <span class="price-save">SAVE $${saved} (-30%)</span>
            </div>
            <div style="font-family:var(--font-display);font-size:1.45rem;font-weight:900;color:var(--gold-bright)">$${item.priceUsd.toFixed(2)} USD</div>
          </div>
        </div>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(116,178,255,0.12);font-size:0.85rem;color:var(--text-secondary)">
          <strong style="color:var(--cyan)">Delivery:</strong> ${deliverySummary}
        </div>
      </div>

      <div id="co-stage">
        <form id="visa-checkout-form" novalidate>
          <div class="co-grid-2">
            <div class="form-group">
              <label for="co-pilot">Target Pilot Username / ID *</label>
              <input id="co-pilot" type="text" required placeholder="e.g. PilotVance_01" value="${escapeHtml(linkedPilot)}" />
              <div class="field-err" id="err-pilot"></div>
            </div>
            <div class="form-group">
              <label for="co-email">Receipt Email (Optional)</label>
              <input id="co-email" type="email" placeholder="pilot@example.com" />
              <div class="field-err" id="err-email"></div>
            </div>
          </div>

          ${isSandbox ? `
            <div class="preset-bar">
              <span style="font-family:var(--font-tech);font-size:0.78rem;letter-spacing:0.12em;color:var(--text-muted);text-transform:uppercase">Test Presets:</span>
              <button type="button" class="preset-btn" data-preset="success">Visa Success (4242...)</button>
              <button type="button" class="preset-btn" data-preset="declined">Declined (5200...)</button>
              <button type="button" class="preset-btn" data-preset="3ds">3DS OTP (4000...)</button>
            </div>
          ` : ""}

          <div class="form-group">
            <label for="co-card-num">Card Number (Visa / Mastercard / JCB / Amex) *</label>
            <input id="co-card-num" type="text" inputmode="numeric" autocomplete="cc-number" placeholder="4242 4242 4242 4242" value="${isSandbox ? "4242 4242 4242 4242" : ""}" />
            <div class="field-err" id="err-card-num"></div>
          </div>

          <div class="form-group">
            <label for="co-card-name">Cardholder Name *</label>
            <input id="co-card-name" type="text" autocomplete="cc-name" placeholder="ALEXANDER VANCE" value="${isSandbox ? "ALEXANDER VANCE" : ""}" />
            <div class="field-err" id="err-card-name"></div>
          </div>

          <div class="co-grid-2">
            <div class="form-group">
              <label for="co-card-exp">Expiry Date (MM/YY) *</label>
              <input id="co-card-exp" type="text" inputmode="numeric" autocomplete="cc-exp" placeholder="12/28" maxlength="5" value="${isSandbox ? "12/28" : ""}" />
              <div class="field-err" id="err-card-exp"></div>
            </div>
            <div class="form-group">
              <label for="co-card-cvc">CVC / CVV *</label>
              <input id="co-card-cvc" type="password" inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="4" value="${isSandbox ? "123" : ""}" />
              <div class="field-err" id="err-card-cvc"></div>
            </div>
          </div>

          <label style="display:flex;align-items:flex-start;gap:10px;font-size:0.86rem;color:var(--text-secondary);margin:8px 0 16px;cursor:pointer">
            <input id="co-agree" type="checkbox" style="margin-top:3px;accent-color:var(--gold)" checked />
            <span>I confirm I am located outside restricted regions (Vietnam excluded) and accept the <a href="terms.html" target="_blank" style="color:var(--cyan);text-decoration:underline">Terms of Service</a>.</span>
          </label>

          <div id="co-error" class="status-msg err" style="margin:0 0 14px"></div>

          <button type="submit" class="btn btn-gold" style="width:100%" id="co-submit-btn">
            Pay $${item.priceUsd.toFixed(2)} USD via Visa / Mastercard
          </button>

          <div style="margin-top:12px;text-align:center;font-size:0.79rem;color:var(--text-muted)">
            TLS 1.3 Encrypted · 3D Secure 2.0 Ready · Card numbers are never persisted on game servers.
          </div>
        </form>
      </div>
    `;

    modal.classList.add("open");
    wireCheckoutForm(ctx);
  }

  function wireCheckoutForm(ctx) {
    const form = document.getElementById("visa-checkout-form");
    if (!form) return;

    const elPilot = document.getElementById("co-pilot");
    const elEmail = document.getElementById("co-email");
    const elNum = document.getElementById("co-card-num");
    const elName = document.getElementById("co-card-name");
    const elExp = document.getElementById("co-card-exp");
    const elCvc = document.getElementById("co-card-cvc");
    const elAgree = document.getElementById("co-agree");
    const elErr = document.getElementById("co-error");
    const elBrand = document.getElementById("co-brand-pill");

    const clearErrs = () => {
      form.querySelectorAll(".field-err").forEach((el) => (el.textContent = ""));
      if (elErr) { elErr.className = "status-msg err"; elErr.textContent = ""; }
    };

    const setFieldErr = (id, msg) => {
      const el = document.getElementById(id);
      if (el) el.textContent = msg;
    };

    const showBannerErr = (msg) => {
      if (!elErr) return;
      elErr.className = "status-msg show err";
      elErr.textContent = msg;
    };

    elNum?.addEventListener("input", () => {
      elNum.value = formatCardDigits(elNum.value);
      if (elBrand) elBrand.textContent = detectCardBrand(elNum.value);
    });

    elExp?.addEventListener("input", () => {
      const d = elExp.value.replace(/\D/g, "").slice(0, 4);
      elExp.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
    });

    form.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        clearErrs();
        const kind = btn.dataset.preset;
        if (kind === "success") {
          elNum.value = "4242 4242 4242 4242";
          elName.value = "ALEXANDER VANCE";
          elExp.value = "12/28";
          elCvc.value = "123";
        } else if (kind === "declined") {
          elNum.value = "5200 0000 0000 1104";
          elName.value = "DECLINED TEST CARD";
          elExp.value = "12/28";
          elCvc.value = "111";
        } else if (kind === "3ds") {
          elNum.value = "4000 0025 0000 1001";
          elName.value = "3DS VERIFY PILOT";
          elExp.value = "12/28";
          elCvc.value = "123";
        }
        if (elBrand) elBrand.textContent = detectCardBrand(elNum.value);
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrs();

      if (!elAgree.checked) {
        showBannerErr("Please accept the Terms of Service and region confirmation to proceed.");
        return;
      }

      const pilot = elPilot.value.trim();
      const email = elEmail.value.trim();
      const cleanCard = elNum.value.replace(/\s+/g, "");
      const cardName = elName.value.trim();
      const cardExp = elExp.value.trim();
      const cardCvc = elCvc.value.trim();

      let ok = true;
      if (pilot.length < 3) {
        setFieldErr("err-pilot", "Target Pilot Username / ID is required (min 3 characters).");
        ok = false;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setFieldErr("err-email", "Invalid receipt email format.");
        ok = false;
      }
      if (!/^\d{15,19}$/.test(cleanCard)) {
        setFieldErr("err-card-num", "Invalid card number (15–19 digits required).");
        ok = false;
      }
      if (cardName.length < 3) {
        setFieldErr("err-card-name", "Cardholder name is required (min 3 characters).");
        ok = false;
      }
      const expMatch = cardExp.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
      if (!expMatch) {
        setFieldErr("err-card-exp", "Invalid expiry format (MM/YY, month 01–12).");
        ok = false;
      } else {
        const expMonth = parseInt(expMatch[1], 10);
        const expYear = 2000 + parseInt(expMatch[2], 10);
        const now = new Date();
        if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
          setFieldErr("err-card-exp", "Card has expired.");
          ok = false;
        }
      }
      if (!/^\d{3,4}$/.test(cardCvc)) {
        setFieldErr("err-card-cvc", "CVC must be 3 or 4 digits.");
        ok = false;
      }

      if (!ok) {
        showBannerErr("Please correct the highlighted card or account fields.");
        return;
      }

      linkedPilot = pilot;
      localStorage.setItem("unboundsuns_webshop_pilot", linkedPilot);
      if (pilotInput) pilotInput.value = linkedPilot;
      updatePilotBanner();

      // Live gateway branch (when user configures live Hosted Checkout or backend API)
      if (shopCfg.mode === "live") {
        if (shopCfg.hostedCheckoutBaseUrl) {
          const url = `${shopCfg.hostedCheckoutBaseUrl}?sku=${encodeURIComponent(ctx.item.sku)}&pilot=${encodeURIComponent(pilot)}&currency=USD`;
          window.open(url, "_blank", "noopener");
          return;
        }
        if (shopCfg.liveCheckoutEndpoint) {
          try {
            const idempKey = (crypto.randomUUID ? crypto.randomUUID() : `ord-${Date.now()}`);
            const resp = await fetch(shopCfg.liveCheckoutEndpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Idempotency-Key": idempKey
              },
              body: JSON.stringify({
                sku: ctx.item.sku,
                pilotId: pilot,
                email: email || undefined,
                expectedAmountUsd: ctx.item.priceUsd,
                currency: "USD"
              })
            });
            const data = await resp.json();
            if (!resp.ok) {
              showBannerErr(data.message || `Gateway error (HTTP ${resp.status}).`);
              return;
            }
            if (data.checkoutUrl) {
              window.location.href = data.checkoutUrl;
              return;
            }
            renderReceipt(ctx, pilot, `${detectCardBrand(cleanCard)} •••• ${cleanCard.slice(-4)} (Live Verified)`, data.orderId);
          } catch (_) {
            showBannerErr("Could not reach live payment endpoint. Check HTTPS API configuration.");
          }
          return;
        }
      }

      // MSoftware Sandbox Card Simulation Engine (Declined / 3DS OTP / Instant Success)
      const brand = detectCardBrand(cleanCard);
      const last4 = cleanCard.slice(-4);
      if (cleanCard.includes("1104") || cleanCard.includes("9170")) {
        showBannerErr("Transaction declined: Insufficient funds or card locked (Error Code: 51 - Insufficient Funds).");
        return;
      }
      if (cleanCard.includes("1001") || cleanCard.includes("1096")) {
        render3dsChallenge(ctx, pilot, brand, last4);
        return;
      }
      renderReceipt(ctx, pilot, `${brand} •••• ${last4} (Sandbox Approved)`);
    });
  }

  function render3dsChallenge(ctx, pilot, brand, last4) {
    const stage = document.getElementById("co-stage");
    if (!stage) return;
    stage.innerHTML = `
      <div class="panel-box" style="border-color:rgba(56,232,255,0.45);background:rgba(5,12,26,0.92)">
        <div class="eyebrow" style="margin-bottom:8px">3D SECURE 2.0 AUTHENTICATION</div>
        <h3 style="font-family:var(--font-display);margin:0 0 8px;font-size:1.15rem">Issuer Bank Verification (${brand} •••• ${last4})</h3>
        <p style="color:var(--text-secondary);font-size:0.9rem;margin:0 0 16px">
          Enter the 6-digit One-Time Passcode sent by your card issuer to authorize <strong>$${ctx.item.priceUsd.toFixed(2)} USD</strong>.
          (Sandbox test code: <code>123456</code> or <code>000000</code>)
        </p>
        <div class="form-group">
          <label for="co-otp-input">6-Digit 3DS OTP Code</label>
          <input id="co-otp-input" type="text" inputmode="numeric" maxlength="6" placeholder="123456" value="123456" />
          <div class="field-err" id="err-otp"></div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button type="button" class="btn btn-gold btn-sm" id="co-otp-confirm">Verify 3DS &amp; Complete Order</button>
          <button type="button" class="btn btn-ghost btn-sm" id="co-otp-cancel">Back to Card Form</button>
        </div>
      </div>
    `;

    document.getElementById("co-otp-confirm")?.addEventListener("click", () => {
      const code = (document.getElementById("co-otp-input")?.value || "").trim();
      if (code === "123456" || code === "000000") {
        renderReceipt(ctx, pilot, `${brand} •••• ${last4} (3D Secure Verified)`);
      } else {
        const err = document.getElementById("err-otp");
        if (err) err.textContent = "Invalid 3DS OTP code. Use 123456 or 000000 in Sandbox Mode.";
      }
    });

    document.getElementById("co-otp-cancel")?.addEventListener("click", () => openCheckout(ctx.item.sku));
  }

  function renderReceipt(ctx, pilot, methodLabel, customOrderId) {
    const stage = document.getElementById("co-stage");
    if (!stage) return;
    const now = new Date();
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const orderId = customOrderId || `UBS-${ym}-${Math.floor(100000 + Math.random() * 900000)}`;
    const timestamp = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";

    stage.innerHTML = `
      <div class="panel-box" style="border-color:rgba(56,242,158,0.45);background:rgba(6,24,22,0.55)">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          <div style="width:40px;height:40px;border-radius:50%;background:rgba(56,242,158,0.18);border:1px solid var(--green);display:flex;align-items:center;justify-content:center;color:var(--green);font-size:1.25rem;font-weight:900">✓</div>
          <div>
            <div style="font-family:var(--font-display);font-size:1.1rem;color:var(--green)">ORDER AUTHORIZED ${shopCfg.mode !== "live" ? "(SANDBOX)" : ""}</div>
            <div style="font-size:0.84rem;color:var(--text-secondary)">Queued for authoritative ledger credit on AETHER-01</div>
          </div>
        </div>
        <div class="dossier-rows" style="margin-bottom:16px">
          <div class="dossier-row"><span>Order Reference</span><strong><code>${orderId}</code></strong></div>
          <div class="dossier-row"><span>Timestamp</span><strong>${timestamp}</strong></div>
          <div class="dossier-row"><span>Payment Method</span><strong>${escapeHtml(methodLabel)}</strong></div>
          <div class="dossier-row"><span>Target Pilot</span><strong>${escapeHtml(pilot)}</strong></div>
          <div class="dossier-row"><span>Package SKU</span><strong>${ctx.item.title}</strong></div>
          <div class="dossier-row"><span>Web Total Paid</span><strong style="color:var(--gold-bright)">$${ctx.item.priceUsd.toFixed(2)} USD (Saved $${ctx.saved})</strong></div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button type="button" class="btn btn-gold btn-sm" id="co-done-btn">Done &amp; Return to Store</button>
          <button type="button" class="btn btn-ghost btn-sm" id="co-retry-btn">Test Another Card</button>
        </div>
      </div>
    `;

    document.getElementById("co-done-btn")?.addEventListener("click", () => modal.classList.remove("open"));
    document.getElementById("co-retry-btn")?.addEventListener("click", () => openCheckout(ctx.item.sku));
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
