'use client';

import AuthGate from '../components/AuthGate';
import Agora from '../components/Agora';

export default function Home() {
  return (
    <AuthGate>
      <Agora />
    </AuthGate>
  );
}
