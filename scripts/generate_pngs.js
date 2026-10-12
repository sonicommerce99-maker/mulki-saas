import fs from 'fs';
import path from 'path';

// Preserve the official generated 1024x1024 gold logo images with full Arabic typography ("مَحْفَظَتِي العَقَارِيَّة")
const publicDir = path.resolve('public');
const goldLogoSrc = path.resolve('src/assets/images/mahfadati_gold_logo_fatha_1791544944516.jpg');

if (fs.existsSync(goldLogoSrc)) {
  fs.copyFileSync(goldLogoSrc, path.join(publicDir, 'portfolio-logo.jpg'));
  fs.copyFileSync(goldLogoSrc, path.join(publicDir, 'app-logo.jpg'));
  fs.copyFileSync(goldLogoSrc, path.join(publicDir, 'pwa-512x512.png'));
  fs.copyFileSync(goldLogoSrc, path.join(publicDir, 'pwa-192x192.png'));
  fs.copyFileSync(goldLogoSrc, path.join(publicDir, 'apple-touch-icon.png'));
}

console.log('✅ Official gold logo (Image 2) with مَحْفَظَتِي العَقَارِيَّة synced to public/ and PWA icons');
