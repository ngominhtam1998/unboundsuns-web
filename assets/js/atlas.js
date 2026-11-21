/**
 * Interactive 21×17 Galactic Sector Matrix Star Chart
 * Mirrors OpenWorldWorldMapRenderer.cs & map_manifest.json 1-to-1:
 * - Exact 21×17 square matrix (Cols A–U, Rows 1–17)
 * - Exact 3×3 Central PK Zone (J8–L10) with animated Abyssal Black-Hole Vortex & 12 port anchors
 * - Chamfered holo-tiles matching exact Unity RiskColor palette (Blue/Yellow/Red/Black)
 * - 16 Orbital Citadels (11 Blue + 5 Yellow) + 24 Tactical Landmarks (6 Portals, 6 Ore Belts, 6 Wrecks, 6 Boss Hazards)
 * - Live Shortest-Path Warp Route Plotter from Hearthwell (A1) to any selected sector
 */
(async function initStarAtlas() {
  const canvas = document.getElementById("atlas-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const dossierEl = document.getElementById("atlas-dossier");
  const searchInput = document.getElementById("atlas-search-input");
  const filterBtns = document.querySelectorAll("[data-filter]");

  // Exact Unity OpenWorldWorldMapRenderer.cs Color32 palette
  const PALETTE = {
    Blue:   { fill: "rgba(10,38,76,0.90)",  core: "rgba(16,58,112,0.86)", rim: "#34b2ff", top: "#8ce0ff", pip: "#38e8ff" },
    Yellow: { fill: "rgba(66,44,8,0.92)",   core: "rgba(96,64,12,0.88)",  rim: "#ffc026", top: "#ffe68a", pip: "#ffd24d" },
    Red:    { fill: "rgba(74,12,20,0.92)",  core: "rgba(110,18,30,0.88)", rim: "#ff3e44", top: "#ff9191", pip: "#ff5c60" },
    Black:  { fill: "rgba(20,8,34,0.94)",   core: "rgba(38,14,62,0.90)",  rim: "#bc48ff", top: "#e696ff", pip: "#d75fff" }
  };

  const LANDMARK_STYLE = {
    Station: { label: "Orbital Citadel",   color: "#ffe280", glyph: "◆" },
    Portal:  { label: "Warp Portal",       color: "#55f5ff", glyph: "◎" },
    OreBelt: { label: "Rich Ore Belt",     color: "#2dffb4", glyph: "⬡" },
    Wreck:   { label: "Ancient Shipwreck", color: "#ff9b2d", glyph: "✦" },
    Hazard:  { label: "Abyssal Boss Zone", color: "#ff3769", glyph: "▲" },
    PK:      { label: "3×3 Central PK Core", color: "#ff2e88", glyph: "PK" }
  };

  const RULES = {
    Blue:   { pvp: "Safe Zone (Zero PvP)", ores: "Ferrite Ore (T1)", bounty: "Mob 120S · Boss 900S" },
    Yellow: { pvp: "Knockdown (8% Dur / 10% Ore)", ores: "Argent Ore (T2)", bounty: "Mob 260S · Boss 2,200S" },
    Red:    { pvp: "Full-Loot PvP", ores: "Aurum Ore (T3)", bounty: "Mob 520S · Boss 4,800S" },
    Black:  { pvp: "Unrestricted Full-Loot PvP", ores: "Plasmite (T4) · Voidite (T5)", bounty: "Mob 1,600S · Boss 12,000S" }
  };

  let atlas;
  try {
    const resp = await fetch("assets/data/world-atlas.json");
    atlas = await resp.json();
  } catch (_) {
    if (dossierEl) dossierEl.innerHTML = `<p style="color:var(--red)">Failed to load map_manifest 349-sector data.</p>`;
    return;
  }

  const zoneMap = new Map(atlas.zones.map((z) => [z.id, z]));
  const COLS = atlas.cols || 21;
  const ROWS = atlas.rows || 17;
  const startId = atlas.start || "station_a";

  let activeFilter = "ALL";
  let selectedId = startId;
  let hoveredId = null;
  let routePath = [startId];
  let routeEdgeSet = new Set();

  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;
  let dragStart = { x: 0, y: 0 };
  let movedDistance = 0;
  let width = 880, height = 560;
  let animTime = 0;

  function colLabel(c) {
    return String.fromCharCode(65 + c);
  }

  function edgeKey(a, b) {
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  }

  function findShortestPath(fromId, toId) {
    if (fromId === toId) return [fromId];
    const parent = new Map([[fromId, null]]);
    const q = [fromId];
    let head = 0;
    while (head < q.length) {
      const cur = q[head++];
      if (cur === toId) break;
      const z = zoneMap.get(cur);
      if (!z) continue;
      for (const nb of z.ex || []) {
        if (!parent.has(nb) && zoneMap.has(nb)) {
          parent.set(nb, cur);
          q.push(nb);
        }
      }
    }
    if (!parent.has(toId)) return [toId];
    const path = [];
    for (let cur = toId; cur !== null; cur = parent.get(cur)) path.push(cur);
    path.reverse();
    return path;
  }

  function cellSize() {
    const padX = 54, padY = 48;
    return Math.min((width - padX) / COLS, (height - padY) / ROWS) * scale;
  }

  function boardOrigin() {
    const cs = cellSize();
    const bw = COLS * cs;
    const bh = ROWS * cs;
    return {
      ox: (width - bw) / 2 + 12 + offsetX,
      oy: (height - bh) / 2 + 12 + offsetY,
      cs
    };
  }

  function zoneScreenCenter(z) {
    const { ox, oy, cs } = boardOrigin();
    return {
      sx: ox + (z.c + 0.5) * cs,
      sy: oy + (z.r + 0.5) * cs,
      cs
    };
  }

  function matchesFilter(z) {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "STATION") return z.lm === "Station";
    if (activeFilter === "LANDMARK") return !!z.lm && z.lm !== "Station";
    return z.t === activeFilter;
  }

  function drawChamferedRect(cx, cy, hx, hy, ch) {
    ctx.beginPath();
    ctx.moveTo(cx - hx + ch, cy - hy);
    ctx.lineTo(cx + hx - ch, cy - hy);
    ctx.lineTo(cx + hx, cy - hy + ch);
    ctx.lineTo(cx + hx, cy + hy - ch);
    ctx.lineTo(cx + hx - ch, cy + hy);
    ctx.lineTo(cx - hx + ch, cy + hy);
    ctx.lineTo(cx - hx, cy + hy - ch);
    ctx.lineTo(cx - hx, cy - hy + ch);
    ctx.closePath();
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
    const { ox, oy, cs } = boardOrigin();
    const bw = COLS * cs;
    const bh = ROWS * cs;

    // 1. Subtle matrix grid & Column (A–U) / Row (1–17) tactical headers
    ctx.strokeStyle = "rgba(56, 232, 255, 0.06)";
    ctx.lineWidth = 1;
    for (let c = 0; c <= COLS; c++) {
      const x = ox + c * cs;
      ctx.beginPath(); ctx.moveTo(x, oy); ctx.lineTo(x, oy + bh); ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      const y = oy + r * cs;
      ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox + bw, y); ctx.stroke();
    }

    const hdrSize = Math.max(9, Math.min(12, cs * 0.42));
    ctx.font = `700 ${hdrSize}px Rajdhani, sans-serif`;
    ctx.fillStyle = "rgba(116, 198, 255, 0.65)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let c = 0; c < COLS; c++) {
      ctx.fillText(colLabel(c), ox + (c + 0.5) * cs, oy - Math.max(10, cs * 0.45));
    }
    ctx.textAlign = "right";
    for (let r = 0; r < ROWS; r++) {
      ctx.fillText(String(r + 1), ox - Math.max(7, cs * 0.3), oy + (r + 0.5) * cs);
    }

    // 2. Draw 656 real portal routes (connecting cleanly to 3×3 Central PK port edges)
    for (let i = 0; i < atlas.edges.length; i++) {
      const [aId, bId] = atlas.edges[i];
      const a = zoneMap.get(aId);
      const b = zoneMap.get(bId);
      if (!a || !b) continue;
      const p1 = zoneScreenCenter(a);
      const p2 = zoneScreenCenter(b);
      const k = edgeKey(aId, bId);
      const isRoute = routeEdgeSet.has(k);
      const isSelEdge = aId === selectedId || bId === selectedId;
      const vis = matchesFilter(a) || matchesFilter(b);

      ctx.beginPath();
      ctx.moveTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      if (isRoute) {
        ctx.strokeStyle = "#ffe194";
        ctx.lineWidth = Math.max(2.4, cs * 0.11);
      } else if (isSelEdge) {
        ctx.strokeStyle = "rgba(56, 232, 255, 0.85)";
        ctx.lineWidth = Math.max(1.8, cs * 0.08);
      } else {
        ctx.strokeStyle = vis ? "rgba(96, 170, 235, 0.25)" : "rgba(96, 170, 235, 0.05)";
        ctx.lineWidth = 1;
      }
      ctx.stroke();
    }

    // 3. Draw 348 standard chamfered holo-tiles + 1 colossal 3×3 Central PK Zone
    let pkZone = null;
    for (let i = 0; i < atlas.zones.length; i++) {
      const z = atlas.zones[i];
      if (z.pk) { pkZone = z; continue; }
      const { sx, sy } = zoneScreenCenter(z);
      if (sx < -cs || sx > width + cs || sy < -cs || sy > height + cs) continue;

      const pal = PALETTE[z.t] || PALETTE.Blue;
      const match = matchesFilter(z);
      const isSel = z.id === selectedId;
      const isHov = z.id === hoveredId;
      const onPath = routePath.includes(z.id);

      const half = cs * 0.41;
      const ch = Math.max(2, half * 0.28);

      ctx.save();
      ctx.globalAlpha = match || onPath || isSel ? 1 : 0.18;

      // Drop shadow
      drawChamferedRect(sx + 1.2, sy + 1.5, half, half, ch);
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fill();

      // Main tile body
      drawChamferedRect(sx, sy, half, half, ch);
      ctx.fillStyle = pal.fill;
      ctx.fill();

      // Recessed core pad
      drawChamferedRect(sx, sy, half * 0.72, half * 0.72, ch * 0.72);
      ctx.fillStyle = pal.core;
      ctx.fill();

      // Outer neon rim
      drawChamferedRect(sx, sy, half, half, ch);
      ctx.lineWidth = isSel ? 2.4 : (onPath ? 1.8 : 1.15);
      ctx.strokeStyle = isSel ? "#ffe194" : (onPath ? "#38e8ff" : pal.rim);
      ctx.stroke();

      // Lit top highlight bar
      ctx.beginPath();
      ctx.moveTo(sx - half + ch, sy - half);
      ctx.lineTo(sx + half - ch, sy - half);
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = pal.top;
      ctx.stroke();

      // Landmark inner accent frame & glyph OR center pip
      if (z.lm && LANDMARK_STYLE[z.lm]) {
        const lm = LANDMARK_STYLE[z.lm];
        drawChamferedRect(sx, sy, half * 0.8, half * 0.8, ch * 0.8);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = lm.color;
        ctx.stroke();
        if (cs >= 16) {
          ctx.font = `700 ${Math.max(8, cs * 0.36)}px Rajdhani, sans-serif`;
          ctx.fillStyle = lm.color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(lm.glyph, sx, sy + 0.5);
        }
      } else {
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(1.6, cs * 0.085), 0, Math.PI * 2);
        ctx.fillStyle = pal.pip;
        ctx.fill();
      }

      if (isHov && !isSel) {
        drawChamferedRect(sx, sy, half + 2.5, half + 2.5, ch + 1);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
      }

      ctx.restore();
    }

    // 4. Draw Iconic 3×3 CENTRAL PK ZONE (Cols J–L, Rows 8–10)
    if (pkZone) {
      const { sx, sy } = zoneScreenCenter(pkZone);
      const half = cs * 1.46;
      const ch = half * 0.14;
      const isSel = pkZone.id === selectedId;
      const match = matchesFilter(pkZone);

      ctx.save();
      ctx.globalAlpha = match || isSel ? 1 : 0.25;

      // Outer crimson-violet abyssal aura
      const aura = ctx.createRadialGradient(sx, sy, half * 0.15, sx, sy, half * 1.18);
      aura.addColorStop(0, "rgba(255, 42, 118, 0.55)");
      aura.addColorStop(0.55, "rgba(130, 26, 210, 0.32)");
      aura.addColorStop(1, "rgba(18, 5, 32, 0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(sx, sy, half * 1.18, 0, Math.PI * 2);
      ctx.fill();

      // 3×3 Chamfered fortress frame
      drawChamferedRect(sx, sy, half, half, ch);
      ctx.fillStyle = "rgba(22, 6, 36, 0.96)";
      ctx.fill();
      ctx.lineWidth = isSel ? 3 : 2.2;
      ctx.strokeStyle = isSel ? "#ffe194" : "#ff367e";
      ctx.stroke();

      // Animated vortex rings inside 3×3 core
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(animTime * 0.65);
      ctx.strokeStyle = "rgba(195, 86, 255, 0.55)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, half * 0.62, 0, Math.PI * 2);
      ctx.stroke();
      ctx.rotate(-animTime * 1.3);
      ctx.strokeStyle = "rgba(255, 62, 110, 0.72)";
      ctx.beginPath();
      ctx.arc(0, 0, half * 0.38, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Dark event horizon center
      ctx.beginPath();
      ctx.arc(sx, sy, half * 0.24, 0, Math.PI * 2);
      ctx.fillStyle = "#06020d";
      ctx.fill();
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = "#ff4e88";
      ctx.stroke();

      // 12 Port Anchor pips (3 per side matching CentralPkPortAnchors)
      ctx.fillStyle = "#ff91b8";
      for (let k = -1; k <= 1; k++) {
        const off = k * cs;
        ctx.fillRect(sx + off - 2, sy - half - 2, 4, 4);
        ctx.fillRect(sx + off - 2, sy + half - 2, 4, 4);
        ctx.fillRect(sx - half - 2, sy + off - 2, 4, 4);
        ctx.fillRect(sx + half - 2, sy + off - 2, 4, 4);
      }

      // Label
      ctx.font = `800 ${Math.max(9, cs * 0.42)}px Orbitron, sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("PK", sx, sy);

      if (cs >= 20) {
        ctx.font = `700 ${Math.max(8, cs * 0.28)}px Rajdhani, sans-serif`;
        ctx.fillStyle = "#ff9fc4";
        ctx.fillText("CENTRAL PK ZONE", sx, sy + half * 0.78);
      }
      ctx.restore();
    }

    // 5. Floating labels for Hearthwell (A1), Selected & Hovered sectors
    const labelTargets = [zoneMap.get(startId), zoneMap.get(selectedId), zoneMap.get(hoveredId)].filter(Boolean);
    const drawnLabels = new Set();
    for (const z of labelTargets) {
      if (drawnLabels.has(z.id) || z.pk) continue;
      drawnLabels.add(z.id);
      const { sx, sy } = zoneScreenCenter(z);
      const tag = `${z.name.toUpperCase()} (${z.g})`;
      ctx.font = "700 11px Rajdhani, sans-serif";
      const tw = ctx.measureText(tag).width + 12;
      const ty = sy - cs * 0.65;
      ctx.fillStyle = "rgba(5, 10, 22, 0.9)";
      ctx.strokeStyle = z.id === selectedId ? "#ffe194" : "#38e8ff";
      ctx.lineWidth = 1;
      ctx.fillRect(sx - tw / 2, ty - 9, tw, 18);
      ctx.strokeRect(sx - tw / 2, ty - 9, tw, 18);
      ctx.fillStyle = z.id === selectedId ? "#ffe194" : "#eef5ff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(tag, sx, ty);
    }
  }

  function renderDossier(z) {
    if (!dossierEl || !z) return;
    const pal = PALETTE[z.t] || PALETTE.Blue;
    const rule = RULES[z.t] || RULES.Blue;
    const lm = z.lm && LANDMARK_STYLE[z.lm] ? LANDMARK_STYLE[z.lm] : null;
    const hops = Math.max(0, routePath.length - 1);

    const gatesHtml = (z.ex || []).map((targetId) => {
      const tz = zoneMap.get(targetId);
      const label = tz ? `${tz.name} (${tz.g})` : targetId;
      return `<button type="button" class="gate-btn" data-jump="${targetId}">${label}</button>`;
    }).join("");

    dossierEl.innerHTML = `
      <div>
        <div class="dossier-pill" style="background:${pal.rim}22;border:1px solid ${pal.rim}99;color:${pal.rim}">
          ● ${z.t.toUpperCase()} · ${z.g}${lm ? ` · ${lm.label.toUpperCase()}` : ""}
        </div>
        <h3 class="dossier-title">${z.name.toUpperCase()}</h3>
        <div class="dossier-sub">
          ID: <code>${z.id}</code> · <strong>${z.m}</strong> / ${z.rg}
        </div>
        <div class="dossier-rows">
          <div class="dossier-row"><span>Biome</span><strong>${z.b}</strong></div>
          <div class="dossier-row"><span>PvP Ruleset</span><strong>${z.np ? "Free-For-All (No Party)" : rule.pvp}</strong></div>
          <div class="dossier-row"><span>Sector Ceiling</span><strong>100 Pilots / Zone</strong></div>
          <div class="dossier-row"><span>Primary Ore</span><strong>${rule.ores}</strong></div>
          <div class="dossier-row"><span>Server PvE Payout</span><strong>${rule.bounty}</strong></div>
          <div class="dossier-row"><span>Route from Hearthwell</span><strong style="color:var(--gold-bright)">${hops === 0 ? "Origin Citadel (A1)" : `${hops} Warp Jumps`}</strong></div>
        </div>
        <div>
          <div style="font-family:var(--font-tech);font-size:0.78rem;letter-spacing:0.15em;color:var(--gold);text-transform:uppercase">
            Connected Jump Gates (${(z.ex || []).length})
          </div>
          <div class="jump-gates">${gatesHtml || "<span style='color:var(--text-muted)'>No Gates</span>"}</div>
        </div>
      </div>
      <div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(116,178,255,0.12);font-size:0.8rem;color:var(--text-muted)">
        1-to-1 sync with <code>map_manifest.json</code> (21×17 matrix · 349 sectors · 16 Citadels · 24 Landmarks · 3×3 PK Core).
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
    routePath = findShortestPath(startId, id);
    routeEdgeSet = new Set();
    for (let i = 0; i < routePath.length - 1; i++) {
      routeEdgeSet.add(edgeKey(routePath[i], routePath[i + 1]));
    }
    if (autoZoom) {
      scale = Math.max(scale, 1.85);
      const cs = cellSize();
      offsetX = (COLS / 2 - (z.c + 0.5)) * cs;
      offsetY = (ROWS / 2 - (z.r + 0.5)) * cs;
    }
    renderDossier(z);
    draw();
  }

  function pickAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    const { cs } = boardOrigin();
    for (let i = 0; i < atlas.zones.length; i++) {
      const z = atlas.zones[i];
      const { sx, sy } = zoneScreenCenter(z);
      const half = z.pk ? cs * 1.48 : cs * 0.45;
      if (Math.abs(mx - sx) <= half && Math.abs(my - sy) <= half) return z;
    }
    return null;
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
    scale = Math.max(0.85, Math.min(3.5, scale * factor));
    draw();
  }, { passive: false });

  document.getElementById("atlas-zoom-in")?.addEventListener("click", () => {
    scale = Math.min(3.5, scale * 1.25); draw();
  });
  document.getElementById("atlas-zoom-out")?.addEventListener("click", () => {
    scale = Math.max(0.85, scale * 0.8); draw();
  });
  document.getElementById("atlas-reset")?.addEventListener("click", () => {
    scale = 1; offsetX = 0; offsetY = 0; focusSector(startId);
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
      const match = atlas.zones.find((z) => z.id.toLowerCase() === q || z.name.toLowerCase() === q || z.g.toLowerCase() === q)
        || atlas.zones.find((z) => z.name.toLowerCase().includes(q) || z.id.toLowerCase().includes(q));
      if (match) focusSector(match.id, true);
    });
  }

  // Gentle 20fps pulse for the 3×3 Central PK Black-Hole Vortex when visible
  let lastTick = 0;
  function animateVortex(ts) {
    if (!document.hidden && ts - lastTick > 60) {
      animTime = ts * 0.001;
      lastTick = ts;
      draw();
    }
    requestAnimationFrame(animateVortex);
  }

  window.addEventListener("resize", resize);
  resize();
  focusSector("central_pk_zone");
  requestAnimationFrame(animateVortex);
})();
