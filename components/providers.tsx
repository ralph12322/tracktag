'use client';

import { Toaster } from 'react-hot-toast';

export function Providers() {
  return (
    <Toaster 
      position="bottom-right" 
      toastOptions={{
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid rgba(148, 113, 233, 0.2)',
          borderRadius: '0.75rem',
          backdropFilter: 'blur(12px)',
        },
        success: {
          style: {
            background: '#0f172a',
            border: '1px solid rgba(34, 197, 94, 0.3)',
          },
        },
        error: {
          style: {
            background: '#0f172a',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          },
        },
      }}
    />
  );
}