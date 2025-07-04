// app/auth/login/page.tsx
import { Suspense } from 'react';
import LoginContent from './LoginContent';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
