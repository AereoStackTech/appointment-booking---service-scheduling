import { getWeeklyAvailability, getBlackoutPeriods } from "@/lib/data-service";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/shared/header";
import { AvailabilityManagerClient } from "@/components/features/availability/availability-manager-client";

export const revalidate = 0;

export default async function AvailabilityPage() {
  const user = await getCurrentUser();
  const weekly = await getWeeklyAvailability();
  const blackout = await getBlackoutPeriods();

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Availability & Studio Hours"
        subtitle="Configure weekly operating schedules and studio blackout holiday dates."
      />

      <div className="p-6 max-w-6xl">
        <AvailabilityManagerClient
          initialWeekly={weekly as any}
          initialBlackout={blackout as any}
          isAdmin={user?.role === "ADMIN"}
        />
      </div>
    </div>
  );
}
