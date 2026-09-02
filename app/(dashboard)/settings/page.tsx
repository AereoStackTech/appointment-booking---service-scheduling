import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/shared/header";
import { SettingsClient } from "@/components/features/settings/settings-client";

export const revalidate = 0;

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Settings & Studio Configuration"
        subtitle="Manage business policies, booking rules, staff accounts, and system health."
      />

      <div className="p-6 max-w-5xl">
        <SettingsClient user={user as any} />
      </div>
    </div>
  );
}
