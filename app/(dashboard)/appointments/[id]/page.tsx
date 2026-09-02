import { notFound } from "next/navigation";
import { getAppointmentById } from "@/lib/data-service";
import { Header } from "@/components/shared/header";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { AppointmentDetailClient } from "@/components/features/appointments/appointment-detail-client";

export const revalidate = 0;

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appointment = await getAppointmentById(id);

  if (!appointment) {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title={`Appointment: ${appointment.referenceCode}`}
        subtitle="Detailed booking record, client history, and status audit trail."
      />

      <div className="p-6 max-w-6xl space-y-4">
        <Breadcrumbs
          items={[
            { label: "Appointments", href: "/appointments" },
            { label: appointment.referenceCode },
          ]}
        />

        <AppointmentDetailClient appointment={appointment as any} />
      </div>
    </div>
  );
}
