/**
 * Interactive 21×17 Galactic Sector Matrix Star Chart
 * Pixel-faithful port of Assets/Scripts/Gui/Combat/OpenWorldWorldMapRenderer.cs:
 * - Exact 21×17 square matrix (Cols A–U, Rows 1–17) from map_manifest.json
 * - Exact Unity chamfered holo-tiles & Color32 palette (Blue/Yellow/Red/Black)
 * - Exact OpenWorldWorldMapStationGraphic procedural emblems:
 *     * Station (16): 6-tower golden-ivory hexagonal Citadel fortress + cyan beacon core
 *     * Portal  (6):  Cyan-violet wormhole ring + 4 cardinal white stabilizer pylons
 *     * OreBelt (6):  Emerald octagon + 3 angled crystal shards
 *     * Wreck   (6):  Amber diamond salvage frame + gold crossed hull ribs (X-frame)
 *     * Hazard  (6):  Crimson warning triangle inside danger ring + hot-pink bio-hazard hex core
 * - Exact 4-layer rotating Central PK Zone Black-Hole VFX using real Unity sprites:
 *     cloud.png (crimson halo) + twister.png (amber accretion) + vortex.png (crimson inflow) + blackhole.png
 * - Live Shortest-Path Warp Route Plotter from Hearthwell (A1)
 */
