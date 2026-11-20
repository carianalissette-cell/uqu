import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { searchNodes } from '../../os/filesystem';
import type { AppId, FSNode, SpotifyTrack } from '../../os/types';
import { AppGlyph, FileKindIcon } from './AppGlyph';

interface SpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: FSNode[];
  spotifyTracks: SpotifyTrack[];
  onOpenApp: (appId: AppId) => void;
  onOpenFileNode: (node: FSNode) => void;
  onPlaySpotifyTrack: (trackId: string) => void;
}

const APPS_LIST: { id: AppId; name: string; subtitle: string }[] = [
  { id: 'finder', name: 'Finder', subtitle: 'Carpetas y archivos' },
  { id: 'notes', name: 'Notas', subtitle: 'Bloc de notas y listas' },
  { id: 'photos', name: 'Fotos', subtitle: 'Galería de imágenes' },
  { id: 'audio', name: 'Audios', subtitle: 'Notas de voz y pistas' },
  { id: 'archive', name: 'Archivos ZIP', subtitle: 'Utilidad de compresión' },
  { id: 'spotify', name: 'Spotify', subtitle: 'Música y playlists' },
  { id: 'whatsapp', name: 'WhatsApp', subtitle: 'Mensajes y audios' },
  { id: 'instagram', name: 'Instagram', subtitle: 'Feed e historias' },
];

export const SpotlightModal: React.FC<SpotlightModalProps> = ({
  isOpen,
  onClose,
  nodes,
  spotifyTracks,
  onOpenApp,
  onOpenFileNode,
  onPlaySpotifyTrack,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();
  const matchedApps = q
    ? APPS_LIST.filter(
        (a) => a.name.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)
      )
    : APPS_LIST.slice(0, 4);

  const matchedFiles = q ? searchNodes(nodes, q).slice(0, 6) : [];
  const matchedSongs = q
    ? spotifyTracks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q)
      )
    : [];

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-black/25 pt-24 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-label="Búsqueda Spotlight"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-black/15 bg-white/90 shadow-2xl backdrop-blur-2xl dark:border-white/15 dark:bg-neutral-900/95"
      >
        <div className="flex items-center gap-3 border-b border-black/10 px-4 py-3 dark:border-white/10">
          <Search className="h-5 w-5 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
            placeholder="Buscar carpetas, notas, archivos .zip, Spotify, apps…"
            aria-label="Buscar en MacBook Air"
            className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-white"
          />
        </div>

        <div className="max-h-80 overflow-y-auto p-2 mac-scrollbar space-y-2">
          {matchedApps.length > 0 && (
            <div>
              <p className="px-2.5 py-1 text-[11px] font-semibold text-neutral-500">
                Aplicaciones
              </p>
              {matchedApps.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => {
                    onOpenApp(app.id);
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-sky-500 hover:text-white"
                >
                  <AppGlyph appId={app.id} className="h-8 w-8" />
                  <div>
                    <p className="text-xs font-semibold">{app.name}</p>
                    <p className="text-[11px] opacity-75">{app.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {matchedFiles.length > 0 && (
            <div>
              <p className="px-2.5 py-1 text-[11px] font-semibold text-neutral-500">
                Archivos y carpetas
              </p>
              {matchedFiles.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => {
                    onOpenFileNode(file);
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-sky-500 hover:text-white"
                >
                  <FileKindIcon kind={file.kind} className="h-8 w-8 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{file.name}</p>
                    <p className="text-[11px] opacity-75">{file.updatedAt}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {matchedSongs.length > 0 && (
            <div>
              <p className="px-2.5 py-1 text-[11px] font-semibold text-neutral-500">
                Spotify
              </p>
              {matchedSongs.map((song) => (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => {
                    onPlaySpotifyTrack(song.id);
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-sky-500 hover:text-white"
                >
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded object-cover"
                  />
                  <div>
                    <p className="text-xs font-semibold">{song.title}</p>
                    <p className="text-[11px] opacity-75">{song.artist}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {q && matchedApps.length === 0 && matchedFiles.length === 0 && matchedSongs.length === 0 && (
            <p className="py-8 text-center text-xs text-neutral-500">
              No se encontraron resultados para “{query}”
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
