"use client";

import * as React from "react";
import { AppointmentTable } from "./appointment-table";
import { AppointmentCalendarView } from "./appointment-calendar-view";
import { Button } from "@/components/ui/button";
import { List, Calendar as CalendarIcon, ExternalLink } from "lucide-react";
import Link from "next/link";

interface AppointmentsHubClientProps {
  appointments: any[];
  services: any[];
}

export function AppointmentsHubClient({
  appointments,
  services,
}: AppointmentsHubClientProps) {
  const [activeTab, setActiveTab] = React.useState<"table" | "calendar">("table");

  return (
    <div className="space-y-4">
      {/* View Switcher Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1 bg-stone-200/75 p-1 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("table")}
            className={`flex items-center px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "table"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <List className="w-3.5 h-3.5 mr-1.5" />
            Table Directory
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === "calendar"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
            Daily Timeline View
          </button>
        </div>

        <Link href="/book" target="_blank">
          <Button variant="outline" size="sm" className="text-xs">
            <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-stone-500" />
            Open Booking Interface
          </Button>
        </Link>
      </div>

      {/* Tab Content */}
      {activeTab === "table" ? (
        <AppointmentTable
          initialAppointments={appointments}
          services={services}
        />
      ) : (
        <AppointmentCalendarView appointments={appointments} />
      )}
    </div>
  );
}
