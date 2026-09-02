"use client";

import * as React from "react";
import Link from "next/link";
import { Search, User, Mail, Phone, Calendar, ChevronRight, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDateShort } from "@/lib/time";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface ClientItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  notes: string | null;
  appointments: Array<{
    id: string;
    referenceCode: string;
    startTime: Date | string;
    status: string;
    service: { name: string; price: number };
  }>;
}

export function ClientDirectoryClient({
  initialClients,
}: {
  initialClients: ClientItem[];
}) {
  const [clients, setClients] = React.useState(initialClients);
  const [search, setSearch] = React.useState("");

  const filteredClients = React.useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase().trim();
    return clients.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [clients, search]);

  return (
    <div className="space-y-4">
      {/* Search Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Search by client name, email, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="text-xs text-stone-500 font-medium">
          Total Clients: <strong className="text-stone-900">{filteredClients.length}</strong>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Total Visits</TableHead>
              <TableHead>Latest Session</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-stone-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30 text-stone-400" />
                  <p className="font-medium text-stone-600">No client records found</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Clients are created automatically whenever an appointment is submitted.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => {
                const latestAppointment = client.appointments?.[0];

                return (
                  <TableRow key={client.id} className="group">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-xs text-stone-700">
                          {client.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            href={`/clients/${client.id}`}
                            className="font-bold text-xs text-stone-900 hover:text-indigo-600 hover:underline"
                          >
                            {client.fullName}
                          </Link>
                          {client.notes && (
                            <p className="text-[11px] text-stone-400 truncate max-w-xs">
                              {client.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-stone-700 space-y-0.5">
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 mr-1.5 text-stone-400" />
                          <span className="font-mono">{client.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-1.5 text-stone-400" />
                          <span className="font-mono">{client.phone}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                        {client.appointments?.length || 0} sessions
                      </span>
                    </TableCell>

                    <TableCell>
                      {latestAppointment ? (
                        <div className="text-xs">
                          <p className="font-medium text-stone-900">
                            {latestAppointment.service.name}
                          </p>
                          <p className="text-[11px] text-stone-500 font-mono">
                            {formatDateShort(latestAppointment.startTime)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400 italic">None</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <Link href={`/clients/${client.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-stone-700"
                        >
                          View Profile
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
