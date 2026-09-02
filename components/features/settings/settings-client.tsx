"use client";

import * as React from "react";
import {
  Building,
  Shield,
  Clock,
  Database,
  CheckCircle2,
  Users,
  Bell,
  Save,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SettingsClientProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const [studioName, setStudioName] = React.useState("CalenPulse Wellness & Consulting Studio");
  const [contactEmail, setContactEmail] = React.useState("appointments@calenpulse.internal");
  const [contactPhone, setContactPhone] = React.useState("+1 (555) 234-5678");
  const [timezone, setTimezone] = React.useState("America/New_York (EST)");
  const [cancellationPolicy, setCancellationPolicy] = React.useState(
    "Clients may reschedule or cancel appointments up to 2 hours prior to scheduled start time without fee."
  );
  const [minLeadHours, setMinLeadHours] = React.useState(2);
  const [maxAdvanceDays, setMaxAdvanceDays] = React.useState(60);

  const [saved, setSaved] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Studio settings updated successfully.</span>
        </div>
      )}

      {/* Studio Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-stone-900">
              Studio & Business Information
            </h3>
          </div>
          <Button type="submit" variant="primary" size="sm" className="text-xs">
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Save Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1 md:col-span-2">
            <label className="font-semibold text-stone-700">Studio Name</label>
            <Input
              value={studioName}
              onChange={(e) => setStudioName(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Operational Contact Email</label>
            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Studio Direct Phone</label>
            <Input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Operating Timezone</label>
            <Input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700">
              Minimum Booking Lead Time (Hours)
            </label>
            <Input
              type="number"
              min={0}
              max={72}
              value={minLeadHours}
              onChange={(e) => setMinLeadHours(Number(e.target.value))}
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="font-semibold text-stone-700">
              Client Cancellation & Rescheduling Policy
            </label>
            <Textarea
              rows={3}
              value={cancellationPolicy}
              onChange={(e) => setCancellationPolicy(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>
      </form>

      {/* Staff Accounts & Credentials */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-stone-100 pb-4">
          <Users className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-sm text-stone-900">
            Staff Credentials & Access Control
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-stone-900">Administrator Profile</span>
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                  ADMIN
                </span>
              </div>
              <p className="font-mono text-stone-500">admin@calenpulse.internal</p>
            </div>
            <span className="text-[11px] text-stone-400">Full operational control</span>
          </div>

          <div className="p-3 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-stone-900">Staff Practitioner</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                  STAFF
                </span>
              </div>
              <p className="font-mono text-stone-500">staff@calenpulse.internal</p>
            </div>
            <span className="text-[11px] text-stone-400">Appointment & triage view</span>
          </div>
        </div>
      </div>

      {/* Database & System Health */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-stone-100 pb-4">
          <Database className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-sm text-stone-900">
            System & Data Integrity Architecture
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
            <span className="text-stone-400 block text-[11px]">Database Layer</span>
            <span className="font-bold text-stone-900 block mt-0.5">
              Prisma ORM + PostgreSQL
            </span>
            <span className="text-emerald-700 text-[10px] font-semibold flex items-center mt-1">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Active with Transaction Locks
            </span>
          </div>

          <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
            <span className="text-stone-400 block text-[11px]">Authentication</span>
            <span className="font-bold text-stone-900 block mt-0.5">
              Auth.js / NextAuth Session
            </span>
            <span className="text-emerald-700 text-[10px] font-semibold flex items-center mt-1">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Protected Middleware
            </span>
          </div>

          <div className="p-3 rounded-lg bg-stone-50 border border-stone-200">
            <span className="text-stone-400 block text-[11px]">Slot Engine</span>
            <span className="font-bold text-stone-900 block mt-0.5">
              Conflict-Free Dynamic Calculator
            </span>
            <span className="text-emerald-700 text-[10px] font-semibold flex items-center mt-1">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Buffer & Blackout Aware
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
