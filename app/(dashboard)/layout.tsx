import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/shared/sidebar";

export const revalidate = 0;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If user not authenticated, redirect to login
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-stone-50 text-stone-900">
      {/* Fixed / Sticky Operations Sidebar */}
      <Sidebar user={user as any} />

      {/* Main Operating Surface */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
