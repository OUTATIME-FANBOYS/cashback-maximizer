import * as fs from 'fs';
import * as path from 'path';

// Requires: npm install sharp
// Then run: npx tsx scripts/generate-app-icon.ts

async function main() {
  const sharp = (await import('sharp')).default;

  const svgPath = path.join(process.cwd(), 'public/app-icon.svg');
  const outPath = path.join(process.cwd(), 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');

  const svg = fs.readFileSync(svgPath);

  await sharp(svg)
    .resize(1024, 1024)
    .png()
    .toFile(outPath);

  console.log(`✅ Icon written to ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
