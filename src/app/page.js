'use client';

import { useState, useEffect } from 'react';
import Agora from '../components/Agora';
import PinGate from '../components/PinGate';

const CORRECT_PIN = process.env.NEXT_PUBLIC_AGORA_PIN || '0000';

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('agora_auth');
    if (saved === CORRECT_PIN) {
      setAuthenticated(true);
    }
    setChecking(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('agora_auth');
    setAuthenticated(false);
  };

  if (checking) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: '#08080d' }}
      />
    );
  }

  if (!authenticated) {
    return <PinGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  return <Agora onLogout={handleLogout} />;
}
