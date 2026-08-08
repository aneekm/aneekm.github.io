import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";

const IN = "src/assets/portrait-source.png";
const OUT = "public/resources/portrait.png";

await mkdir("public/resources", { recursive: true });

await sharp(IN)
  .resize(512, 512, { fit: "inside", withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

const meta = await sharp(OUT).metadata();
const size = (await stat(OUT)).size;
console.log(`wrote ${OUT}: ${meta.width}x${meta.height}, ${size} bytes`);
