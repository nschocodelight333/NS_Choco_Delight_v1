'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-choco-900 flex items-center justify-center">
      <div className="text-cream text-center">
        <p className="text-sm font-medium">Redirecting to Admin Portal...</p>
      </div>
    </div>
  );
}
