const res = await fetch("https://ipsmisiones.com.ar/");
const html = await res.text();
const patterns = [
  /src=["']([^"']*logo[^"']*)["']/gi,
  /wp-content\/uploads\/[^"'\s>]+\.(?:png|svg|jpg|webp)/gi,
];
for (const p of patterns) {
  const matches = [...html.matchAll(p)].map((m) => m[1] ?? m[0]);
  console.log([...new Set(matches)].join("\n"));
}
