import fs from 'fs';
import path from 'path';

// Preserve the official approved 1024x1024 gold logo image (Image 2 - Classic Crest) with full Arabic calligraphy ("مَحْفَظَتِي العَقَارِيَّة")
const publicDir = path.resolve('public');
const goldLogoSrc = path.resolve('src/assets/images/portfolio_gold_logo_fatha_1791544967622.jpg');

if (fs.existsSync(goldLogoSrc)) {
  fs.copyFileSync(goldLogoSrc, path.join(publicDir, 'portfolio-logo.jpg'));
  fs.copyFileSync(goldLogoSrc, path.join(publicDir, 'app-logo.jpg'));
}

console.log('✅ Official gold logo (Image 2 - مَحْفَظَتِي العَقَارِيَّة) synced to public/');

