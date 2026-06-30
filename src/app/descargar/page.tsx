import type { Metadata } from "next";
import { DownloadPage } from "@/components/DownloadPage";

export const metadata: Metadata = {
  title: "Descargar GlucoControl IPS — Posadas, Misiones",
  description:
    "Descargá e instalá GlucoControl IPS en tu celular. Asistente de diabetes del Instituto de Previsión Social de Misiones.",
};

export default function DescargarPage() {
  return <DownloadPage />;
}
