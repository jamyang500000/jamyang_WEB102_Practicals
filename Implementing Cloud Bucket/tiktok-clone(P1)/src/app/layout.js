'use client';

import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { Inter } from 'next/font/google';

import { Toaster } from 'react-hot-toast';

import './globals.css';

import MainLayout from '@/components/layout/MainLayout';

import { AuthProvider } from '@/contexts/authContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
          },
        },
      })
  );

  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <MainLayout>{children}</MainLayout>

            <Toaster position="bottom-center" />
          </AuthProvider>

          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}