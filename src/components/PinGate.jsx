'use client';

import { useState, useRef, useEffect } from 'react';

const CORRECT_PIN = process.env.NEXT_PUBLIC_AGORA_PIN || '0000';

export default function PinGate({ onAuthenticated }) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index, value) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError(false);

    // Auto-advance to next input
    if (digit && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (digit && index === 3) {
      const pin = newDigits.join('');
      if (pin.length === 4) {
        setTimeout(() => validatePin(pin), 150);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    if (e.key === 'Enter') {
      const pin = digits.join('');
      if (pin.length === 4) {
        validatePin(pin);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      const newDigits = pasted.split('');
      setDigits(newDigits);
      inputRefs[3].current?.focus();
      setTimeout(() => validatePin(pasted), 150);
    }
  };

  const validatePin = (pin) => {
    if (pin === CORRECT_PIN) {
      localStorage.setItem('agora_auth', pin);
      onAuthenticated();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setDigits(['', '', '', '']);
        inputRefs[0].current?.focus();
      }, 600);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: '#08080d' }}
    >
      <div className="text-center space-y-8">
        {/* Title */}
        <div>
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-wide mb-2"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              color: '#c4a35a',
            }}
          >
            The Agora
          </h1>
          <p
            className="text-xs tracking-[0.3em] uppercase"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: '#7a7580',
            }}
          >
            Four Voices &middot; One Space
          </p>
        </div>

        {/* Divider */}
        <div
          className="w-16 h-px mx-auto"
          style={{ background: 'linear-gradient(90deg, transparent, #c4a35a44, transparent)' }}
        />

        {/* PIN prompt */}
        <div className="space-y-4">
          <p
            className="text-sm"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: '#7a7580',
            }}
          >
            Enter the gate key
          </p>

          {/* PIN inputs */}
          <div
            className={`flex gap-3 justify-center ${shake ? 'animate-shake' : ''}`}
          >
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={inputRefs[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                className="w-14 h-16 text-center text-2xl rounded-xl outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: error
                    ? '1px solid rgba(239, 83, 80, 0.5)'
                    : digit
                    ? '1px solid rgba(196, 163, 90, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#c4a35a',
                  fontFamily: "'JetBrains Mono', monospace",
                  caretColor: '#c4a35a',
                  boxShadow: digit
                    ? '0 0 20px rgba(196, 163, 90, 0.08)'
                    : 'none',
                }}
              />
            ))}
          </div>

          {/* Error message */}
          <div className="h-6">
            {error && (
              <p
                className="text-xs animate-fadeIn"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#ef5350',
                  fontSize: '0.7rem',
                }}
              >
                The gates remain closed
              </p>
            )}
          </div>
        </div>

        {/* Subtle footer */}
        <p
          className="text-xs"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: '#7a758033',
            fontSize: '0.6rem',
          }}
        >
          A sacred space for four minds
        </p>
      </div>
    </div>
  );
}
