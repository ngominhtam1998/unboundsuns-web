# UNBOUND SUNS — Official Game Portal & Tebex Web Shop (−30% Global USD)

Official AAA web portal for **Unbound Suns** (`com.aetherforge.unboundsuns`) by **AetherForge Interactive**.

## Live Features (100% Audited Against Unity & Server Codebase)
- **Cinematic Space Hero (`index.html`)**: High-res Dyson Halo key art layered with a Three.js r164 WebGL additive starfield & orbital solar ring, showcasing the real apex **T5 Abyssal Dreadnought** (`fns7.png`).
- **Exact 21×17 Galactic Sector Matrix Star Chart**: Built 1-to-1 from `Assets/Resources/OpenWorld/map_manifest.json` & `OpenWorldWorldMapRenderer.cs` (**349 sectors**, **656 warp routes**, **16 Orbital Citadels**, **24 Tactical Landmarks** = 6 Portals + 6 Ore Belts + 6 Wrecks + 6 Boss Hazards, and the animated **3×3 Central PK Zone** at `J8–L10` with 12 port anchors + live shortest-path route plotter from **Hearthwell (A1)**).
- **Interactive Citadel Fleet Hangar**: All **5 real playable progression warships** (`T1 Frontier Frigate` → `T2 Scout Interceptor` → `T3 Vanguard Corvette` → `T4 Heavy War Cruiser` → `T5 Abyssal Dreadnought`) matching `OpenWorldCitadelRules.cs` sprites, crafting recipes, and Armada Crest redemptions.
- **Four Security Frontiers & Sovereign Banners**: Exact PvP rules (including Yellow Zone `8% durability + 10% ore scatter`), exact server PvE payouts (`120S` → `1,600S` mob & `900S` → `12,000S` boss), and all 3 server-audited banners.
- **Standalone Tebex Global USD Web Shop (`shop.html`, −30% vs In-App Store)**:
  - All **9 official Citadel SKUs** priced **~30% lower** than mobile store pricing (`$0.69` – `$69.99` USD).
  - Official **Tebex Headless API** (`POST /accounts/{token}/baskets` → `POST /baskets/{ident}/packages` → Tebex Hosted Checkout with Visa, Mastercard, Apple Pay, Google Pay, Paysafecard & 130+ global methods + free Chargeback Protection).
  - Real cryptographic backend webhook on `UnboundSuns.Server` (`POST /api/billing/tebex/webhook` verifying Tebex two-step SHA-256 + HMAC-SHA256 `X-Signature`, `validation.webhook` handshake, idempotent SQLite credit, and `payment.disputed` anomaly logging).
- **Google Play Console Compliance Pages (`privacy.html`, `terms.html`, `support.html`)**: Public HTTPS Privacy Policy & 7-day Data Deletion SLA ready for Play Console.

---

## Checklist Go-Live (Tên Miền + Tebex Cá Nhân Rút Thẳng Bank VN)

### 1. Gắn Tên Miền + Chặn 100% Việt Nam ở Cloudflare WAF
1. Thêm file `CNAME` vào gốc repo (ví dụ `unboundsuns.com`) và trỏ 4 bản ghi `A` (Cloudflare Proxied) tới GitHub Pages: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
2. Trên **Cloudflare → Security → WAF → Custom rules**:
   - Tạo rule: `(ip.geoip.country eq "VN" and http.request.uri.path contains "/shop")` (hoặc toàn site `(ip.geoip.country eq "VN")`) → **Block**.

### 2. Kích Hoạt Tebex Cá Nhân (Nhận Visa/Mastercard Quốc Tế, Rút Thẳng Bank VN)
1. Đăng ký tài khoản cá nhân tại https://creator.tebex.io (chọn **Custom / Headless Webstore**, thiết lập rút tiền **Local Bank Transfer về bank VN**, không cần PayPal).
2. Tạo đúng 9 gói sản phẩm trong Tebex với giá giảm 30% (`$1.39`, `$10.49`, `$20.99`, `$0.69`, `$3.49`, `$6.99`, `$17.49`, `$34.99`, `$69.99`).
3. Copy **Public Token** (`Integrations → API Keys`) + 9 **Package IDs** dán vào [assets/js/config.js](assets/js/config.js) và đổi `tebex.mode: "live"`.
4. Trên Tebex Panel (`Developers → Webhooks → Endpoints`):
   - Thêm Webhook URL: `https://api.yourdomain.com/api/billing/tebex/webhook` (chọn sự kiện `payment.completed`, `payment.disputed`, `payment.refunded`).
   - Copy **Webhook Secret** và gắn vào `/etc/systemd/system/unboundsuns-trial.service` trên VPS `45.115.16.144`:
     ```ini
     Environment=UNBOUNDSUNS_TEBEX_WEBHOOK_SECRET=<YOUR_TEBEX_WEBHOOK_SECRET>
     Environment=UNBOUNDSUNS_TEBEX_PRODUCT_MAP={"<pkg_id_1>":"citadel_pack_starter","<pkg_id_2>":"citadel_vip_pass_30d",...}
     ```
   - Chạy `sudo systemctl daemon-reload && sudo systemctl restart unboundsuns-trial`.

> **Lưu ý Google Play Policy**: Không đặt link trỏ tới `shop.html` ở bên trong bản APK/AAB nộp Google Play để giữ 0% phí cho toàn bộ giao dịch Web Shop Tebex độc lập.
