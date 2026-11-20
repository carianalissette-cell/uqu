import React, { useEffect, useState } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { MAC_ASSETS } from '../../os/assets';

interface LockScreenProps {
  wallpaperUrl: string;
  autoTypeOnMount: boolean;
  onUnlock: () => void;
}

const TARGET_PASSCODE = '2304';

export const LockScreen: React.FC<LockScreenProps> = ({
  wallpaperUrl,
  autoTypeOnMount,
  onUnlock,
}) => {
  const [password, setPassword] = useState('');
  const [isAutoTyping, setIsAutoTyping] = useState(autoTypeOnMount);
  const [unlocking, setUnlocking] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live Spanish lock-screen clock
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Automatic password typing ("2304") before entering the Mac desktop
  useEffect(() => {
    if (!autoTypeOnMount) return;

    let cancelled = false;
    const timers: number[] = [];

    const startDelay = 700;
    const charDelay = 280;

    TARGET_PASSCODE.split('').forEach((_, index) => {
      const t = window.setTimeout(() => {
        if (cancelled) return;
        setPassword(TARGET_PASSCODE.slice(0, index + 1));
      }, startDelay + index * charDelay);
      timers.push(t);
    });

    const submitTimer = window.setTimeout(() => {
      if (cancelled) return;
      setUnlocking(true);
      setIsAutoTyping(false);
    }, startDelay + TARGET_PASSCODE.length * charDelay + 360);
    timers.push(submitTimer);

    const enterTimer = window.setTimeout(() => {
      if (cancelled) return;
      onUnlock();
    }, startDelay + TARGET_PASSCODE.length * charDelay + 780);
    timers.push(enterTimer);

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [autoTypeOnMount, onUnlock]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlocking) return;

    if (password === TARGET_PASSCODE) {
      setErrorMsg('');
      setUnlocking(true);
      window.setTimeout(() => onUnlock(), 320);
    } else {
      setErrorShake(true);
      setErrorMsg('Contraseña incorrecta · Pista: 2304');
      window.setTimeout(() => setErrorShake(false), 400);
    }
  };

  const formattedDate = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const formattedTime = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-between bg-cover bg-center px-6 py-12 text-white transition-all duration-500 ${
        unlocking ? 'scale-[1.03] opacity-0' : 'scale-100 opacity-100'
      }`}
      style={{ backgroundImage: `url(${wallpaperUrl})` }}
      data-testid="lock-screen"
    >
      {/* Frosted dark ambient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-slate-950/35 backdrop-blur-md" />

      {/* Top Date & Time */}
      <div className="relative z-10 mt-4 flex flex-col items-center text-center drop-shadow-sm">
        <p className="text-base font-medium capitalize tracking-wide text-white/90">
          {formattedDate}
        </p>
        <h1 className="mt-1 text-7xl font-semibold tracking-tight tabular-nums text-white sm:text-8xl">
          {formattedTime}
        </h1>
      </div>

      {/* User Login Card */}
      <div className="relative z-10 mb-6 flex w-full max-w-xs flex-col items-center">
        <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-white/40 bg-neutral-800 shadow-xl">
          <img
            src={MAC_ASSETS.userAvatar}
            alt="Sofía Morales"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        </div>

        <h2 className="mt-3 text-lg font-semibold tracking-tight text-white">
          Sofía Morales
        </h2>

        <form
          onSubmit={handleManualSubmit}
          className={`mt-4 flex w-full max-w-[236px] flex-col items-center gap-2 ${
            errorShake ? 'animate-lock-shake' : ''
          }`}
        >
          <div className="relative flex w-full items-center">
            <label htmlFor="mac-lock-password" className="sr-only">
              Contraseña de MacBook Air
            </label>
            <input
              id="mac-lock-password"
              type="password"
              inputMode="numeric"
              value={password}
              onChange={(e) => {
                setIsAutoTyping(false);
                setErrorMsg('');
                setPassword(e.target.value);
              }}
              placeholder="Contraseña"
              aria-label="Contraseña de MacBook Air"
              className="w-full rounded-full border border-white/25 bg-white/20 py-1.5 pl-4 pr-9 text-center text-base font-semibold tracking-[0.35em] text-white placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-white/65 backdrop-blur-xl focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              type="submit"
              aria-label="Desbloquear MacBook Air"
              className="absolute right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-white transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="min-h-[18px] text-xs font-medium text-white/80">
            {unlocking
              ? 'Desbloqueando...'
              : isAutoTyping
              ? 'Ingresando contraseña automáticamente…'
              : errorMsg || 'Ingresa la contraseña (2304)'}
          </p>
        </form>
      </div>

      {/* Bottom Subtle Lock Indicator */}
      <div className="relative z-10 flex items-center gap-1.5 text-xs text-white/70">
        <Lock className="h-3 w-3" />
        <span>MacBook Air protegida</span>
      </div>
    </div>
  );
};
