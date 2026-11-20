import React, { useRef } from 'react';
import type { WindowState } from '../../os/types';

interface DesktopWindowProps {
  win: WindowState;
  isActive: boolean;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onToggleMaximize: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  children: React.ReactNode;
}

export const DesktopWindow: React.FC<DesktopWindowProps> = ({
  win,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onMove,
  children,
}) => {
  const dragOrigin = useRef<{
    startX: number;
    startY: number;
    winX: number;
    winY: number;
  } | null>(null);

  if (win.isMinimized) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    onFocus(win.id);
    if (win.isMaximized) return;

    dragOrigin.current = {
      startX: e.clientX,
      startY: e.clientY,
      winX: win.x,
      winY: win.y,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!dragOrigin.current) return;
      const dx = moveEvent.clientX - dragOrigin.current.startX;
      const dy = moveEvent.clientY - dragOrigin.current.startY;
      onMove(win.id, dragOrigin.current.winX + dx, dragOrigin.current.winY + dy);
    };

    const handlePointerUp = () => {
      dragOrigin.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const style: React.CSSProperties = win.isMaximized
    ? {
        left: 0,
        top: 28,
        width: '100%',
        height: 'calc(100% - 28px)',
        zIndex: win.zIndex,
      }
    : {
        left: win.x,
        top: win.y,
        width: `min(${win.width}px, calc(100% - 16px))`,
        height: `min(${win.height}px, calc(100% - 96px))`,
        zIndex: win.zIndex,
      };

  const isDarkSurfaceApp = win.appId === 'spotify';

  return (
    <section
      role="dialog"
      aria-label={win.title}
      onMouseDown={() => onFocus(win.id)}
      style={style}
      className={`absolute flex flex-col overflow-hidden ${
        win.isMaximized ? 'rounded-none' : 'rounded-xl'
      } border ${
        isActive
          ? 'border-black/15 shadow-[0_24px_60px_rgba(0,0,0,0.35)] dark:border-white/15'
          : 'border-black/10 shadow-[0_12px_32px_rgba(0,0,0,0.22)] dark:border-white/10'
      } ${
        isDarkSurfaceApp
          ? 'bg-[#121212] text-white'
          : 'bg-white/95 text-neutral-900 dark:bg-neutral-900/95 dark:text-neutral-100'
      } backdrop-blur-2xl`}
    >
      {/* Title bar with macOS Traffic Lights */}
      <div
        onPointerDown={handlePointerDown}
        onDoubleClick={() => onToggleMaximize(win.id)}
        className={`flex h-9 shrink-0 items-center justify-between border-b px-3.5 cursor-grab active:cursor-grabbing ${
          isDarkSurfaceApp
            ? 'border-white/10 bg-[#181818]'
            : 'border-black/8 bg-neutral-100/85 dark:border-white/10 dark:bg-neutral-800/85'
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onClose(win.id)}
            aria-label={`Cerrar ${win.title}`}
            className="h-3 w-3 rounded-full bg-[#FF5F57] ring-1 ring-black/10 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          />
          <button
            type="button"
            onClick={() => onMinimize(win.id)}
            aria-label={`Minimizar ${win.title}`}
            className="h-3 w-3 rounded-full bg-[#FEBC2E] ring-1 ring-black/10 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          />
          <button
            type="button"
            onClick={() => onToggleMaximize(win.id)}
            aria-label={`${win.isMaximized ? 'Restaurar' : 'Maximizar'} ${win.title}`}
            className="h-3 w-3 rounded-full bg-[#28C840] ring-1 ring-black/10 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          />
        </div>

        <h2 className="pointer-events-none truncate text-xs font-semibold tracking-tight opacity-85">
          {win.title}
        </h2>

        <div className="w-12" aria-hidden="true" />
      </div>

      {/* Window Body */}
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </section>
  );
};
