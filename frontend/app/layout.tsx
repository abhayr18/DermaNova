import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DermaNova — Premium AI Facial Skin Analysis & Personalized Routine',
  description: 'Understand your skin. Care for it better. Explore visible skin concerns with AI-powered facial analysis and build an evidence-based routine tailored to your skin barrier.',
  keywords: 'skincare, facial skin analysis, AI dermatology, barrier repair, non-comedogenic, azelaic acid, salicylic acid, skin journal',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#FAFAFB',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FAFAFB] text-slate-900 antialiased min-h-screen flex flex-col font-sans overflow-x-hidden selection:bg-teal-100 selection:text-teal-900">
        {children}
      </body>
    </html>
  );
}
