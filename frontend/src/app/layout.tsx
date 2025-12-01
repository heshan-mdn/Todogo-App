import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/presentation/providers/QueryProvider';
import { ToasterProvider } from '@/presentation/providers/ToasterProvider';
import { AuthProvider } from '@/presentation/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Todogo - Modern Task Management',
  description: 'A clean architecture Todo application built with Next.js and Go',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <ToasterProvider>{children}</ToasterProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
