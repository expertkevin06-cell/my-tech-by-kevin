import sharp from "sharp";
import fs from "node:fs";

const dir = "assets/icons";
const svg      = fs.readFileSync(`${dir}/icon.svg`);
const svgMask  = fs.readFileSync(`${dir}/icon-maskable.svg`);

const jobs = [
  [svg,     192, `${dir}/icon-192.png`],
  [svg,     512, `${dir}/icon-512.png`],
  [svgMask, 512, `${dir}/icon-maskable-512.png`],
  [svg,      32, `${dir}/favicon-32.png`],
  [svg,     180, `${dir}/apple-touch-180.png`]
];

for (const [buf, size, out] of jobs){
  await sharp(buf, { density: 300 })
    .resize(size, size, { fit: "contain", background: { r: 11, g: 15, b: 26, alpha: 1 } })
    .png()
    .toFile(out);
  console.log("OK", out, size + "x" + size);
}
