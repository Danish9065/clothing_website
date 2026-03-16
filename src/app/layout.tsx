import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from '@/components/ui/toaster';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Little Mumbai Choice | Wholesale Kids Wear',
  description: 'Wholesale premium quality kids wear in Prem Nagar, Loni, Ghaziabad, UP',
};

import { createClient } from '@/lib/supabase/server';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: settings } = await supabase.from('site_settings').select('*');

  const announcementActive = settings?.find(s => s.key === 'announcement_active')?.value === 'true';
  const announcementText = settings?.find(s => s.key === 'announcement_text')?.value || '';

  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} font-sans`}>
        <CartProvider>
          {announcementActive && announcementText && (
            <div className="bg-brand-500 text-white text-sm font-medium text-center py-2 px-4 shadow-sm z-50 relative">
              {announcementText}
            </div>
          )}
          {children}
          <Toaster />
          <FloatingWhatsApp />
        </CartProvider>
      </body>
    </html>
  );
}
