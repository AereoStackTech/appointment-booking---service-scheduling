import { getAllServices } from "@/lib/data-service";
import { BookingWizard } from "@/components/features/booking/booking-wizard";
import { PublicHeader, PublicFooter } from "@/components/shared/public-nav";

export const revalidate = 0;

export default async function HomePage() {
  const services = await getAllServices(true);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between">
      {/* Top Navigation */}
      <PublicHeader />

      {/* Main Booking Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        <BookingWizard services={services as any} />
      </main>

      {/* Client Footer */}
      <PublicFooter />
    </div>
  );
}
