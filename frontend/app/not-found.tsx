'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  // Automatically redirect back to the home / dashboard after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-[#E8EFE9] border border-[#d6e0ce] flex items-center justify-center text-[#304D40] mb-6 shadow-xs">
        <Sparkles className="w-8 h-8" />
      </div>

      <h1 className="font-serif text-3xl sm:text-4xl text-[#252923] tracking-tight mb-2">
        Returning to DermaNova
      </h1>
      <p className="text-sm font-mono text-[#777D76] max-w-md mb-8">
        The full clinical analysis and dashboard are hosted at the home screen. Redirecting you automatically...
      </p>

      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-[#304D40] hover:bg-[#253d33] text-white text-xs font-mono font-medium transition flex items-center gap-2 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home Screen</span>
      </Link>
    </div>
  );
}
