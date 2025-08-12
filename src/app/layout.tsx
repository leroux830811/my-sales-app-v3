import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { CustomerProvider } from '@/context/customer-context';
import { InteractionProvider } from '@/context/interaction-context';
import { ProductProvider } from '@/context/product-context';

export const metadata: Metadata = {
  title: 'Deli Sales Pro',
  description: 'CRM for cold meats sales representatives',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <CustomerProvider>
          <InteractionProvider>
            <ProductProvider>
              <AppLayout>
                {children}
              </AppLayout>
            </ProductProvider>
          </InteractionProvider>
        </CustomerProvider>
        <Toaster />
      </body>
    </html>
  );
}
