"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  CalendarPlus,
  Download,
  Share2,
  Sparkles,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { createPublicBookingAction } from "@/lib/actions/booking";
import {
  formatDateFull,
  formatDateIso,
  formatTimeRange,
  formatTime12,
} from "@/lib/time";
import {
  generateGoogleCalendarUrl,
  generateIcsFile,
  downloadIcsFile,
} from "@/lib/calendar-export";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

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

interface SlotItem {
  time: string;
  startTimeIso: string;
  endTimeIso: string;
  available: boolean;
  conflictReason?: string;
}

interface BookingWizardProps {
  services: ServiceItem[];
  preselectedServiceSlug?: string;
}

export function BookingWizard({
  services,
  preselectedServiceSlug,
}: BookingWizardProps) {
  const { t, formatDate } = useLanguage();

  // Step tracking: 1 = Service, 2 = Date & Time, 3 = Client Details, 4 = Confirmation
  const initialService = React.useMemo(() => {
    if (preselectedServiceSlug) {
      return services.find((s) => s.slug === preselectedServiceSlug && s.isActive) || null;
    }
    return null;
  }, [preselectedServiceSlug, services]);

  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(initialService ? 2 : 1);

  // Form State
  const [selectedService, setSelectedService] = React.useState<ServiceItem | null>(initialService);

  const [selectedDate, setSelectedDate] = React.useState<string>(formatDateIso(new Date()));
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);

  // Availability query state
  const [slots, setSlots] = React.useState<SlotItem[]>([]);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [isClosed, setIsClosed] = React.useState(false);
  const [closedReason, setClosedReason] = React.useState<string | undefined>(undefined);

  // Client Details Form
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [clientNotes, setClientNotes] = React.useState("");

  // Submission state
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = React.useState<any>(null);

  // Fetch slots whenever service or date changes
  React.useEffect(() => {
    if (!selectedService || !selectedDate) return;

    let isMounted = true;
    fetch(`/api/availability?serviceId=${selectedService.id}&date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.slots) {
          setSlots(data.slots);
          setIsClosed(!!data.isClosed);
          setClosedReason(data.closedReason);
        } else {
          setSlots([]);
          setIsClosed(true);
          setClosedReason(data.error || "No slots available");
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setSlots([]);
        setIsClosed(true);
        setClosedReason("Failed to load availability");
      })
      .finally(() => {
        if (isMounted) setLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedService, selectedDate]);

  // Handle Booking submission
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedSlot) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await createPublicBookingAction({
        serviceId: selectedService.id,
        date: selectedDate,
        slotTime: selectedSlot,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        clientNotes: clientNotes.trim() || undefined,
      });

      if (!res.success) {
        setSubmitError(res.error || "Booking could not be finalized. Please select another slot.");
        setSubmitting(false);
        return;
      }

      setConfirmedBooking(res.appointment);
      setStep(4);
    } catch (err: any) {
      setSubmitError(err?.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step Indicator Header (Steps 1 - 3) */}
      {step < 4 && (
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-stone-200 w-full z-0" />
            
            {/* Step 1 */}
            <div
              className={cn(
                "relative z-10 flex flex-col items-center cursor-pointer",
                step >= 1 ? "text-stone-900" : "text-stone-400"
              )}
              onClick={() => step > 1 && setStep(1)}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  step === 1
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-50"
                    : step > 1
                    ? "bg-stone-900 text-white"
                    : "bg-white border-2 border-stone-200 text-stone-400"
                )}
              >
                {step > 1 ? "✓" : "1"}
              </div>
              <span className="text-[11px] font-semibold mt-1.5 whitespace-nowrap">
                {t("step1Title")}
              </span>
            </div>

            {/* Step 2 */}
            <div
              className={cn(
                "relative z-10 flex flex-col items-center",
                step >= 2 ? "text-stone-900 cursor-pointer" : "text-stone-400"
              )}
              onClick={() => step > 2 && selectedService && setStep(2)}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  step === 2
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-50"
                    : step > 2
                    ? "bg-stone-900 text-white"
                    : "bg-white border-2 border-stone-200 text-stone-400"
                )}
              >
                {step > 2 ? "✓" : "2"}
              </div>
              <span className="text-[11px] font-semibold mt-1.5 whitespace-nowrap">
                {t("step2Title")}
              </span>
            </div>

            {/* Step 3 */}
            <div
              className={cn(
                "relative z-10 flex flex-col items-center",
                step === 3 ? "text-stone-900" : "text-stone-400"
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  step === 3
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-50"
                    : "bg-white border-2 border-stone-200 text-stone-400"
                )}
              >
                3
              </div>
              <span className="text-[11px] font-semibold mt-1.5 whitespace-nowrap">
                {t("step3Title")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: SERVICE SELECTION */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="text-center max-w-lg mx-auto mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">
              {t("step1Title")}
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              {t("step1Subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services
              .filter((s) => s.isActive)
              .map((service) => {
                const isSelected = selectedService?.id === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={cn(
                      "p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between relative bg-white",
                      isSelected
                        ? "border-indigo-600 shadow-md ring-1 ring-indigo-600"
                        : "border-stone-200 hover:border-stone-300 hover:shadow-xs"
                    )}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: service.colorTag || "#3B82F6" }}
                          />
                          <h3 className="font-bold text-stone-900 text-base leading-snug">
                            {service.name}
                          </h3>
                        </div>
                        <span className="text-sm font-bold text-stone-900 shrink-0 font-mono">
                          ${service.price.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-xs text-stone-500 leading-relaxed line-clamp-3 mb-4">
                        {service.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-600">
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-stone-400" />
                        {service.durationMin} {t("min")}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant={isSelected ? "primary" : "outline"}
                        className="h-8 text-xs font-semibold px-3"
                      >
                        {isSelected ? t("selected") : t("selectServiceBtn")}
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="button"
              variant="primary"
              disabled={!selectedService}
              onClick={() => setStep(2)}
              className="px-6 h-11 text-sm font-semibold"
            >
              {t("continue")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: DATE & TIME SLOT SELECTION */}
      {step === 2 && selectedService && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div className="flex items-center space-x-3">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedService.colorTag }}
              />
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
                  {t("selected")}
                </p>
                <h4 className="font-bold text-stone-900 text-sm">
                  {selectedService.name} ({selectedService.durationMin} {t("min")} • $
                  {selectedService.price.toFixed(2)})
                </h4>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(1)}
              className="text-xs"
            >
              {t("back")}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Calendar Widget */}
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                {t("selectDateHeading")}
              </label>
              <Calendar
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setSelectedSlot(null);
                }}
              />
            </div>

            {/* Slots Widget */}
            <div className="md:col-span-6 flex flex-col">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                {t("selectTimeHeading")}
              </label>

              <div className="flex-1 bg-white p-4 rounded-xl border border-stone-200 flex flex-col justify-between min-h-[320px]">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                    <span className="text-xs font-semibold text-stone-800">
                      {formatDate(new Date(`${selectedDate}T00:00:00`))}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {selectedService.durationMin} {t("min")}
                    </span>
                  </div>

                  {loadingSlots ? (
                    <div className="py-16 text-center text-stone-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                      <p className="text-xs font-medium">{t("loadingSlots")}</p>
                    </div>
                  ) : isClosed ? (
                    <div className="py-12 text-center text-stone-500 bg-stone-50 rounded-lg p-4 border border-stone-100 my-4">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-stone-400" />
                      <p className="text-xs font-semibold text-stone-700">
                        {closedReason || t("closedToday")}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-1">
                        {t("chooseAnotherDate")}
                      </p>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="py-12 text-center text-stone-500">
                      <p className="text-xs font-medium">{t("noSlotsAvailable")}</p>
                      <p className="text-[11px] text-stone-400 mt-1">{t("chooseAnotherDate")}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                      {slots.map((slot) => {
                        const isChosen = selectedSlot === slot.time;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => setSelectedSlot(slot.time)}
                            className={cn(
                              "h-10 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center cursor-pointer",
                              isChosen
                                ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300"
                                : slot.available
                                ? "bg-stone-50 border border-stone-200 text-stone-800 hover:border-stone-400 hover:bg-stone-100"
                                : "bg-stone-50/50 border border-stone-100 text-stone-300 cursor-not-allowed line-through opacity-50"
                            )}
                          >
                            {formatTime12(parseSlotTime(selectedDate, slot.time))}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {selectedSlot && (
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100">
                    <span className="font-semibold text-indigo-900">
                      {t("slotSelected")} {formatTime12(parseSlotTime(selectedDate, selectedSlot))}
                    </span>
                    <span className="font-mono text-indigo-700">
                      {selectedService.durationMin} {t("min")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="text-xs"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t("back")}
            </Button>

            <Button
              type="button"
              variant="primary"
              disabled={!selectedSlot}
              onClick={() => setStep(3)}
              className="px-6 h-11 text-sm font-semibold"
            >
              {t("continue")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: CLIENT DETAILS FORM */}
      {step === 3 && selectedService && selectedSlot && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="bg-stone-900 text-white p-5 rounded-xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3 mb-3">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">
                  Appointment Reservation Summary
                </span>
                <h3 className="text-base font-bold text-white">{selectedService.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-white">
                  ${selectedService.price.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300">
              <div className="flex items-center">
                <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
                <span>{formatDate(new Date(`${selectedDate}T00:00:00`))}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
                <span>
                  {formatTime12(parseSlotTime(selectedDate, selectedSlot))} (
                  {selectedService.durationMin} {t("min")})
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitBooking} className="bg-white p-6 rounded-xl border border-stone-200 space-y-4">
            <h3 className="text-base font-bold text-stone-900">
              {t("clientInfoHeading")}
            </h3>
            <p className="text-xs text-stone-500">
              {t("clientInfoSubheading")}
            </p>

            {submitError && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{t("fixErrorsNotice")}</p>
                  <p>{submitError}</p>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-800 flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-stone-400" />
                {t("fullNameLabel")} <span className="text-rose-500 ml-1">*</span>
              </label>
              <Input
                required
                placeholder={t("fullNamePlaceholder")}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-800 flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1 text-stone-400" />
                  {t("emailLabel")} <span className="text-rose-500 ml-1">*</span>
                </label>
                <Input
                  type="email"
                  required
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-800 flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1 text-stone-400" />
                  {t("phoneLabel")} <span className="text-rose-500 ml-1">*</span>
                </label>
                <Input
                  type="tel"
                  required
                  placeholder={t("phonePlaceholder")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-stone-800 flex items-center">
                <FileText className="w-3.5 h-3.5 mr-1 text-stone-400" />
                {t("notesLabel")}
              </label>
              <Textarea
                placeholder={t("notesPlaceholder")}
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                rows={3}
                className="text-xs"
              />
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-stone-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                disabled={submitting}
                className="text-xs"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t("back")}
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
                className="px-6 h-11 text-sm font-semibold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("submittingBooking")}
                  </>
                ) : (
                  <>
                    {t("submitBooking")}
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 4: INSTANT CONFIRMATION & EXPORT */}
      {step === 4 && confirmedBooking && (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-md text-center space-y-6 animate-in fade-in-90 zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold mb-2">
              {t("bookingReference")}: {confirmedBooking.referenceCode}
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">
              {t("bookingSuccessTitle")}
            </h2>
            <p className="text-sm text-stone-500 max-w-md mx-auto mt-1">
              {t("bookingSuccessSubtitle")}
            </p>
          </div>

          {/* Booking Summary Card */}
          <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 max-w-md mx-auto text-left text-xs space-y-2.5">
            <div className="flex justify-between font-semibold text-stone-900 text-sm pb-2 border-b border-stone-200">
              <span>{confirmedBooking.service?.name || selectedService?.name}</span>
              <span className="font-mono">
                ${(confirmedBooking.service?.price || selectedService?.price)?.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center text-stone-700">
              <CalendarIcon className="w-4 h-4 mr-2 text-stone-400" />
              <span>{formatDate(confirmedBooking.startTime)}</span>
            </div>

            <div className="flex items-center text-stone-700">
              <Clock className="w-4 h-4 mr-2 text-stone-400" />
              <span>
                {formatTimeRange(confirmedBooking.startTime, confirmedBooking.endTime)}
              </span>
            </div>

            <div className="flex items-center text-stone-700">
              <Mail className="w-4 h-4 mr-2 text-stone-400" />
              <span>{confirmedBooking.client?.email || email}</span>
            </div>
          </div>

          {/* Calendar Sync Actions */}
          <div className="pt-2 max-w-md mx-auto space-y-2">
            <p className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              {t("addToGoogleCalendar")} &amp; Export
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={generateGoogleCalendarUrl({
                  title: `Appointment: ${confirmedBooking.service?.name || selectedService?.name}`,
                  description: `Booking Reference: ${confirmedBooking.referenceCode}\nService: ${confirmedBooking.service?.name}\nStudio: CalenPulse Professional Services`,
                  startTime: confirmedBooking.startTime,
                  endTime: confirmedBooking.endTime,
                })}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 transition-colors shadow-2xs"
              >
                <CalendarPlus className="w-4 h-4 mr-2 text-indigo-600" />
                Google Calendar
              </a>

              <Button
                type="button"
                variant="outline"
                className="text-xs font-semibold h-auto py-2.5 shadow-2xs"
                onClick={() => {
                  const icsContent = generateIcsFile({
                    title: `Appointment: ${confirmedBooking.service?.name || selectedService?.name}`,
                    description: `Booking Reference: ${confirmedBooking.referenceCode}\nService: ${confirmedBooking.service?.name}`,
                    startTime: confirmedBooking.startTime,
                    endTime: confirmedBooking.endTime,
                  });
                  downloadIcsFile(`appointment-${confirmedBooking.referenceCode}.ics`, icsContent);
                }}
              >
                <Download className="w-4 h-4 mr-2 text-indigo-600" />
                {t("downloadIcs")}
              </Button>
            </div>
          </div>

          {/* Bottom Action buttons */}
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="text-xs"
            >
              Print Confirmation
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setStep(1);
                setSelectedService(null);
                setSelectedSlot(null);
                setConfirmedBooking(null);
              }}
              className="text-xs"
            >
              {t("bookAnother")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function parseSlotTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}
