const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputIcon = path.join(__dirname, 'src/assets/images/icon-app.png');
const outputDir = path.join(__dirname, 'src/assets/icons');

async function generateIcons() {
  for (const size of sizes) {
    const padding = Math.floor(size * 0.15);
    const iconSize = size - (padding * 2);

    const circleBackground = Buffer.from(
      `<svg width="${size}" height="${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>
      </svg>`
    );

    const resizedIcon = await sharp(inputIcon)
      .resize(iconSize, iconSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toBuffer();

    await sharp(circleBackground)
      .composite([{
        input: resizedIcon,
        top: padding,
        left: padding
      }])
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));

    console.log(`Generated icon-${size}x${size}.png`);
  }

  console.log('All icons generated!');
}

generateIcons().catch(console.error);
