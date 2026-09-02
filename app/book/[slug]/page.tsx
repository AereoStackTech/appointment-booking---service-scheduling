import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllServices, getServiceBySlug } from "@/lib/data-service";
import { BookingWizard } from "@/components/features/booking/booking-wizard";
import { Search, ShieldCheck } from "lucide-react";

export const revalidate = 0;

export default async function ServiceBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  const allServices = await getAllServices(true);

  if (!service || !service.isActive) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/book" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              CP
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-stone-900 block leading-tight">
                CalenPulse
              </span>
              <span className="text-[10px] text-stone-500 font-medium">
                Direct Service Booking
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              href="/lookup"
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              <Search className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
              Find My Booking
            </Link>
          </div>
        </div>
      </header>

      {/* Booking Form */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        <BookingWizard
          services={allServices as any}
          preselectedServiceSlug={slug}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted & Friction-Free Scheduling System</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} CalenPulse Studio.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
