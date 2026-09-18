HESTIA - PWA ICONS BIRU
====================
Warna background: #0C63E2 (exact dari logo)

Isi:
- hestia_pwa_192.png (192x192)
- hestia_pwa_512.png (512x512)
- hestia_maskable_192.png (192x192, padding 25% safe area)
- hestia_maskable_512.png (512x512, padding 25% safe area)
- hestia_apple_180.png (180x180 untuk iOS)
- hestia_favicon_32.png (32x32)

manifest.json:
{
  "icons": [
    { "src": "/hestia_pwa_192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/hestia_pwa_512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/hestia_maskable_192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/hestia_maskable_512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}

head:
<link rel="apple-touch-icon" sizes="180x180" href="/hestia_apple_180.png">
<link rel="icon" type="image/png" sizes="32x32" href="/hestia_favicon_32.png">
