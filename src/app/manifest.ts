import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GlucoControl IPS — Posadas, Misiones",
    short_name: "GlucoControl IPS",
    description:
      "Asistente inteligente de diabetes del Instituto de Previsión Social de Misiones. Seguimiento de glucosa, alimentación y voz con IA.",
    start_url: "/app",
    display: "standalone",
    background_color: "#f0fdf4",
    theme_color: "#047857",
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
