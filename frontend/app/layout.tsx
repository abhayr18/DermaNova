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
    <html lang="en">
      <body className="bg-[#faf9f5] text-[#1a2217] antialiased min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
