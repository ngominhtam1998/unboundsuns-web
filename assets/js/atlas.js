/**
 * Interactive 349-Sector Live Star Atlas powered by real world.json topology.
 * Supports pan, zoom, security filtering, sector search, hover highlights,
 * and clickable Warp Jump Gate navigation.
 */
(async function initStarAtlas() {
  const canvas = document.getElementById("atlas-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const dossierEl = document.getElementById("atlas-dossier");
  const searchInput = document.getElementById("atlas-search-input");
  const filterBtns = document.querySelectorAll("[data-filter]");

  const COLORS = {
    Blue: "#38e8ff",
    Yellow: "#f5c542",
    Red: "#ff4b6b",
    Black: "#b47aff"
  };

  const RULES = {
    Blue: { pvp: "Safe Zone (Zero PvP)", ores: "Ferrite, Argent", bounty: "1.0× Base Silver" },
    Yellow: { pvp: "Knockdown PvP (No Loot Loss)", ores: "Ferrite, Argent, Aurum", bounty: "1.6× Silver & Scrap" },
    Red: { pvp: "Lethal Full-Loot PvP", ores: "Aurum, Plasmite", bounty: "2.8× Silver + Salvage" },
    Black: { pvp: "Unrestricted Full-Loot + Bosses", ores: "Plasmite, Voidite", bounty: "4.5× Silver (+1,600S/Mob)" }
  };

  let atlas;
  try {
    const resp = await fetch("assets/data/world-atlas.json");
    atlas = await resp.json();
  } catch (err) {
    if (dossierEl) dossierEl.innerHTML = `<p style="color:var(--red)">Failed to load 349-sector atlas data.</p>`;
    return;
  }

  const zoneMap = new Map(atlas.zones.map((z) => [z.id, z]));
  const xs = atlas.zones.map((z) => z.x);
  const ys = atlas.zones.map((z) => z.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const gridCenterX = (minX + maxX) / 2;
  const gridCenterY = (minY + maxY) / 2;

  let activeFilter = "ALL";
  let selectedId = atlas.start || "station_a";
  let hoveredId = null;

  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;
  let dragStart = { x: 0, y: 0 };
  let movedDistance = 0;
  let width = 800, height = 540;

  function cellSpacing() {
    return Math.min(width / (maxX - minX + 3.2), height / (maxY - minY + 3.2));
  }

  function toScreen(gx, gy) {
    const step = cellSpacing() * scale;
    return {
      sx: width / 2 + (gx - gridCenterX) * step + offsetX,
      sy: height / 2 + (gy - gridCenterY) * step + offsetY
    };
  }

  function matchesFilter(z) {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "STATION") return !!z.st;
    return z.t === activeFilter;
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Subtle tactical grid
    ctx.strokeStyle = "rgba(56, 232, 255, 0.045)";
    ctx.lineWidth = 1;
    const gridStep = 44;
    for (let x = (offsetX % gridStep); x < width; x += gridStep) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = (offsetY % gridStep); y < height; y += gridStep) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Draw 656 warp lanes
    for (let i = 0; i < atlas.edges.length; i++) {
      const [aId, bId] = atlas.edges[i];
      const a = zoneMap.get(aId);
      const b = zoneMap.get(bId);
      if (!a || !b) continue;
      const p1 = toScreen(a.x, a.y);
      const p2 = toScreen(b.x, b.y);
      const isSelectedEdge = aId === selectedId || bId === selectedId;
      const visible = matchesFilter(a) || matchesFilter(b);
      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.strokeStyle = isSelectedEdge
        ? "rgba(240, 185, 86, 0.85)"
        : visible
          ? "rgba(116, 178, 255, 0.22)"
          : "rgba(116, 178, 255, 0.05)";
      ctx.lineWidth = isSelectedEdge ? 2.2 : 1;
      ctx.stroke();
    }

    // Draw 349 sector nodes
    const baseR = Math.max(3.6, Math.min(8.5, cellSpacing() * scale * 0.22));
    for (let i = 0; i < atlas.zones.length; i++) {
      const z = atlas.zones[i];
      const { sx, sy } = toScreen(z.x, z.y);
      if (sx < -20 || sx > width + 20 || sy < -20 || sy > height + 20) continue;

      const match = matchesFilter(z);
      const isSel = z.id === selectedId;
      const isHov = z.id === hoveredId;
      const col = COLORS[z.t] || "#ffffff";
      const r = isSel ? baseR * 1.65 : (z.st || z.pk ? baseR * 1.3 : baseR);

      if (isSel || isHov || z.pk) {
        ctx.beginPath();
        ctx.arc(sx, sy, r + 6, 0, Math.PI * 2);
        ctx.fillStyle = isSel ? "rgba(240, 185, 86, 0.26)" : "rgba(56, 232, 255, 0.16)";
        ctx.fill();
      }

      ctx.beginPath();
      if (z.st) {
        // Diamond marker for 24 Orbital Stations
        ctx.moveTo(sx, sy - r * 1.25);
        ctx.lineTo(sx + r * 1.25, sy);
        ctx.lineTo(sx, sy + r * 1.25);
        ctx.lineTo(sx - r * 1.25, sy);
        ctx.closePath();
      } else {
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
      }

      ctx.globalAlpha = match ? 1 : 0.18;
      ctx.fillStyle = z.pk ? "#ff2e93" : col;
      ctx.fill();

      if (isSel) {
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = "#ffe194";
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      if ((isSel || isHov || z.pk || (z.st && scale >= 1.35)) && match) {
        ctx.font = "700 11px Rajdhani, sans-serif";
        ctx.fillStyle = isSel ? "#ffe194" : "#eef5ff";
        ctx.textAlign = "center";
        ctx.fillText(z.id.toUpperCase(), sx, sy - r - 7);
      }
    }
  }

  function renderDossier(z) {
    if (!dossierEl || !z) return;
    const col = COLORS[z.t] || "#38e8ff";
    const rule = RULES[z.t] || RULES.Blue;
    const dirNames = { n: "North", s: "South", e: "East", w: "West" };
    const gatesHtml = Object.entries(z.n || {})
      .map(([d, target]) => `<button type="button" class="gate-btn" data-jump="${target}">${dirNames[d]} → ${target}</button>`)
      .join("");

    dossierEl.innerHTML = `
      <div>
        <div class="dossier-pill" style="background:${col}22;border:1px solid ${col}88;color:${col}">
          ● ${z.t.toUpperCase()} SECTOR ${z.pk ? "· CENTRAL PK CORE" : z.st ? "· ORBITAL STATION" : ""}
        </div>
        <h3 class="dossier-title">${z.id.toUpperCase()}</h3>
        <div class="dossier-sub">Grid Coord (${z.x}, ${z.y}) · Biome: <strong style="color:#fff">${z.b}</strong></div>
        <div class="dossier-rows">
          <div class="dossier-row"><span>PvP Ruleset</span><strong>${rule.pvp}</strong></div>
          <div class="dossier-row"><span>Pilot Capacity</span><strong>100 Pilots / Sector Cap</strong></div>
          <div class="dossier-row"><span>Native Ores</span><strong>${rule.ores}</strong></div>
          <div class="dossier-row"><span>Bounty Yield</span><strong>${rule.bounty}</strong></div>
          <div class="dossier-row"><span>Orbital Citadel</span><strong>${z.st ? "Dockable Station & Market" : "Deep Space (No Dock)"}</strong></div>
        </div>
        <div>
          <div style="font-family:var(--font-tech);font-size:0.78rem;letter-spacing:0.15em;color:var(--gold);text-transform:uppercase">Warp Jump Gates (${Object.keys(z.n || {}).length})</div>
          <div class="jump-gates">${gatesHtml || "<span style='color:var(--text-muted)'>Isolated Anomaly</span>"}</div>
        </div>
      </div>
      <div style="margin-top:18px;padding-top:14px;border-top:1px solid rgba(116,178,255,0.12);font-size:0.82rem;color:var(--text-muted)">
        Data synced directly from live <code>world.json</code> topology (${atlas.count} sectors · ${atlas.edges.length} jump lanes).
      </div>
    `;

    dossierEl.querySelectorAll("[data-jump]").forEach((btn) => {
      btn.addEventListener("click", () => focusSector(btn.dataset.jump));
    });
  }

  function focusSector(id, autoZoom = false) {
    const z = zoneMap.get(id);
    if (!z) return;
    selectedId = id;
    if (autoZoom) {
      scale = Math.max(scale, 1.8);
      const step = cellSpacing() * scale;
      offsetX = -(z.x - gridCenterX) * step;
      offsetY = -(z.y - gridCenterY) * step;
    }
    renderDossier(z);
    draw();
  }

  function pickAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    let best = null, bestDist = 18;
    for (let i = 0; i < atlas.zones.length; i++) {
      const z = atlas.zones[i];
      const { sx, sy } = toScreen(z.x, z.y);
      const d = Math.hypot(mx - sx, my - sy);
      if (d < bestDist) {
        bestDist = d;
        best = z;
      }
    }
    return best;
  }

  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    movedDistance = 0;
    dragStart = { x: e.clientX - offsetX, y: e.clientY - offsetY };
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointermove", (e) => {
    if (dragging) {
      const nx = e.clientX - dragStart.x;
      const ny = e.clientY - dragStart.y;
      movedDistance += Math.hypot(nx - offsetX, ny - offsetY);
      offsetX = nx;
      offsetY = ny;
      draw();
      return;
    }
    const hit = pickAt(e.clientX, e.clientY);
    const nextHover = hit ? hit.id : null;
    if (nextHover !== hoveredId) {
      hoveredId = nextHover;
      canvas.style.cursor = hit ? "pointer" : "grab";
      draw();
    }
  });

  canvas.addEventListener("pointerup", (e) => {
    dragging = false;
    if (movedDistance < 6) {
      const hit = pickAt(e.clientX, e.clientY);
      if (hit) focusSector(hit.id);
    }
  });

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    scale = Math.max(0.75, Math.min(3.5, scale * factor));
    draw();
  }, { passive: false });

  document.getElementById("atlas-zoom-in")?.addEventListener("click", () => {
    scale = Math.min(3.5, scale * 1.25); draw();
  });
  document.getElementById("atlas-zoom-out")?.addEventListener("click", () => {
    scale = Math.max(0.75, scale * 0.8); draw();
  });
  document.getElementById("atlas-reset")?.addEventListener("click", () => {
    scale = 1; offsetX = 0; offsetY = 0; focusSector(atlas.start || "station_a");
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      draw();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const q = searchInput.value.trim().toLowerCase();
      if (!q) return;
      const match = atlas.zones.find((z) => z.id.toLowerCase() === q)
        || atlas.zones.find((z) => z.id.toLowerCase().includes(q));
      if (match) focusSector(match.id, true);
    });
  }

  window.addEventListener("resize", resize);
  resize();
  focusSector(selectedId);
})();
