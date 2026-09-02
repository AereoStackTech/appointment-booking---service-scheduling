import Link from "next/link";
import { getDashboardData, getAllServices } from "@/lib/data-service";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppointmentStatusBadge } from "@/components/features/appointments/appointment-status-badge";
import { formatTimeRange, formatDateFull, formatDateShort } from "@/lib/time";
import { AppointmentStatus } from "@prisma/client";
import {
  CalendarCheck,
  Clock,
  AlertCircle,
  TrendingUp,
  ExternalLink,
  Plus,
  Layers,
  Calendar,
  Users,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { DashboardAgendaClient } from "@/components/features/dashboard/dashboard-agenda-client";
import { cn } from "@/lib/utils";

export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const { metrics, todayAgenda, recentPending } = await getDashboardData();
  const services = await getAllServices();

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title="Operations Dashboard"
        subtitle={`Welcome back, ${user?.name || "Practitioner"}. Here is your studio run-of-show.`}
        actions={
          <div className="flex items-center space-x-2.5">
            <Link href="/book" target="_blank">
              <Button variant="outline" size="sm" className="text-xs font-medium border-stone-200 text-stone-700 hover:bg-stone-50">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
                Booking Portal
              </Button>
            </Link>
            <Link href="/appointments">
              <Button variant="primary" size="sm" className="text-xs font-semibold">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                New Booking
              </Button>
            </Link>
          </div>
        }
      />

      <div className="p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Today's Appointments */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <p className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">
              Today&apos;s Appointments
            </p>
            <div className="flex items-baseline justify-between gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-stone-900">
                {metrics.todayCount.toString().padStart(2, "0")}
              </span>
              <span className="text-xs text-emerald-600 font-medium">
                Active run-of-show
              </span>
            </div>
          </div>

          {/* Card 2: Pending Requests */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <p className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">
              Pending Requests
            </p>
            <div className="flex items-baseline justify-between gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-stone-900">
                {metrics.pendingCount.toString().padStart(2, "0")}
              </span>
              <span className={cn("text-xs font-medium", metrics.pendingCount > 0 ? "text-amber-600" : "text-stone-400")}>
                {metrics.pendingCount > 0 ? "Requires review" : "Up to date"}
              </span>
            </div>
          </div>

          {/* Card 3: Confirmed Sessions */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <p className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">
              Confirmed Schedule
            </p>
            <div className="flex items-baseline justify-between gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-stone-900">
                {metrics.confirmedCount.toString().padStart(2, "0")}
              </span>
              <span className="text-xs text-stone-400 font-medium">
                Locked & ready
              </span>
            </div>
          </div>

          {/* Card 4: Est Revenue */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <p className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">
              Est. Realized Revenue
            </p>
            <div className="flex items-baseline justify-between gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-stone-900">
                ${metrics.totalValue.toLocaleString()}
              </span>
              <span className="text-xs text-stone-400 font-medium">
                {metrics.completedCount} completed
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Agenda & Pending Workboard */}
        <DashboardAgendaClient
          todayAgenda={todayAgenda as any}
          recentPending={recentPending as any}
          services={services as any}
        />
      </div>
    </div>
  );
}
