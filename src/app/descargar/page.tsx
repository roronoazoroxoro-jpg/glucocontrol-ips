import type { Metadata } from "next";
import { DownloadPage } from "@/components/DownloadPage";

export const metadata: Metadata = {
  title: "Descargar VitalIPS — Posadas, Misiones",
  description:
    "Descargá e instalá VitalIPS en tu celular. Salud integral del Instituto de Previsión Social de Misiones.",
};

export default function DescargarPage() {
  return <DownloadPage />;
}
