import React from 'react';
import type { AppId, WindowState } from '../../os/types';
import { AppGlyph } from './AppGlyph';

interface DockProps {
  windows: WindowState[];
  onLaunchApp: (appId: AppId, payload?: WindowState['payload']) => void;
  onOpenTrash: () => void;
  trashCount: number;
}

const DOCK_ITEMS: { id: AppId; label: string }[] = [
  { id: 'finder', label: 'Finder' },
  { id: 'notes', label: 'Notas' },
  { id: 'photos', label: 'Fotos' },
  { id: 'audio', label: 'Audios' },
  { id: 'archive', label: 'Archivos ZIP' },
  { id: 'spotify', label: 'Spotify' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'instagram', label: 'Instagram' },
];

export const Dock: React.FC<DockProps> = ({
  windows,
  onLaunchApp,
  onOpenTrash,
  trashCount,
}) => {
  return (
    <nav
      aria-label="Dock de aplicaciones"
      className="pointer-events-none absolute inset-x-0 bottom-2.5 z-40 flex justify-center px-3"
    >
      <div className="pointer-events-auto flex items-end gap-2 rounded-2xl border border-white/30 bg-white/45 px-3 py-2 shadow-[0_12px_36px_rgba(0,0,0,0.28)] backdrop-blur-2xl dark:border-white/15 dark:bg-neutral-900/55">
        {DOCK_ITEMS.map((item) => {
          const isOpen = windows.some((w) => w.appId === item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onLaunchApp(item.id)}
              aria-label={`Abrir ${item.label}`}
              className="group relative flex flex-col items-center transition-transform duration-150 hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-xl"
            >
              <span className="pointer-events-none absolute -top-8 rounded-md bg-neutral-900/90 px-2 py-0.5 text-[11px] font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100 whitespace-nowrap">
                {item.label}
              </span>
              <AppGlyph appId={item.id} className="h-10 w-10 sm:h-11 sm:w-11" />
              <span
                aria-hidden="true"
                className={`mt-1 h-1 w-1 rounded-full transition-opacity ${
                  isOpen
                    ? 'bg-neutral-900 dark:bg-white opacity-100'
                    : 'opacity-0'
                }`}
              />
            </button>
          );
        })}

        <div className="mx-1 mb-2 h-8 w-px bg-black/15 dark:bg-white/20" aria-hidden="true" />

        <button
          type="button"
          onClick={onOpenTrash}
          aria-label={`Abrir Papelera (${trashCount} elementos)`}
          className="group relative flex flex-col items-center transition-transform duration-150 hover:-translate-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-xl"
        >
          <span className="pointer-events-none absolute -top-8 rounded-md bg-neutral-900/90 px-2 py-0.5 text-[11px] font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100 whitespace-nowrap">
            Papelera{trashCount > 0 ? ` (${trashCount})` : ''}
          </span>
          <AppGlyph appId="trash" className="h-10 w-10 sm:h-11 sm:w-11" />
          <span className="mt-1 h-1 w-1 rounded-full opacity-0" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};
