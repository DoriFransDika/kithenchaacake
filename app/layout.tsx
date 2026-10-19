import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/store';
import { FloatingToast } from '@/components/common/FloatingToast';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Kitchen Chaacake Management System | Bakery & Cake OS',
  description: 'Sistem pencatatan produksi resep, stok bahan baku, dan pembukuan keuangan toko kue Kitchen Chaacake.',
  icons: {
    icon: [
      { url: '/logo.jpeg', type: 'image/jpeg' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col selection:bg-[#C2185B]/25 selection:text-[#311B1E]">
        <StoreProvider>
          {children}
          <FloatingToast />
        </StoreProvider>
      </body>
    </html>
  );
}
