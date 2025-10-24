'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateTokenRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirection automatique vers la nouvelle page
    router.push('/mint/tokens');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection vers la page de minting...</p>
      </div>
    </div>
  );
}
