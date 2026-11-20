import React, { useEffect, useRef, useState } from 'react';
import {
  Moon,
  Search,
  SlidersHorizontal,
  Sun,
  Volume2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { AppId } from '../../os/types';

interface MenuBarProps {
  activeAppTitle: string;
  isDark: boolean;
  onToggleDark: () => void;
  brightness: number;
  onChangeBrightness: (v: number) => void;
  volume: number;
  onChangeVolume: (v: number) => void;
  wifiOn: boolean;
  onToggleWifi: () => void;
  onOpenSpotlight: () => void;
  onOpenApp: (appId: AppId) => void;
  onCreateDesktopFolder: () => void;
  onLockScreen: () => void;
  onRestartMac: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  activeAppTitle,
  isDark,
  onToggleDark,
  brightness,
  onChangeBrightness,
  volume,
  onChangeVolume,
  wifiOn,
  onToggleWifi,
  onOpenSpotlight,
  onOpenApp,
  onCreateDesktopFolder,
  onLockScreen,
  onRestartMac,
}) => {
  const [openMenu, setOpenMenu] = useState<'apple' | 'file' | 'control' | null>(null);
  const [now, setNow] = useState(() => new Date());
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener('mousedown', handleOutside);
    return () => window.removeEventListener('mousedown', handleOutside);
  }, []);

  const dateLabel = now.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const timeLabel = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <header
      ref={barRef}
      className="relative z-40 flex h-7 w-full shrink-0 items-center justify-between bg-white/65 px-3 text-xs font-medium text-neutral-900 backdrop-blur-2xl border-b border-black/5 dark:bg-neutral-900/70 dark:text-neutral-100 dark:border-white/10"
    >
      {/* Left: Apple Menu + Active App + Quick Menu */}
      <div className="flex items-center gap-1">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'apple' ? null : 'apple')}
            aria-label="Menú Apple"
            aria-expanded={openMenu === 'apple'}
            className="flex h-5 items-center rounded px-2 transition-colors hover:bg-black/10 dark:hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <svg viewBox="0 0 170 170" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.13-1.9-14.34-6.08-3.69-3.03-7.61-7.79-11.77-14.28-5.04-7.82-9.16-16.86-12.35-27.13-3.19-10.27-4.79-19.99-4.79-29.17 0-10.97 2.75-20.1 8.26-27.39 5.51-7.29 12.63-11.12 21.37-11.49 4.71 0 10.09 1.38 16.14 4.12 6.05 2.75 9.95 4.16 11.7 4.24 1.34 0 5.56-1.63 12.65-4.88 7.09-3.25 13.08-4.63 17.98-4.14 13.45 1.09 23.56 6.4 30.33 15.92-12.01 7.28-17.91 17.46-17.71 30.52.22 10.18 4.15 18.67 11.79 25.47 5.26 4.78 11.41 7.66 18.46 8.64-1.46 4.44-3.14 8.71-5.04 12.82zM119.22 31.01c0 7.99-2.92 15.44-8.75 22.34-7.03 8.24-15.53 12.99-24.75 12.24-.14-.99-.21-2.04-.21-3.17 0-7.67 3.31-15.86 9.19-22.58 2.94-3.38 6.67-6.19 11.21-8.43 4.53-2.23 8.83-3.47 12.9-3.71.27 1.15.41 2.25.41 3.31z" />
            </svg>
          </button>

          {openMenu === 'apple' && (
            <div className="absolute left-0 top-6 z-50 w-56 rounded-xl border border-black/10 bg-white/90 p-1.5 shadow-xl backdrop-blur-2xl dark:border-white/15 dark:bg-neutral-800/95">
              <button
                type="button"
                onClick={() => {
                  onOpenApp('about');
                  setOpenMenu(null);
                }}
                className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-sky-500 hover:text-white"
              >
                Acerca de este MacBook Air
              </button>
              <div className="my-1 h-px bg-black/10 dark:bg-white/10" />
              <button
                type="button"
                onClick={() => {
                  onLockScreen();
                  setOpenMenu(null);
                }}
                className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-sky-500 hover:text-white"
              >
                Bloquear pantalla
              </button>
              <button
                type="button"
                onClick={() => {
                  onRestartMac();
                  setOpenMenu(null);
                }}
                className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-sky-500 hover:text-white"
              >
                Reiniciar MacBook Air…
              </button>
            </div>
          )}
        </div>

        <span className="px-2 font-semibold whitespace-nowrap">{activeAppTitle}</span>

        <div className="relative hidden sm:block">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'file' ? null : 'file')}
            aria-expanded={openMenu === 'file'}
            className="rounded px-2 py-0.5 hover:bg-black/10 dark:hover:bg-white/15 whitespace-nowrap"
          >
            Archivo
          </button>
          {openMenu === 'file' && (
            <div className="absolute left-0 top-6 z-50 w-52 rounded-xl border border-black/10 bg-white/90 p-1.5 shadow-xl backdrop-blur-2xl dark:border-white/15 dark:bg-neutral-800/95">
              <button
                type="button"
                onClick={() => {
                  onCreateDesktopFolder();
                  setOpenMenu(null);
                }}
                className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-sky-500 hover:text-white"
              >
                Nueva carpeta en Escritorio
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenApp('notes');
                  setOpenMenu(null);
                }}
                className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-sky-500 hover:text-white"
              >
                Abrir Notas
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenApp('finder');
                  setOpenMenu(null);
                }}
                className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-sky-500 hover:text-white"
              >
                Nueva ventana de Finder
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Center spacer reserved for MacBook Air camera notch */}
      <div className="hidden sm:block w-[156px] shrink-0" aria-hidden="true" />

      {/* Right: Wi-Fi, Spotlight, Control Center, Clock */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggleWifi}
          aria-label={wifiOn ? 'Desactivar Wi-Fi' : 'Activar Wi-Fi'}
          className="flex h-5 items-center rounded px-1.5 hover:bg-black/10 dark:hover:bg-white/15"
        >
          {wifiOn ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5 opacity-55" />}
        </button>

        <button
          type="button"
          onClick={onOpenSpotlight}
          aria-label="Abrir búsqueda Spotlight"
          className="flex h-5 items-center rounded px-1.5 hover:bg-black/10 dark:hover:bg-white/15"
        >
          <Search className="h-3.5 w-3.5" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === 'control' ? null : 'control')}
            aria-label="Centro de control"
            aria-expanded={openMenu === 'control'}
            className="flex h-5 items-center rounded px-1.5 hover:bg-black/10 dark:hover:bg-white/15"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </button>

          {openMenu === 'control' && (
            <div className="absolute right-0 top-6 z-50 w-72 rounded-2xl border border-black/10 bg-white/90 p-3.5 shadow-2xl backdrop-blur-2xl dark:border-white/15 dark:bg-neutral-800/95">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold">Centro de control</span>
                <button
                  type="button"
                  onClick={onToggleDark}
                  className="flex items-center gap-1.5 rounded-lg bg-black/5 px-2.5 py-1 text-xs font-medium hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15"
                >
                  {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                  <span>{isDark ? 'Modo oscuro' : 'Modo claro'}</span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-300">
                    <span>Brillo de pantalla</span>
                    <span className="tabular-nums">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={100}
                    value={brightness}
                    onChange={(e) => onChangeBrightness(Number(e.target.value))}
                    aria-label="Brillo de pantalla"
                    className="w-full accent-sky-500"
                  />
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-300">
                    <span className="flex items-center gap-1">
                      <Volume2 className="h-3 w-3" /> Sonido
                    </span>
                    <span className="tabular-nums">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(volume * 100)}
                    onChange={(e) => onChangeVolume(Number(e.target.value) / 100)}
                    aria-label="Volumen del sistema"
                    className="w-full accent-sky-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 px-2 whitespace-nowrap tabular-nums">
          <span className="hidden md:inline capitalize">{dateLabel}</span>
          <span>{timeLabel}</span>
        </div>
      </div>
    </header>
  );
};
