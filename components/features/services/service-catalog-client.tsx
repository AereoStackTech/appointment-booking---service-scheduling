"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  Plus,
  Clock,
  ExternalLink,
  Edit2,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceFormDialog } from "./service-form-dialog";
import { toggleServiceStatusAction } from "@/lib/actions/service";

interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  durationMin: number;
  bufferMin: number;
  price: number;
  isActive: boolean;
  colorTag: string;
}

interface ServiceCatalogClientProps {
  initialServices: ServiceItem[];
  isAdmin: boolean;
}

export function ServiceCatalogClient({
  initialServices,
  isAdmin,
}: ServiceCatalogClientProps) {
  const router = useRouter();
  const [services, setServices] = React.useState(initialServices);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [serviceToEdit, setServiceToEdit] = React.useState<ServiceItem | null>(null);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const handleCreate = () => {
    setServiceToEdit(null);
    setDialogOpen(true);
  };

  const handleEdit = (service: ServiceItem) => {
    setServiceToEdit(service);
    setDialogOpen(true);
  };

  const handleToggle = async (service: ServiceItem) => {
    setTogglingId(service.id);
    const nextState = !service.isActive;

    try {
      const res = await toggleServiceStatusAction(service.id, nextState);
      if (res.success) {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, isActive: nextState } : s))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div>
          <h3 className="font-bold text-sm text-stone-900">
            Active Catalog: {services.filter((s) => s.isActive).length} of{" "}
            {services.length} services enabled
          </h3>
          <p className="text-xs text-stone-500">
            Services marked Active appear on the customer booking portal.
          </p>
        </div>

        {isAdmin && (
          <Button variant="primary" size="sm" onClick={handleCreate} className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add New Service
          </Button>
        )}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((service) => {
          const isToggling = togglingId === service.id;

          return (
            <div
              key={service.id}
              className={`bg-white rounded-xl border p-5 flex flex-col justify-between transition-all shadow-xs ${
                service.isActive
                  ? "border-stone-200 hover:border-stone-300"
                  : "border-stone-200 bg-stone-50/50 opacity-75"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: service.colorTag || "#3B82F6" }}
                    />
                    <h4 className="font-bold text-base text-stone-900 leading-snug">
                      {service.name}
                    </h4>
                  </div>
                  <span className="font-mono text-base font-bold text-stone-900 shrink-0">
                    ${service.price.toFixed(2)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-stone-500 leading-relaxed line-clamp-3 mb-4">
                  {service.description}
                </p>

                {/* Timing Specs */}
                <div className="bg-stone-50 rounded-lg p-3 border border-stone-100 text-xs text-stone-600 space-y-1 font-mono mb-4">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Duration:</span>
                    <span className="font-semibold text-stone-800">
                      {service.durationMin} minutes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Post-Session Buffer:</span>
                    <span className="font-semibold text-stone-800">
                      +{service.bufferMin} minutes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Total Blocked:</span>
                    <span className="font-semibold text-stone-800">
                      {service.durationMin + service.bufferMin} minutes
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Controls */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => handleToggle(service)}
                      disabled={isToggling}
                      className="flex items-center text-xs font-semibold cursor-pointer"
                    >
                      {isToggling ? (
                        <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                      ) : service.isActive ? (
                        <span className="text-emerald-700 flex items-center bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                          Active
                        </span>
                      ) : (
                        <span className="text-stone-500 flex items-center bg-stone-100 px-2 py-0.5 rounded border border-stone-200 text-[11px]">
                          Disabled
                        </span>
                      )}
                    </button>
                  ) : (
                    <Badge variant={service.isActive ? "active" : "inactive"}>
                      {service.isActive ? "Active" : "Disabled"}
                    </Badge>
                  )}

                  {service.isActive && (
                    <Link
                      href={`/book/${service.slug}`}
                      target="_blank"
                      className="text-[11px] text-stone-400 hover:text-indigo-600 flex items-center"
                      title="Preview public booking page"
                    >
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                  )}
                </div>

                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(service)}
                    className="h-7 px-2 text-xs text-stone-600 hover:text-stone-900"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Dialog */}
      <ServiceFormDialog
        serviceToEdit={serviceToEdit}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
