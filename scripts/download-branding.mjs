import { mkdir, writeFile, copyFile } from "fs/promises";
import path from "path";

const base = "https://ipsmisiones.com.ar/wp-content/uploads";
const assets = [
  { url: `${base}/2020/12/ips-logo-azul.svg`, dest: "public/branding/ips-logo.svg" },
  { url: `${base}/2021/02/favicon.png`, dest: "public/icons/icon-192.png" },
];

await mkdir("public/branding", { recursive: true });
await mkdir("public/icons", { recursive: true });

for (const { url, dest } of assets) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  console.log("Saved", dest);
}

await copyFile("public/icons/icon-192.png", "public/icons/icon-512.png");
await copyFile("public/icons/icon-192.png", "public/apple-touch-icon.png");
console.log("Icons ready");
