/** Generate public vector/raster identity assets from one geometry and palette. */
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { fileURLToPath } from "node:url";
const brand = JSON.parse(
  await readFile(
    new URL("../src/constants/brand.json", import.meta.url),
    "utf8",
  ),
);
const out = new URL("../public/", import.meta.url);
const mark = `<path d="${brand.monogram}" fill="${brand.foreground}" fill-rule="evenodd"/><path d="${brand.asterisk}" fill="none" stroke="${brand.foreground}" stroke-width="12"/>`;
const icon = (size) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}"><title>Bintang studio monogram</title><rect width="512" height="512" fill="${brand.background}"/>${mark}</svg>\n`;
for (const [name, size] of [
  ["favicon", 64],
  ["icon-192", 192],
  ["icon-512", 512],
]) {
  await writeFile(new URL(`${name}.svg`, out), icon(size));
  await sharp(Buffer.from(icon(size)))
    .resize(size, size)
    .png()
    .toFile(fileURLToPath(new URL(`${name}.png`, out)));
}
await writeFile(new URL("brand-mark.svg", out), icon(512));
await sharp(Buffer.from(icon(180)))
  .resize(180, 180)
  .png()
  .toFile(fileURLToPath(new URL("apple-touch-icon.png", out)));
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<title>Bintang — Front-End and AI-Native Engineer</title>
<rect width="1200" height="630" fill="${brand.background}"/>
<g fill="none" stroke="${brand.border}" stroke-width="1"><ellipse cx="600" cy="315" rx="590" ry="195" transform="rotate(-23 600 315)"/><ellipse cx="600" cy="315" rx="380" ry="365" transform="rotate(28 600 315)"/><path d="M40 78H1160M40 550H1160"/></g>
<path d="M820 60Q1050 140 1100 310" fill="none" stroke="${brand.accent}" opacity=".6"/>
<g font-family="monospace" font-size="13" letter-spacing="2" fill="${brand.secondary}"><text x="52" y="49">FRONT-END &amp; AI-NATIVE ENGINEER</text><text x="1148" y="49" text-anchor="end">JAKARTA, INDONESIA</text><text x="52" y="591">WSA GLOBAL WINNER · 2025</text><text x="1148" y="591" text-anchor="end">STAREEZY.TECH</text></g>
<text x="198" y="308" fill="${brand.foreground}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="166" letter-spacing="-12">BINTANG</text>
<g stroke="${brand.foreground}" stroke-width="6" transform="translate(965 251)"><path d="M0-43V43M-43 0H43M-30-30L30 30M-30 30L30-30"/></g>
<text x="600" y="398" fill="${brand.foreground}" font-family="Arial, Helvetica, sans-serif" font-size="32" text-anchor="middle">I build complete products, front-end to the <tspan font-family="Georgia,serif" font-style="italic">edge.</tspan></text>
<text x="600" y="448" fill="${brand.muted}" font-family="Arial, Helvetica, sans-serif" font-size="20" text-anchor="middle">Muhammad Bintang Al Akbar</text>
</svg>\n`;
await writeFile(new URL("og-image.svg", out), og);
await sharp(Buffer.from(og))
  .png()
  .toFile(fileURLToPath(new URL("og-image.png", out)));
console.log(
  "Generated SVG/PNG favicons, app icons, Apple touch icon, and 1200 × 630 OG fallback.",
);
