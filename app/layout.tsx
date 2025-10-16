import { Providers } from '@/components/providers';
import './globals.css';
import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import ConditionalNavbar from '@/components/ConditionalNavbar';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'TrackTag - Smart Price Tracking & Product Insights',
  description: 'Track smarter, tag better. Transform scattered prices and reviews into meaningful insights with TrackTag.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={spaceGrotesk.className}>
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-5 animate-pulse"></div>
          <div className="absolute -bottom-1/4 right-0 w-96 h-96 bg-pink-600 rounded-full mix-blend-screen filter blur-3xl opacity-5 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-5 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
          <Providers />
          <ConditionalNavbar />
          <main className="flex-1 w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}