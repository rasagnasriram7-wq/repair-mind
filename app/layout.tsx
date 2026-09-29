import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/auth-context';

export const metadata: Metadata = {
  title: 'REPAIR-MIND | AI-Powered Field Technician Memory Agent',
  description: 'Industrial organizational memory for recurring equipment failures. Recall previous diagnoses, learn from successful repairs, and troubleshoot faster.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
