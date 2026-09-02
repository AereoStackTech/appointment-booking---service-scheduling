import { getClients } from "@/lib/data-service";
import { Header } from "@/components/shared/header";
import { ClientDirectoryClient } from "@/components/features/clients/client-directory-client";

export const revalidate = 0;

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Client Directory"
        subtitle="Manage client records, contact histories, and appointment tracking."
      />

      <div className="p-6 max-w-7xl">
        <ClientDirectoryClient initialClients={clients as any} />
      </div>
    </div>
  );
}
