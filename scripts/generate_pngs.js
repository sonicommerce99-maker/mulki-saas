import fs from 'fs';
import path from 'path';

// Preserve the official generated 1024x1024 gold logo images with full Arabic typography ("مَحْفَظَتِي العَقَارِيَّة")
const publicDir = path.resolve('public');
const goldLogoSrc = path.resolve('src/assets/images/mahfadati_gold_logo_fatha_1791544944516.jpg');
const pwaIconSrc = path.resolve('src/assets/images/pwa_icon_fixed_fatha_mim_1791545169832.jpg');

if (fs.existsSync(goldLogoSrc)) {
  fs.copyFileSync(goldLogoSrc, path.join(publicDir, 'portfolio-logo.jpg'));
  fs.copyFileSync(goldLogoSrc, path.join(publicDir, 'app-logo.jpg'));
}

if (fs.existsSync(pwaIconSrc)) {
  fs.copyFileSync(pwaIconSrc, path.join(publicDir, 'pwa-512x512.png'));
  fs.copyFileSync(pwaIconSrc, path.join(publicDir, 'pwa-192x192.png'));
  fs.copyFileSync(pwaIconSrc, path.join(publicDir, 'apple-touch-icon.png'));
}

console.log('✅ Official gold logo images with مَحْفَظَتِي العَقَارِيَّة synced to public/');
