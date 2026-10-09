import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'Nexus Data Vault | Next.js Intelligence Console',
  description: 'Enterprise data viewer & analytical engine for Crypto, E-Commerce, and Identity records.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <QueryProvider>
          <div className="ambient-glow-1" />
          <div className="ambient-glow-2" />
          <div className="relative z-10 flex min-h-screen flex-col">
            {children}
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
