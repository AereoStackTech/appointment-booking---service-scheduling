import { getAppointments, getAllServices } from "@/lib/data-service";
import { Header } from "@/components/shared/header";
import { AppointmentsHubClient } from "@/components/features/appointments/appointments-hub-client";

export const revalidate = 0;

export default async function AppointmentsPage() {
  const appointments = await getAppointments();
  const services = await getAllServices();

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Appointments Hub"
        subtitle="Manage client appointments across their full operational lifecycle."
      />

      <div className="p-6 max-w-7xl">
        <AppointmentsHubClient
          appointments={appointments as any}
          services={services as any}
        />
      </div>
    </div>
  );
}
