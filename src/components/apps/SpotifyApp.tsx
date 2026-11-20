import React, { useEffect, useState } from 'react';
import {
  Heart,
  Home,
  Library,
  Pause,
  Play,
  Repeat,
  Search,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react';
import { macAudioSynth } from '../../os/audioSynth';
import type { SpotifyTrack } from '../../os/types';

interface SpotifyAppProps {
  tracks: SpotifyTrack[];
  activeTrackId: string;
  onSelectTrack: (trackId: string) => void;
  onToggleLike: (trackId: string) => void;
  systemVolume: number;
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const SpotifyApp: React.FC<SpotifyAppProps> = ({
  tracks,
  activeTrackId,
  onSelectTrack,
  onToggleLike,
  systemVolume,
}) => {
  const [tab, setTab] = useState<'home' | 'search' | 'library'>('home');
  const [query, setQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(18);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [localVolume, setLocalVolume] = useState(Math.round(systemVolume * 100));

  const currentTrack = tracks.find((t) => t.id === activeTrackId) ?? tracks[0];

  useEffect(() => {
    if (!isPlaying || !currentTrack) return;
    const id = window.setInterval(() => {
      setProgress((prev) => {
        if (prev + 1 >= currentTrack.durationSec) {
          if (repeat) return 0;
          const idx = tracks.findIndex((t) => t.id === currentTrack.id);
          const next = tracks[(idx + 1) % tracks.length];
          onSelectTrack(next.id);
          macAudioSynth.start(next.preset, localVolume / 100, 1);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isPlaying, currentTrack, tracks, repeat, localVolume, onSelectTrack]);

  useEffect(() => {
    return () => {
      macAudioSynth.stop();
    };
  }, []);

  const playTrack = (track: SpotifyTrack) => {
    if (track.id === currentTrack.id && isPlaying) {
      setIsPlaying(false);
      macAudioSynth.stop();
      return;
    }
    onSelectTrack(track.id);
    setProgress(0);
    setIsPlaying(true);
    macAudioSynth.start(track.preset, localVolume / 100, 1);
  };

  const handleNext = () => {
    const idx = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIdx = shuffle
      ? Math.floor(Math.random() * tracks.length)
      : (idx + 1) % tracks.length;
    const next = tracks[nextIdx];
    onSelectTrack(next.id);
    setProgress(0);
    if (isPlaying) {
      macAudioSynth.start(next.preset, localVolume / 100, 1);
    }
  };

  const handlePrev = () => {
    const idx = tracks.findIndex((t) => t.id === currentTrack.id);
    const prev = tracks[(idx - 1 + tracks.length) % tracks.length];
    onSelectTrack(prev.id);
    setProgress(0);
    if (isPlaying) {
      macAudioSynth.start(prev.preset, localVolume / 100, 1);
    }
  };

  const visibleTracks = tracks.filter((t) => {
    if (tab === 'library' && !t.liked) return false;
    if (tab === 'search' && query.trim()) {
      const q = query.trim().toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex h-full w-full flex-col bg-[#121212] text-white">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="flex w-48 shrink-0 flex-col gap-2 bg-black p-3">
          <nav aria-label="Navegación Spotify" className="space-y-1">
            <button
              type="button"
              onClick={() => setTab('home')}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                tab === 'home' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Inicio</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('search')}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                tab === 'search' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Buscar</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('library')}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                tab === 'library' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Library className="h-4 w-4" />
              <span>Favoritas ({tracks.filter((t) => t.liked).length})</span>
            </button>
          </nav>

          <div className="mt-3 border-t border-white/10 pt-3">
            <p className="px-2 text-[11px] font-semibold text-neutral-400">Playlists</p>
            <div className="mt-2 space-y-1 text-xs text-neutral-300">
              <button
                type="button"
                onClick={() => setTab('home')}
                className="w-full rounded-md px-2 py-1.5 text-left hover:bg-white/10"
              >
                Sesión MacBook Air
              </button>
              <button
                type="button"
                onClick={() => setTab('library')}
                className="w-full rounded-md px-2 py-1.5 text-left hover:bg-white/10"
              >
                Tus me gusta
              </button>
            </div>
          </div>
        </aside>

        {/* Main View */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-emerald-950/70 via-[#121212] to-[#121212] p-5 mac-scrollbar">
          {tab === 'search' && (
            <div className="mb-4 relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="¿Qué quieres escuchar?"
                aria-label="Buscar canciones en Spotify"
                className="w-full rounded-full bg-neutral-800 py-2 pl-9 pr-4 text-xs text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
              />
            </div>
          )}

          {/* Hero Banner */}
          <div className="mb-6 flex items-end gap-5">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.album}
              referrerPolicy="no-referrer"
              className="h-28 w-28 rounded-lg object-cover shadow-2xl"
            />
            <div>
              <p className="text-[11px] font-semibold text-neutral-300">Playlist seleccionada</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                {tab === 'library' ? 'Canciones que te gustan' : 'Nocturno en Estudio'}
              </h2>
              <p className="mt-1 text-xs text-neutral-300">
                Sofía Morales · {visibleTracks.length} canciones
              </p>
            </div>
          </div>

          {/* Tracklist */}
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[11px] text-neutral-400">
                <th className="pb-2 pl-2 w-8">#</th>
                <th className="pb-2">Título</th>
                <th className="pb-2 hidden sm:table-cell">Álbum</th>
                <th className="pb-2 text-right pr-2">Duración</th>
              </tr>
            </thead>
            <tbody>
              {visibleTracks.map((track, index) => {
                const isActive = track.id === currentTrack.id;
                return (
                  <tr
                    key={track.id}
                    className={`group rounded-lg transition-colors hover:bg-white/10 ${
                      isActive ? 'bg-white/10' : ''
                    }`}
                  >
                    <td className="py-2 pl-2 tabular-nums text-neutral-400">
                      <button
                        type="button"
                        onClick={() => playTrack(track)}
                        aria-label={`${isActive && isPlaying ? 'Pausar' : 'Reproducir'} ${track.title}`}
                        className="flex h-6 w-6 items-center justify-center rounded-full hover:text-[#1DB954]"
                      >
                        {isActive && isPlaying ? (
                          <Pause className="h-3.5 w-3.5 text-[#1DB954]" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </button>
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => playTrack(track)}
                        className="flex items-center gap-3 text-left"
                      >
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          referrerPolicy="no-referrer"
                          className="h-9 w-9 rounded object-cover"
                        />
                        <div>
                          <p
                            className={`font-semibold ${
                              isActive ? 'text-[#1DB954]' : 'text-white'
                            }`}
                          >
                            {track.title}
                          </p>
                          <p className="text-[11px] text-neutral-400">{track.artist}</p>
                        </div>
                      </button>
                    </td>
                    <td className="py-2 text-neutral-400 hidden sm:table-cell">{track.album}</td>
                    <td className="py-2 pr-2 text-right">
                      <div className="inline-flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onToggleLike(track.id)}
                          aria-label={`Me gusta ${track.title}`}
                          className={
                            track.liked
                              ? 'text-[#1DB954]'
                              : 'text-neutral-500 hover:text-white'
                          }
                        >
                          <Heart className={`h-3.5 w-3.5 ${track.liked ? 'fill-current' : ''}`} />
                        </button>
                        <span className="text-neutral-400 tabular-nums">
                          {fmtTime(track.durationSec)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Persistent Player Bar */}
      <div className="flex h-20 shrink-0 items-center justify-between border-t border-white/10 bg-[#181818] px-4">
        <div className="flex w-52 items-center gap-3 min-w-0">
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            referrerPolicy="no-referrer"
            className="h-11 w-11 rounded object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">{currentTrack.title}</p>
            <p className="truncate text-[11px] text-neutral-400">{currentTrack.artist}</p>
          </div>
          <button
            type="button"
            onClick={() => onToggleLike(currentTrack.id)}
            aria-label="Alternar favorito en canción actual"
            className={currentTrack.liked ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'}
          >
            <Heart className={`h-4 w-4 ${currentTrack.liked ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="flex max-w-md flex-1 flex-col items-center gap-1.5 px-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShuffle((s) => !s)}
              aria-label="Modo aleatorio"
              className={shuffle ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'}
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Canción anterior"
              className="text-neutral-300 hover:text-white"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => playTrack(currentTrack)}
              aria-label={isPlaying ? 'Pausar Spotify' : 'Reproducir Spotify'}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-0.5" />}
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Siguiente canción"
              className="text-neutral-300 hover:text-white"
            >
              <SkipForward className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setRepeat((r) => !r)}
              aria-label="Repetir canción"
              className={repeat ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'}
            >
              <Repeat className="h-4 w-4" />
            </button>
          </div>

          <div className="flex w-full items-center gap-2 text-[10px] text-neutral-400 tabular-nums">
            <span>{fmtTime(progress)}</span>
            <input
              type="range"
              min={0}
              max={currentTrack.durationSec}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              aria-label="Progreso de canción"
              className="h-1 flex-1 accent-[#1DB954]"
            />
            <span>{fmtTime(currentTrack.durationSec)}</span>
          </div>
        </div>

        <div className="hidden sm:flex w-36 items-center justify-end gap-2">
          <Volume2 className="h-4 w-4 text-neutral-400" />
          <input
            type="range"
            min={0}
            max={100}
            value={localVolume}
            onChange={(e) => {
              const val = Number(e.target.value);
              setLocalVolume(val);
              macAudioSynth.setVolume(val / 100);
            }}
            aria-label="Volumen de Spotify"
            className="w-20 accent-[#1DB954]"
          />
        </div>
      </div>
    </div>
  );
};
