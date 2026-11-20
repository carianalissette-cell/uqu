import React, { useEffect, useState } from 'react';
import { Mic, Pause, Play, Square, Volume2 } from 'lucide-react';
import { macAudioSynth } from '../../os/audioSynth';
import type { FSNode } from '../../os/types';

interface AudioAppProps {
  audios: FSNode[];
  selectedAudioId?: string;
  systemVolume: number;
  onAddVoiceMemo: (name: string, durationSec: number) => void;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const AudioApp: React.FC<AudioAppProps> = ({
  audios,
  selectedAudioId,
  systemVolume,
  onAddVoiceMemo,
}) => {
  const [activeId, setActiveId] = useState<string>(selectedAudioId ?? audios[0]?.id ?? '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [rate, setRate] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recSec, setRecSec] = useState(0);

  const activeTrack = audios.find((a) => a.id === activeId) ?? audios[0] ?? null;
  const duration = activeTrack?.durationSec ?? 32;

  useEffect(() => {
    if (selectedAudioId) {
      setActiveId(selectedAudioId);
      setElapsed(0);
    }
  }, [selectedAudioId]);

  useEffect(() => {
    if (!isPlaying || !activeTrack) {
      return;
    }
    const tick = window.setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= duration) {
          setIsPlaying(false);
          macAudioSynth.stop();
          return 0;
        }
        return prev + 1;
      });
    }, Math.round(1000 / rate));
    return () => window.clearInterval(tick);
  }, [isPlaying, activeTrack, duration, rate]);

  useEffect(() => {
    if (!isRecording) return;
    const id = window.setInterval(() => setRecSec((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      macAudioSynth.stop();
    };
  }, []);

  const togglePlay = (track = activeTrack) => {
    if (!track) return;
    if (track.id !== activeId) {
      setActiveId(track.id);
      setElapsed(0);
      setIsPlaying(true);
      macAudioSynth.start(track.audioPreset ?? 'lofi', systemVolume, rate);
      return;
    }

    if (isPlaying) {
      setIsPlaying(false);
      macAudioSynth.stop();
    } else {
      setIsPlaying(true);
      macAudioSynth.start(track.audioPreset ?? 'lofi', systemVolume, rate);
    }
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      const finalDur = Math.max(4, recSec);
      onAddVoiceMemo(`Grabación_${audios.length + 1}.m4a`, finalDur);
      setRecSec(0);
    } else {
      setIsPlaying(false);
      macAudioSynth.stop();
      setRecSec(0);
      setIsRecording(true);
    }
  };

  const cycleRate = () => {
    const next = rate === 1 ? 1.25 : rate === 1.25 ? 1.5 : 1;
    setRate(next);
    macAudioSynth.setPlaybackRate(next);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left: Library */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-black/8 bg-neutral-50 dark:border-white/10 dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-black/8 px-3.5 py-2.5 dark:border-white/10">
          <span className="text-xs font-semibold">Audios y Notas de voz</span>
          <button
            type="button"
            onClick={handleRecordToggle}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              isRecording
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-rose-500 text-white hover:bg-rose-600'
            }`}
          >
            {isRecording ? <Square className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
            <span>{isRecording ? `Detener (${recSec}s)` : 'Grabar'}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 mac-scrollbar">
          {audios.map((track) => {
            const isSelected = activeTrack?.id === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => {
                  setActiveId(track.id);
                  setElapsed(0);
                  setIsPlaying(false);
                  macAudioSynth.stop();
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors ${
                  isSelected
                    ? 'bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">
                    {track.name.replace(/\.(m4a|mp3)$/i, '')}
                  </p>
                  <p className="text-[11px] text-neutral-500">{track.updatedAt}</p>
                </div>
                <span className="ml-2 shrink-0 text-[11px] text-neutral-500 tabular-nums">
                  {formatDuration(track.durationSec ?? 32)}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Right: Player & Waveform */}
      <div className="flex min-w-0 flex-1 flex-col items-center justify-between bg-white p-6 dark:bg-neutral-950">
        {activeTrack ? (
          <>
            <div className="w-full text-center">
              <p className="text-xs text-neutral-500">Reproductor de Audio</p>
              <h3 className="mt-1 text-lg font-bold tracking-tight">
                {activeTrack.name.replace(/\.(m4a|mp3)$/i, '')}
              </h3>
              <p className="mt-0.5 text-xs text-neutral-500">
                {activeTrack.updatedAt} · Formato AAC
              </p>
            </div>

            {/* Interactive Waveform Bars */}
            <div className="my-4 flex h-28 w-full max-w-md items-center justify-center gap-1 rounded-2xl border border-black/8 bg-neutral-50 px-5 dark:border-white/10 dark:bg-neutral-900">
              {Array.from({ length: 28 }).map((_, i) => {
                const progressRatio = elapsed / Math.max(1, duration);
                const barRatio = i / 28;
                const activeBar = barRatio <= progressRatio;
                const baseH = 22 + ((i * 19 + (activeTrack.name.length * 7)) % 56);
                const dynamicH = isPlaying ? Math.min(86, baseH + ((i + elapsed) % 3) * 12) : baseH;
                return (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all duration-150 ${
                      activeBar ? 'bg-rose-500' : 'bg-neutral-300 dark:bg-neutral-700'
                    }`}
                    style={{ height: `${dynamicH}%` }}
                  />
                );
              })}
            </div>

            {/* Scrubber & Controls */}
            <div className="w-full max-w-md space-y-4">
              <div>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={elapsed}
                  onChange={(e) => setElapsed(Number(e.target.value))}
                  aria-label="Posición de audio"
                  className="w-full accent-rose-500"
                />
                <div className="mt-1 flex justify-between text-[11px] text-neutral-500 tabular-nums">
                  <span>{formatDuration(elapsed)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={cycleRate}
                  className="rounded-lg border border-black/10 px-2.5 py-1 text-xs font-semibold tabular-nums hover:bg-black/5 dark:border-white/15"
                >
                  {rate}x
                </button>

                <button
                  type="button"
                  onClick={() => togglePlay(activeTrack)}
                  aria-label={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg transition-transform hover:scale-105 hover:bg-rose-600"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
                </button>

                <div className="flex items-center gap-1 text-xs text-neutral-500 tabular-nums">
                  <Volume2 className="h-4 w-4" />
                  <span>{Math.round(systemVolume * 100)}%</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="my-auto text-xs text-neutral-400">No hay archivos de audio</p>
        )}
      </div>
    </div>
  );
};
