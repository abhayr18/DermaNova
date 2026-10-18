import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DermaNova | AI Facial Skin Diagnosis & Pharmacological Skincare Guidance',
  description: 'Clinical multi-task deep learning framework for multi-label facial skin assessment, ordinal acne severity grading, and evidence-based active ingredient skincare recommendation.',
  keywords: 'dermatology, skin analysis, acne, skincare recommendation, deep learning, computer vision, retinol, salicylic acid',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
