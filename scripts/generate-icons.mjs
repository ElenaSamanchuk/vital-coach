import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svg = fs.readFileSync(path.join(__dirname, "../public/icons/icon.svg"));

for (const size of [192, 512]) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(path.join(__dirname, `../public/icons/icon-${size}.png`));
  console.log(`icon-${size}.png`);
}
