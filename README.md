# UNBOUND SUNS — Official Game Portal & Standalone Web Shop (−30% Direct Visa)

Official AAA web portal for **Unbound Suns** (`com.aetherforge.unboundsuns`) by **AetherForge Interactive**.

## Live Features
- **Cinematic Space Hero (`index.html`)**: High-res Dyson Halo key art layered with a Three.js r164 WebGL additive starfield & orbital solar ring.
- **Interactive 349-Sector Live Star Atlas**: Powered directly by the game's real `world.json` topology (349 sectors, 656 warp lanes, 24 orbital stations, pan/zoom/search/security filters/jump-gate navigation).
- **Interactive Citadel Fleet Hangar**: 8 authentic starship hulls (T1 Frigate through T6 Abyssal Dreadnought + Sovereign Flagship) with live stat bars and real Foundry crafting recipes.
- **Four Security Frontiers & Sovereign Banners**: Blue Safe (108), Yellow Contested (112), Red Lethal (76), Black Abyssal Void (53), plus all 3 server-audited banners with hard-pity specs.
- **Standalone Global USD Web Shop (`shop.html`, −30% vs In-App Store)**:
  - All **9 official Citadel SKUs** (`citadel_pack_starter`, `citadel_vip_pass_30d`, `citadel_pack_commander`, `citadel_gold_60` through `citadel_gold_6500`) priced **~30% lower** than in-app mobile store pricing (`$0.69` – `$69.99` USD).
  - Full international **Visa / Mastercard / JCB / Amex** checkout engine modeled after MSoftware `CheckoutContent` (`PAYMENT07` card validation, interactive sandbox presets `4242...` Success / `5200...` Declined / `4000...` 3D Secure OTP `123456`, Order Receipt, and `Idempotency-Key` live API hook).
- **Pilot Command Portal (`account.html`)**: Ready to connect directly to `UnboundSuns.Server` (`POST /api/auth/login`, `GET /api/me`, `GET /health`) once an HTTPS API subdomain is bound.
- **Google Play Console Compliance Pages (`privacy.html`, `terms.html`, `support.html`)**: Public HTTPS Privacy Policy & 7-day Data Deletion page ready to paste straight into Play Console.

---

## Checklist Khi Bạn Mua Tên Miền (5 Phút Go-Live)

### 1. Gắn Tên Miền + HTTPS Miễn Phí (Cloudflare + GitHub Pages)
1. Thêm file `CNAME` vào thư mục gốc repo chứa tên miền của bạn (ví dụ `unboundsuns.com`).
2. Trên **Cloudflare DNS**, trỏ 4 bản ghi `A` (chế độ Proxied ☁️ cam) tới GitHub Pages:
   - `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Thêm bản ghi `CNAME` `www` → `ngominhtam1998.github.io`.
3. Vào **GitHub Repo → Settings → Pages → Enforce HTTPS**.

### 2. Chặn 100% Việt Nam ở Tầng Edge (Cloudflare WAF Free — Chính Xác Tuyệt Đối)
Để chặn 100% truy cập từ Việt Nam vào Web Shop (hoặc toàn bộ web) không thể lách bằng JS:
- Vào **Cloudflare → Security → WAF → Custom rules → Create rule**:
  - **Rule 1 (Chặn toàn site)**: `(ip.geoip.country eq "VN")` → Action: **Block**.
  - **Hoặc chỉ chặn Web Shop**: `(ip.geoip.country eq "VN" and http.request.uri.path contains "/shop")` → Action: **Block**.

### 3. Nối Live HTTPS API (`api.yourdomain.com` → `45.115.16.144:5188`)
1. Trỏ subdomain `api.yourdomain.com` về IP VPS `45.115.16.144` (bật SSL reverse proxy trên VPS hoặc Cloudflare Flexible/Full TLS).
2. Mở [assets/js/config.js](assets/js/config.js) và điền:
   ```js
   apiBase: "https://api.yourdomain.com"
   ```

### 4. Chuyển Kênh Visa từ Sandbox sang Thanh Toán Thật (`live`)
Mở [assets/js/config.js](assets/js/config.js) và cập nhật khối `webShop`:
```js
webShop: {
  mode: "live",
  webDiscountPercent: 30,
  currency: "USD",
  excludedRegions: ["VN"],
  liveCheckoutEndpoint: "https://api.yourdomain.com/api/webshop/visa/checkout",
  hostedCheckoutBaseUrl: "" // hoặc dán URL Xsolla / Tebex / Stripe Checkout
}
```
> **Lưu ý Google Play Policy**: Tuyệt đối không đặt đường link trỏ về `shop.html` ở bên trong bản APK/AAB nộp Google Play để giữ 0% phí cho các giao dịch Web Shop độc lập.
