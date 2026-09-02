import { getAllServices } from "@/lib/data-service";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/shared/header";
import { ServiceCatalogClient } from "@/components/features/services/service-catalog-client";

export const revalidate = 0;

export default async function ServicesPage() {
  const user = await getCurrentUser();
  const services = await getAllServices(false); // fetch all including inactive

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Service Catalog"
        subtitle="Define appointment packages, durations, buffer times, and pricing models."
      />

      <div className="p-6 max-w-7xl">
        <ServiceCatalogClient
          initialServices={services as any}
          isAdmin={user?.role === "ADMIN"}
        />
      </div>
    </div>
  );
}
