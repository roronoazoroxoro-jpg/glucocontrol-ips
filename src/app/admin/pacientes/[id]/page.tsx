import { AdminPatientDetail } from "@/components/AdminPatientDetail";

export default async function AdminPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminPatientDetail patientId={id} />;
}
