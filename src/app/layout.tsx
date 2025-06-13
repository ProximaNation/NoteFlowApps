import { Inter } from 'next/font/google';
import './globals.css';
import { DataProvider } from '@/contexts/DataContext';
import { GoogleProvider } from '@/providers/GoogleOAuthProvider';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleProvider>
          <DataProvider>
            {children}
          </DataProvider>
        </GoogleProvider>
      </body>
    </html>
  );
} 