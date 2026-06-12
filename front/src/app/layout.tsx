import type { Metadata } from 'next';
import './globals.css';
import { MainLayout } from '@/components/main-layout';

export const metadata: Metadata = {
  title: 'Control d\'Apostes',
  description: 'Aplicació premium de gestió i control d\'apostes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ca">
      <body className="antialiased">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
