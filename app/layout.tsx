import type {Metadata} from 'next';
import './globals.css';
import { AuthProvider } from '@/components/shared/auth-provider';
import { LanguageProvider } from '@/lib/i18n/context';

export const metadata: Metadata = {
  title: 'CalenPulse — Appointment Booking & Service Scheduling',
  description: 'A streamlined, full-stack appointment booking and schedule management platform with mobile-first customer booking, dynamic conflict-free slot calculation, and administrative operations dashboard.',
  openGraph: {
    title: 'CalenPulse — Appointment Booking & Service Scheduling',
    description: 'A streamlined, full-stack appointment booking and schedule management platform with mobile-first customer booking, dynamic conflict-free slot calculation, and administrative operations dashboard.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CalenPulse — Appointment Booking & Service Scheduling',
    description: 'A streamlined, full-stack appointment booking and schedule management platform with mobile-first customer booking, dynamic conflict-free slot calculation, and administrative operations dashboard.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
