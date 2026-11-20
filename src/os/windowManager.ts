import type { AppId, WindowState } from './types';

export const APP_DEFAULT_CONFIG: Record<
  AppId,
  { title: string; width: number; height: number }
> = {
  finder: { title: 'Finder', width: 840, height: 530 },
  notes: { title: 'Notas', width: 780, height: 510 },
  photos: { title: 'Fotos', width: 860, height: 550 },
  audio: { title: 'Audios', width: 760, height: 500 },
  archive: { title: 'Utilidad de Compresión', width: 720, height: 480 },
  spotify: { title: 'Spotify', width: 900, height: 560 },
  whatsapp: { title: 'WhatsApp', width: 860, height: 545 },
  instagram: { title: 'Instagram', width: 860, height: 560 },
  about: { title: 'Acerca de este Mac', width: 420, height: 340 },
};

export function openOrFocusWindow(
  windows: WindowState[],
  appId: AppId,
  payload?: WindowState['payload'],
  customTitle?: string
): WindowState[] {
  const maxZ = windows.reduce((max, w) => Math.max(max, w.zIndex), 10);
  const existing = windows.find((w) => w.appId === appId);

  if (existing) {
    return windows.map((w) =>
      w.id === existing.id
        ? {
            ...w,
            isMinimized: false,
            zIndex: maxZ + 1,
            title: customTitle ?? w.title,
            payload: payload ? { ...w.payload, ...payload } : w.payload,
          }
        : w
    );
  }

  const cfg = APP_DEFAULT_CONFIG[appId];
  const offset = (windows.length % 6) * 26;
  const next: WindowState = {
    id: `win-${appId}`,
    appId,
    title: customTitle ?? cfg.title,
    x: 96 + offset,
    y: 44 + offset,
    width: cfg.width,
    height: cfg.height,
    zIndex: maxZ + 1,
    isMinimized: false,
    isMaximized: false,
    payload,
  };

  return [...windows, next];
}

export function focusWindow(windows: WindowState[], id: string): WindowState[] {
  const maxZ = windows.reduce((max, w) => Math.max(max, w.zIndex), 10);
  return windows.map((w) =>
    w.id === id ? { ...w, isMinimized: false, zIndex: maxZ + 1 } : w
  );
}

export function closeWindow(windows: WindowState[], id: string): WindowState[] {
  return windows.filter((w) => w.id !== id);
}

export function minimizeWindow(windows: WindowState[], id: string): WindowState[] {
  return windows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w));
}

export function toggleMaximizeWindow(windows: WindowState[], id: string): WindowState[] {
  const maxZ = windows.reduce((max, w) => Math.max(max, w.zIndex), 10);
  return windows.map((w) =>
    w.id === id ? { ...w, isMaximized: !w.isMaximized, zIndex: maxZ + 1 } : w
  );
}

export function moveWindow(
  windows: WindowState[],
  id: string,
  x: number,
  y: number,
  boundsWidth: number,
  boundsHeight: number
): WindowState[] {
  return windows.map((w) => {
    if (w.id !== id || w.isMaximized) return w;
    const clampedX = Math.max(-w.width + 120, Math.min(x, boundsWidth - 120));
    const clampedY = Math.max(28, Math.min(y, boundsHeight - 90));
    return { ...w, x: clampedX, y: clampedY };
  });
}
