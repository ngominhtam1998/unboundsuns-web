/**
 * Pilot Command Portal (account.html) & Support Center (support.html)
 * Connects cleanly to UnboundSuns.Server when HTTPS apiBase is configured in config.js.
 */
(function initAccountAndSupport() {
  const cfg = window.UNBOUND_CONFIG || {};
  const cat = window.UNBOUND_CATALOG || {};
  const apiBase = (cfg.apiBase || "").replace(/\/$/, "");

  function showMsg(el, cls, text) {
    if (!el) return;
    el.className = `status-msg show ${cls}`;
    el.textContent = text;
  }

  // ---------- Account Portal ----------
  const healthBox = document.getElementById("shard-health-box");
  if (healthBox) {
    if (!apiBase) {
      healthBox.innerHTML = `
        <div class="dossier-rows" style="margin-bottom:12px">
          <div class="dossier-row"><span>Global Shard</span><strong>${cfg.shardInfo.name}</strong></div>
          <div class="dossier-row"><span>Simulation Engine</span><strong>${cfg.shardInfo.tickRate}</strong></div>
          <div class="dossier-row"><span>Open World Topology</span><strong>${cfg.shardInfo.sectorCount} Sectors · ${cfg.shardInfo.stationCount} Stations</strong></div>
          <div class="dossier-row"><span>Sector Ceiling</span><strong>${cfg.shardInfo.zonePilotCap} Pilots / Zone</strong></div>
          <div class="dossier-row"><span>HTTPS API Bridge</span><strong style="color:var(--gold-bright)">Awaiting Custom Domain SSL</strong></div>
        </div>
        <div style="font-size:0.84rem;color:var(--text-muted)">
          Once your custom domain points an HTTPS reverse proxy (e.g. <code>https://api.yourdomain.com</code>) to <code>45.115.16.144:5188</code>, set <code>apiBase</code> in <code>assets/js/config.js</code> to enable live browser sign-in and live telemetry.
        </div>
      `;
    } else {
      fetch(`${apiBase}/health`, { cache: "no-store" })
        .then((r) => r.json())
        .then((h) => {
          const u = h.openWorldUdp || {};
          healthBox.innerHTML = `
            <div class="dossier-rows" style="margin-bottom:0">
              <div class="dossier-row"><span>Shard Status</span><strong style="color:var(--green)">ONLINE (Protocol v${h.protocol})</strong></div>
              <div class="dossier-row"><span>UDP OpenWorld :${u.port || 27777}</span><strong style="color:var(--green)">${u.running ? "RUNNING" : "OFFLINE"}</strong></div>
              <div class="dossier-row"><span>Active Pilots</span><strong>${u.peers ?? 0} Connected</strong></div>
              <div class="dossier-row"><span>Zone Pilot Cap</span><strong>${u.maxPeersPerZone ?? 100} / Sector</strong></div>
              <div class="dossier-row"><span>UDP Auth Ticket</span><strong>${u.requireAuthTicket ? "ENFORCED" : "OPTIONAL"}</strong></div>
            </div>
          `;
        })
        .catch(() => {
          healthBox.innerHTML = `<div class="status-msg show err">Could not reach live shard endpoint at <code>${apiBase}/health</code>.</div>`;
        });
    }
  }

  const authForm = document.getElementById("pilot-auth-form");
  const authMsg = document.getElementById("pilot-auth-msg");
  const profileOut = document.getElementById("pilot-profile-out");

  if (authForm) {
    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const mode = document.getElementById("auth-mode")?.value || "login";
      const username = (document.getElementById("auth-user")?.value || "").trim();
      const password = document.getElementById("auth-pass")?.value || "";

      if (username.length < 3 || password.length < 8) {
        showMsg(authMsg, "err", "Username must be at least 3 characters and password at least 8 characters.");
        return;
      }
      if (!apiBase) {
        showMsg(authMsg, "info", "Direct browser authentication activates automatically once your HTTPS API domain is configured in assets/js/config.js (browsers block HTTPS -> HTTP mixed-content calls). Players can log in directly from the Android / PC game client right now.");
        return;
      }

      showMsg(authMsg, "info", "Authenticating with AETHER-01 PBKDF2 Auth Server...");
      try {
        const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
        const resp = await fetch(`${apiBase}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });
        const data = await resp.json();
        if (!resp.ok) {
          showMsg(authMsg, "err", data.message || data.code || `Authentication rejected (HTTP ${resp.status}).`);
          return;
        }
        showMsg(authMsg, "ok", `Authenticated as ${data.displayName || username}! Loading authoritative pilot ledger...`);
        const meResp = await fetch(`${apiBase}/api/me`, {
          headers: { Authorization: `Bearer ${data.token}` }
        });
        const me = await meResp.json();
        if (profileOut && meResp.ok) {
          profileOut.innerHTML = `
            <div class="panel-box" style="margin-top:18px;border-color:rgba(56,242,158,0.4)">
              <div class="eyebrow" style="margin-bottom:8px">LIVE PILOT LEDGER</div>
              <div class="dossier-rows" style="margin-bottom:0">
                <div class="dossier-row"><span>Pilot ID</span><strong>${me.accountId}</strong></div>
                <div class="dossier-row"><span>Display Name</span><strong>${me.displayName}</strong></div>
                <div class="dossier-row"><span>Silver Credits</span><strong style="color:var(--cyan)">${Number(me.credits || 0).toLocaleString()}</strong></div>
                <div class="dossier-row"><span>Gold Reserve</span><strong style="color:var(--gold-bright)">${Number(me.gold || 0).toLocaleString()}</strong></div>
                <div class="dossier-row"><span>Station</span><strong>${me.station || "station_a"}</strong></div>
                <div class="dossier-row"><span>Inventory Items</span><strong>${(me.inventory || []).length} Unique SKUs</strong></div>
              </div>
            </div>
          `;
        }
      } catch (_) {
        showMsg(authMsg, "err", "Network error connecting to API server. Verify CORS and HTTPS configuration.");
      }
    });
  }

  // ---------- Support Center FAQ + Ticket Form ----------
  const faqMount = document.getElementById("faq-list");
  if (faqMount && cat.faqs) {
    faqMount.innerHTML = cat.faqs.map((f, idx) => `
      <div class="faq-item ${idx === 0 ? "open" : ""}">
        <button type="button" class="faq-q" aria-expanded="${idx === 0}">
          <span>${f.q}</span>
          <span style="color:var(--cyan);font-size:1.25rem">${idx === 0 ? "−" : "+"}</span>
        </button>
        <div class="faq-a">${f.a}</div>
      </div>
    `).join("");

    faqMount.addEventListener("click", (e) => {
      const btn = e.target.closest(".faq-q");
      if (!btn) return;
      const item = btn.parentElement;
      const open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      btn.lastElementChild.textContent = open ? "−" : "+";
    });
  }

  const supportForm = document.getElementById("support-form");
  const supportMsg = document.getElementById("support-msg");
  if (supportForm) {
    supportForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const category = document.getElementById("sup-cat")?.value || "bug";
      const pilot = (document.getElementById("sup-pilot")?.value || "").trim();
      const message = (document.getElementById("sup-msg")?.value || "").trim();
      if (!message || message.length < 10) {
        showMsg(supportMsg, "err", "Please describe your issue or request in at least 10 characters.");
        return;
      }

      if (apiBase) {
        try {
          const resp = await fetch(`${apiBase}/api/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              category,
              pilotName: pilot || "WebVisitor",
              zoneId: "web_portal",
              message
            })
          });
          if (resp.ok) {
            showMsg(supportMsg, "ok", "Dispatch received! Our support & engineering team has logged your ticket on the shard server.");
            supportForm.reset();
            return;
          }
        } catch (_) {
          // Fall through to mailto guidance
        }
      }

      const subject = encodeURIComponent(`[Unbound Suns ${category.toUpperCase()}] ${pilot || "Pilot Inquiry"}`);
      const body = encodeURIComponent(`Pilot ID / Username: ${pilot || "N/A"}\nCategory: ${category}\n\nDetails:\n${message}`);
      showMsg(supportMsg, "ok", `Ticket prepared. Click below or email ${cfg.supportEmail} directly — verified Data Deletion requests are completed within 7 days.`);
      const link = document.createElement("a");
      link.href = `mailto:${cfg.supportEmail}?subject=${subject}&body=${body}`;
      link.className = "btn btn-cyan btn-sm";
      link.style.marginTop = "10px";
      link.textContent = "Open Email Dispatch";
      supportMsg.appendChild(document.createElement("br"));
      supportMsg.appendChild(link);
    });
  }
})();
