"use client";

import * as React from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createServiceAction, updateServiceAction } from "@/lib/actions/service";
import { ServiceInput } from "@/lib/validations/service";
import { Loader2, Layers } from "lucide-react";

interface ServiceFormDialogProps {
  serviceToEdit?: any | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#6366F1", // Indigo
  "#14B8A6", // Teal
];

export function ServiceFormDialog({
  serviceToEdit,
  open,
  onClose,
  onSuccess,
}: ServiceFormDialogProps) {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <ServiceFormDialogContent
        key={serviceToEdit?.id || "new-service"}
        serviceToEdit={serviceToEdit}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Dialog>
  );
}

function ServiceFormDialogContent({
  serviceToEdit,
  onClose,
  onSuccess,
}: {
  serviceToEdit?: any | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [name, setName] = React.useState(serviceToEdit?.name || "");
  const [slug, setSlug] = React.useState(serviceToEdit?.slug || "");
  const [description, setDescription] = React.useState(serviceToEdit?.description || "");
  const [durationMin, setDurationMin] = React.useState(serviceToEdit?.durationMin || 45);
  const [bufferMin, setBufferMin] = React.useState(serviceToEdit?.bufferMin ?? 15);
  const [price, setPrice] = React.useState(serviceToEdit?.price || 75.0);
  const [isActive, setIsActive] = React.useState(serviceToEdit ? serviceToEdit.isActive : true);
  const [colorTag, setColorTag] = React.useState(serviceToEdit?.colorTag || "#3B82F6");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Auto-generate slug from name if creating new service
  const handleNameChange = (val: string) => {
    setName(val);
    if (!serviceToEdit) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: ServiceInput = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      durationMin: Number(durationMin),
      bufferMin: Number(bufferMin),
      price: Number(price),
      isActive,
      colorTag,
    };

    try {
      let res;
      if (serviceToEdit) {
        res = await updateServiceAction(serviceToEdit.id, payload);
      } else {
        res = await createServiceAction(payload);
      }

      if (!res.success) {
        setError(res.error || "Failed to save service offering.");
        setLoading(false);
        return;
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogClose onClick={onClose} />
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <DialogTitle>
              {serviceToEdit ? "Edit Service Offering" : "Create New Service"}
            </DialogTitle>
          </div>
          <DialogDescription>
            Configure appointment duration, buffer time between clients, pricing, and visibility.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 mb-4 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-stone-800">
              Service Name <span className="text-rose-500">*</span>
            </label>
            <Input
              required
              placeholder="e.g. Comprehensive Strategic Review"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-800">
              URL Slug (Direct Link Identifier) <span className="text-rose-500">*</span>
            </label>
            <Input
              required
              placeholder="e.g. comprehensive-review"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="text-xs font-mono"
            />
            <p className="text-[11px] text-stone-400">
              Accessible at: <code>/book/{slug || "slug"}</code>
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-800">
              Description & Deliverables <span className="text-rose-500">*</span>
            </label>
            <Textarea
              required
              placeholder="Describe what is included in this session..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-800">
                Duration (Min) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                required
                min={5}
                max={480}
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-800">
                Buffer (Min) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                required
                min={0}
                max={120}
                value={bufferMin}
                onChange={(e) => setBufferMin(Number(e.target.value))}
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-800">
                Price ($ USD) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-stone-800 block">
              Color Tag Indicator
            </label>
            <div className="flex items-center space-x-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setColorTag(color)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    colorTag === color
                      ? "border-stone-900 scale-110 shadow-xs"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isActive" className="text-xs font-semibold text-stone-800 cursor-pointer">
              Active in Public Booking Catalog
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
            {serviceToEdit ? "Update Service" : "Create Service"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
