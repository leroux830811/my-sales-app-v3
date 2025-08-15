import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { CustomerProvider } from '@/context/customer-context';
import { InteractionProvider } from '@/context/interaction-context';
import { ProductProvider } from '@/context/product-context';
import { OrderProvider } from '@/context/order-context';
import { PhotoProvider } from '@/context/photo-context';
import { ReminderProvider } from '@/context/reminder-context';
import { ThemeProvider } from '@/context/theme-context';
import { RouteProvider } from '@/context/route-context';
import { StockReturnProvider } from '@/context/stock-return-context';

export const metadata: Metadata = {
  title: 'BB Sales Pro',
  description: 'CRM for sales representatives',
  manifest: '/public/manifest.json',
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
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-body antialiased">
            <ThemeProvider>
            <CustomerProvider>
                <ProductProvider>
                <InteractionProvider>
                    <OrderProvider>
                    <PhotoProvider>
                        <ReminderProvider>
                        <RouteProvider>
                            <StockReturnProvider>
                            <AppLayout>
                                {children}
                            </AppLayout>
                            </StockReturnProvider>
                        </RouteProvider>
                        </ReminderProvider>
                    </PhotoProvider>
                    </OrderProvider>
                </InteractionProvider>
                </ProductProvider>
            </CustomerProvider>
            </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