(async function initStarAtlas() {
  const canvas = document.getElementById("atlas-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const dossierEl = document.getElementById("atlas-dossier");
  const searchInput = document.getElementById("atlas-search-input");
  const filterBtns = document.querySelectorAll("[data-filter]");

  const PALETTE = {
    Blue:   { fill: "rgba(10,38,76,0.90)",  core: "rgba(16,58,112,0.86)", rim: "#34b2ff", top: "#8ce0ff", pip: "#38e8ff" },
    Yellow: { fill: "rgba(66,44,8,0.92)",   core: "rgba(96,64,12,0.88)",  rim: "#ffc026", top: "#ffe68a", pip: "#ffd24d" },
    Red:    { fill: "rgba(74,12,20,0.92)",  core: "rgba(110,18,30,0.88)", rim: "#ff3e44", top: "#ff9191", pip: "#ff5c60" },
    Black:  { fill: "rgba(20,8,34,0.94)",   core: "rgba(38,14,62,0.90)",  rim: "#bc48ff", top: "#e696ff", pip: "#d75fff" }
  };

  const LANDMARK_META = {
    Station: { label: "Orbital Citadel",     color: "#ffe280" },
    Portal:  { label: "Warp Portal",         color: "#55f5ff" },
    OreBelt: { label: "Rich Ore Belt",       color: "#2dffb4" },
    Wreck:   { label: "Ancient Shipwreck",   color: "#ff9b2d" },
    Hazard:  { label: "Abyssal Boss Zone",   color: "#ff3769" },
    PK:      { label: "3×3 Central PK Core", color: "#ff2e88" }
  };

  const SILVER_IMG = `<img src="assets/img/icons/silver_coin.png" alt="Silver" title="Silver" class="silver-icon" />`;
  const fmtSilver = (n) => `<span class="silver-amt">${n}${SILVER_IMG}</span>`;

  const RULES = {
    Blue:   { pvp: "Safe Zone (Zero PvP)", ores: "Ferrite Ore (T1)", bounty: `Mob ${fmtSilver("120")} · Boss ${fmtSilver("900")}`, respawn: "Mob 45s (11s crowded) · Boss 3m" },
    Yellow: { pvp: "Knockdown (8% Dur / 10% Ore)", ores: "Argent Ore (T2)", bounty: `Mob ${fmtSilver("260")} · Boss ${fmtSilver("2,200")}`, respawn: "Mob 75s (19s crowded) · Boss 4m" },
    Red:    { pvp: "Full-Loot PvP", ores: "Aurum Ore (T3)", bounty: `Mob ${fmtSilver("520")} · Boss ${fmtSilver("4,800")}`, respawn: "Mob 100s (25s crowded) · Boss 5m" },
    Black:  { pvp: "Unrestricted Full-Loot PvP", ores: "Plasmite (T4) · Voidite (T5)", bounty: `Mob ${fmtSilver("1,600")} · Boss ${fmtSilver("12,000")}`, respawn: "Mob 120s (30s crowded) · Boss 7m" }
  };

  // Load real Unity Black Hole VFX sprites and pre-tint them onto offscreen canvases to match BuildPkBlackHoleVfx
  function loadTintedSprite(src, tintColor) {
    const entry = { img: null, ready: false };
    const raw = new Image();
    raw.onload = () => {
      if (!tintColor) {
        entry.img = raw;
        entry.ready = true;
        return;
      }
      const off = document.createElement("canvas");
      off.width = raw.naturalWidth || 128;
      off.height = raw.naturalHeight || 128;
      const octx = off.getContext("2d");
      octx.drawImage(raw, 0, 0);
      octx.globalCompositeOperation = "multiply";
      octx.fillStyle = tintColor;
      octx.fillRect(0, 0, off.width, off.height);
      octx.globalCompositeOperation = "destination-in";
      octx.drawImage(raw, 0, 0);
      entry.img = off;
      entry.ready = true;
    };
    raw.src = src;
    return entry;
  }

  const pkSprites = {
    cloud:     loadTintedSprite("assets/img/map/cloud.png", "rgb(242, 41, 97)"),
    twister:   loadTintedSprite("assets/img/map/twister.png", "rgb(255, 163, 46)"),
    vortex:    loadTintedSprite("assets/img/map/vortex.png", "rgb(255, 71, 107)"),
    blackhole: loadTintedSprite("assets/img/map/blackhole.png", null)
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
  let selectedId = "central_pk_zone";
  let hoveredId = null;
  let routePath = [startId];
  let routeEdgeSet = new Set();

  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;
  let dragStart = { x: 0, y: 0 };
  let movedDistance = 0;
  let width = 880, height = 590;
  let animTime = 0;

  function colLabel(c) { return String.fromCharCode(65 + c); }
  function edgeKey(a, b) { return a < b ? `${a}|${b}` : `${b}|${a}`; }

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
    const padLeft = 36, padRight = 24, padTop = 36, padBottom = 22;
    return Math.min((width - padLeft - padRight) / COLS, (height - padTop - padBottom) / ROWS) * scale;
  }

  function boardOrigin() {
    const cs = cellSize();
    const bw = COLS * cs;
    const bh = ROWS * cs;
    return {
      ox: (width - bw) / 2 + 10 + offsetX,
      oy: (height - bh) / 2 + 8 + offsetY,
      cs
    };
  }

  function zoneScreenCenter(z) {
    const { ox, oy, cs } = boardOrigin();
    return { sx: ox + (z.c + 0.5) * cs, sy: oy + (z.r + 0.5) * cs, cs };
  }

  function matchesFilter(z) {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "STATION") return z.lm === "Station";
    if (activeFilter === "LANDMARK") return !!z.lm && z.lm !== "Station";
    return z.t === activeFilter;
  }

  // ---------- Low-level vector primitives mirroring LocalMapMesh ----------
  function drawNgon(c, cx, cy, rx, ry, sides, rot, fill) {
    c.beginPath();
    for (let i = 0; i < sides; i++) {
      const a = rot + (i / sides) * Math.PI * 2;
      const px = cx + Math.cos(a) * rx;
      const py = cy - Math.sin(a) * ry; // Unity Y-up -> Canvas Y-down
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath();
    c.fillStyle = fill;
    c.fill();
  }

  function drawRing(c, cx, cy, rOuter, rInner, sides, rot, fill) {
    c.save();
    c.beginPath();
    for (let i = 0; i < sides; i++) {
      const a = rot + (i / sides) * Math.PI * 2;
      const px = cx + Math.cos(a) * rOuter;
      const py = cy - Math.sin(a) * rOuter;
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath();
    for (let i = sides - 1; i >= 0; i--) {
      const a = rot + (i / sides) * Math.PI * 2;
      const px = cx + Math.cos(a) * rInner;
      const py = cy - Math.sin(a) * rInner;
      if (i === sides - 1) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath();
    c.fillStyle = fill;
    c.fill("evenodd");
    c.restore();
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

  // ---------- Exact Ports of OpenWorldWorldMapStationGraphic Emblems ----------
  function drawStationEmblem(c, cx, cy, r) {
    drawNgon(c, cx, cy, r * 1.55, r * 1.55, 16, 0, "rgba(255,210,75,0.16)");
    drawNgon(c, cx, cy, r * 1.25, r * 1.25, 16, 0, "rgba(90,235,255,0.22)");
    drawNgon(c, cx + 1.2, cy + 1.2, r * 1.05, r * 1.05, 6, 0, "rgba(0,0,0,0.78)");
    drawNgon(c, cx, cy, r, r, 6, 0, "#0a101c");
    drawRing(c, cx, cy, r, r * 0.78, 6, 0, "#ffe069");
    drawNgon(c, cx, cy, r * 0.62, r * 0.62, 6, 0, "#1a2436");
    for (let i = 0; i < 6; i++) {
      const ang = (i * Math.PI) / 3;
      const bx = cx + Math.cos(ang) * (r * 0.86);
      const by = cy - Math.sin(ang) * (r * 0.86);
      drawNgon(c, bx, by, r * 0.25, r * 0.25, 6, 0, "#ffe069");
      drawNgon(c, bx, by, r * 0.13, r * 0.13, 6, 0, "#fff8d7");
    }
    drawNgon(c, cx, cy, r * 0.36, r * 0.36, 6, 0, "#fff8d7");
    drawNgon(c, cx, cy, r * 0.20, r * 0.20, 6, 0, "#5af0ff");
  }

  function drawPortalEmblem(c, cx, cy, r) {
    drawNgon(c, cx, cy, r * 1.65, r * 1.65, 20, 0, "rgba(145,70,255,0.20)");
    drawNgon(c, cx, cy, r * 1.30, r * 1.30, 20, 0, "rgba(60,235,255,0.25)");
    drawNgon(c, cx, cy, r * 0.96, r * 0.96, 24, 0, "rgba(8,12,28,0.98)");
    drawRing(c, cx, cy, r * 1.02, r * 0.80, 24, 0, "#4bf5ff");
    drawRing(c, cx, cy, r * 0.72, r * 0.50, 20, 0, "#c35fff");
    c.strokeStyle = "#ebfcff";
    c.lineWidth = Math.max(1.4, r * 0.22);
    for (let i = 0; i < 4; i++) {
      const ang = i * (Math.PI * 0.5);
      c.beginPath();
      c.moveTo(cx + Math.cos(ang) * r * 0.56, cy - Math.sin(ang) * r * 0.56);
      c.lineTo(cx + Math.cos(ang) * r * 1.18, cy - Math.sin(ang) * r * 1.18);
      c.stroke();
    }
    drawNgon(c, cx, cy, r * 0.34, r * 0.34, 16, 0, "#ebfcff");
    drawNgon(c, cx, cy, r * 0.18, r * 0.18, 12, 0, "#4bf5ff");
  }

  function drawOreBeltEmblem(c, cx, cy, r) {
    drawNgon(c, cx, cy, r * 1.55, r * 1.55, 16, 0, "rgba(30,245,165,0.18)");
    drawNgon(c, cx, cy, r * 1.22, r * 1.22, 16, 0, "rgba(80,255,200,0.22)");
    drawNgon(c, cx, cy, r * 0.95, r * 0.95, 8, 0.3927, "rgba(6,22,18,0.96)");
    drawRing(c, cx, cy, r * 0.98, r * 0.80, 8, 0.3927, "#2afcac");
    drawNgon(c, cx - r * 0.32, cy + r * 0.06, r * 0.24, r * 0.48, 4, 0.35, "#2afcac");
    drawNgon(c, cx + r * 0.32, cy + r * 0.06, r * 0.24, r * 0.48, 4, -0.35, "#2afcac");
    drawNgon(c, cx, cy - r * 0.06, r * 0.32, r * 0.68, 4, 0, "#b9ffe6");
    drawNgon(c, cx, cy - r * 0.06, r * 0.16, r * 0.42, 4, 0, "#2afcac");
  }

  function drawWreckEmblem(c, cx, cy, r) {
    drawNgon(c, cx, cy, r * 1.55, r * 1.55, 16, 0, "rgba(255,135,28,0.18)");
    drawNgon(c, cx, cy, r * 1.22, r * 1.22, 16, 0, "rgba(255,185,65,0.24)");
    drawNgon(c, cx, cy, r * 0.96, r * 0.96, 4, 0, "rgba(24,12,6,0.96)");
    drawRing(c, cx, cy, r * 1.02, r * 0.80, 4, 0, "#ff9424");
    const d = r * 0.52;
    c.strokeStyle = "#ffe487";
    c.lineWidth = Math.max(1.5, r * 0.22);
    c.beginPath();
    c.moveTo(cx - d, cy - d); c.lineTo(cx + d, cy + d);
    c.moveTo(cx - d, cy + d); c.lineTo(cx + d, cy - d);
    c.stroke();
    drawNgon(c, cx, cy, r * 0.28, r * 0.28, 4, 0, "#ff9424");
    drawNgon(c, cx, cy, r * 0.14, r * 0.14, 4, 0, "#fffadc");
  }

  function drawHazardEmblem(c, cx, cy, r) {
    drawNgon(c, cx, cy, r * 1.65, r * 1.65, 16, 0, "rgba(255,32,85,0.20)");
    drawNgon(c, cx, cy, r * 1.28, r * 1.28, 16, 0, "rgba(255,75,125,0.26)");
    drawRing(c, cx, cy, r * 1.04, r * 0.86, 16, 0, "rgba(255,48,92,0.75)");
    drawNgon(c, cx, cy + r * 0.06, r * 0.92, r * 0.92, 3, Math.PI * 0.5, "rgba(26,6,14,0.97)");
    drawRing(c, cx, cy + r * 0.06, r * 0.95, r * 0.72, 3, Math.PI * 0.5, "#ff305c");
    drawNgon(c, cx, cy + r * 0.04, r * 0.34, r * 0.34, 6, 0, "#ffafc8");
    drawNgon(c, cx, cy + r * 0.04, r * 0.16, r * 0.16, 6, 0, "#ff305c");
  }

  function drawLandmarkEmblem(c, kind, cx, cy, r) {
    if (kind === "Station") drawStationEmblem(c, cx, cy, r);
    else if (kind === "Portal") drawPortalEmblem(c, cx, cy, r);
    else if (kind === "OreBelt") drawOreBeltEmblem(c, cx, cy, r);
    else if (kind === "Wreck") drawWreckEmblem(c, cx, cy, r);
    else if (kind === "Hazard") drawHazardEmblem(c, cx, cy, r);
  }

  // Render crisp matching miniature emblems inside the legend bar below the map
  function renderLegendCanvases() {
    document.querySelectorAll("[data-legend-kind]").forEach((el) => {
      const kind = el.dataset.legendKind;
      const lctx = el.getContext("2d");
      if (!lctx) return;
      lctx.clearRect(0, 0, el.width, el.height);
      drawLandmarkEmblem(lctx, kind, el.width / 2, el.height / 2, el.width * 0.34);
    });
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

    // 1. Subtle matrix grid & Column (A–U) / Row (1–17) headers
    ctx.strokeStyle = "rgba(56, 232, 255, 0.055)";
    ctx.lineWidth = 1;
    for (let c = 0; c <= COLS; c++) {
      const x = ox + c * cs;
      ctx.beginPath(); ctx.moveTo(x, oy); ctx.lineTo(x, oy + bh); ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      const y = oy + r * cs;
      ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox + bw, y); ctx.stroke();
    }

    const hdrSize = Math.max(9, Math.min(12, cs * 0.40));
    ctx.font = `700 ${hdrSize}px Rajdhani, sans-serif`;
    ctx.fillStyle = "rgba(116, 198, 255, 0.72)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let c = 0; c < COLS; c++) {
      ctx.fillText(colLabel(c), ox + (c + 0.5) * cs, oy - Math.max(11, cs * 0.44));
    }
    ctx.textAlign = "right";
    for (let r = 0; r < ROWS; r++) {
      ctx.fillText(String(r + 1), ox - Math.max(8, cs * 0.30), oy + (r + 0.5) * cs);
    }

    // 2. Draw 656 warp lanes
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

    // 3. Draw 348 chamfered holo-tiles + exact Unity procedural landmark emblems
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

      // Drop shadow & chamfered body
      drawChamferedRect(sx + 1.2, sy + 1.5, half, half, ch);
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fill();

      drawChamferedRect(sx, sy, half, half, ch);
      ctx.fillStyle = pal.fill;
      ctx.fill();

      drawChamferedRect(sx, sy, half * 0.72, half * 0.72, ch * 0.72);
      ctx.fillStyle = pal.core;
      ctx.fill();

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

      if (z.lm && LANDMARK_META[z.lm]) {
        // Accent inner frame + exact OpenWorldWorldMapStationGraphic procedural emblem!
        drawChamferedRect(sx, sy, half * 0.84, half * 0.84, ch * 0.82);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = LANDMARK_META[z.lm].color;
        ctx.stroke();
        drawLandmarkEmblem(ctx, z.lm, sx, sy, cs * 0.34);
      } else {
        // Crisp glowing center node pip (matching OpenWorldWorldMapNodeGraphic)
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(2.0, cs * 0.095), 0, Math.PI * 2);
        ctx.fillStyle = "rgba(6,10,18,0.9)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(1.4, cs * 0.072), 0, Math.PI * 2);
        ctx.fillStyle = pal.pip;
        ctx.fill();
        if (z.t === "Black") {
          ctx.beginPath();
          ctx.arc(sx, sy, Math.max(0.9, cs * 0.036), 0, Math.PI * 2);
          ctx.fillStyle = "#ff415f";
          ctx.fill();
        }
      }

      if (isHov && !isSel) {
        drawChamferedRect(sx, sy, half + 2.5, half + 2.5, ch + 1);
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. Draw 3×3 CENTRAL PK ZONE with exact 4-layer rotating Unity Black-Hole VFX!
    if (pkZone) {
      const { sx, sy } = zoneScreenCenter(pkZone);
      const half = cs * 1.46;
      const box = half * 2;
      const ch = half * 0.14;
      const isSel = pkZone.id === selectedId;
      const match = matchesFilter(pkZone);

      ctx.save();
      ctx.globalAlpha = match || isSel ? 1 : 0.25;

      // 3×3 Chamfered dark fortress frame
      drawChamferedRect(sx, sy, half, half, ch);
      ctx.fillStyle = "rgba(18, 5, 28, 0.96)";
      ctx.fill();
      ctx.lineWidth = isSel ? 3 : 2.2;
      ctx.strokeStyle = isSel ? "#ffe194" : "#ff367e";
      ctx.stroke();

      // Clip Black-Hole VFX cleanly inside the 3×3 tile
      ctx.save();
      drawChamferedRect(sx, sy, half - 2, half - 2, ch);
      ctx.clip();

      const drawRotLayer = (sprite, sizeRatio, angle, alpha) => {
        if (!sprite.ready || !sprite.img) return;
        const sz = box * sizeRatio;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(angle);
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite.img, -sz / 2, -sz / 2, sz, sz);
        ctx.restore();
      };

      const pulse = 0.44 + 0.14 * Math.sin(animTime * 2.1);
      drawRotLayer(pkSprites.cloud, 0.96, animTime * 0.12, pulse);
      drawRotLayer(pkSprites.twister, 0.78, animTime * 0.65, 0.90);
      drawRotLayer(pkSprites.vortex, 0.64, -animTime * 1.05, 0.88);
      drawRotLayer(pkSprites.blackhole, 0.52, animTime * 0.22, 1.0);
      ctx.restore();

      // 12 Port Anchor notches (3 per side)
      ctx.fillStyle = "#ff91b8";
      for (let k = -1; k <= 1; k++) {
        const off = k * cs;
        ctx.fillRect(sx + off - 2, sy - half - 2, 4, 4);
        ctx.fillRect(sx + off - 2, sy + half - 2, 4, 4);
        ctx.fillRect(sx - half - 2, sy + off - 2, 4, 4);
        ctx.fillRect(sx + half - 2, sy + off - 2, 4, 4);
      }

      // Crisp PK badge & bottom caption
      ctx.font = `800 ${Math.max(10, cs * 0.42)}px Orbitron, sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.95)";
      ctx.shadowBlur = 8;
      ctx.fillText("PK", sx, sy);

      if (cs >= 20) {
        ctx.font = `700 ${Math.max(8, cs * 0.27)}px Rajdhani, sans-serif`;
        ctx.fillStyle = "#ffc2dc";
        ctx.fillText("CENTRAL PK ZONE", sx, sy + half * 0.80);
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // 5. Smart-clamped floating labels (NEVER overlap A–U headers or canvas edges!)
    const labelTargets = [zoneMap.get(startId), zoneMap.get(selectedId), zoneMap.get(hoveredId)].filter(Boolean);
    const drawnLabels = new Set();
    for (const z of labelTargets) {
      if (drawnLabels.has(z.id) || z.pk) continue;
      drawnLabels.add(z.id);
      const { sx, sy } = zoneScreenCenter(z);
      const tag = `${z.name.toUpperCase()} (${z.g})`;
      ctx.font = "700 11px Rajdhani, sans-serif";
      const tw = ctx.measureText(tag).width + 12;
      const lx = Math.max(tw / 2 + 8, Math.min(width - tw / 2 - 8, sx));
      const placeBelow = z.r <= 1;
      const ty = placeBelow ? sy + cs * 0.68 : sy - cs * 0.68;

      ctx.fillStyle = "rgba(5, 10, 22, 0.92)";
      ctx.strokeStyle = z.id === selectedId ? "#ffe194" : "#38e8ff";
      ctx.lineWidth = 1;
      ctx.fillRect(lx - tw / 2, ty - 9, tw, 18);
      ctx.strokeRect(lx - tw / 2, ty - 9, tw, 18);
      ctx.fillStyle = z.id === selectedId ? "#ffe194" : "#eef5ff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(tag, lx, ty);
    }
  }

  function renderDossier(z) {
    if (!dossierEl || !z) return;
    const pal = PALETTE[z.t] || PALETTE.Blue;
    const rule = RULES[z.t] || RULES.Blue;
    const lm = z.lm && LANDMARK_META[z.lm] ? LANDMARK_META[z.lm] : null;
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
          <div class="dossier-row"><span>PvE Silver Reward</span><strong>${rule.bounty}</strong></div>
          <div class="dossier-row"><span>Respawn Timer</span><strong>${rule.respawn}</strong></div>
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
        1-to-1 sync with <code>map_manifest.json</code> &amp; <code>OpenWorldWorldMapRenderer.cs</code> emblems.
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

  let lastTick = 0;
  function animateVortex(ts) {
    if (!document.hidden && ts - lastTick > 50) {
      animTime = ts * 0.001;
      lastTick = ts;
      draw();
    }
    requestAnimationFrame(animateVortex);
  }

  window.addEventListener("resize", resize);
  renderLegendCanvases();
  resize();
  focusSector("central_pk_zone");
  requestAnimationFrame(animateVortex);
})();
