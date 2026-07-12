import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VitalIPS — Salud integral · IPS Misiones",
    short_name: "VitalIPS",
    description:
      "Salud integral del Instituto de Previsión Social de Misiones: glucosa, presión, peso, corazón, alimentación y síntomas.",
    start_url: "/app",
    display: "standalone",
    background_color: "#eef8f6",
    theme_color: "#0b4f8c",
    orientation: "portrait-primary",
    lang: "es-AR",
    categories: ["health", "medical", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [],
  };
}
