import React, { useState } from 'react';
import { Archive, CheckCircle2, FolderOpen, PackageOpen } from 'lucide-react';
import { formatBytes } from '../../os/filesystem';
import type { FSNode, ZipEntryItem } from '../../os/types';
import { FileKindIcon } from '../os/AppGlyph';

interface ArchiveAppProps {
  zipFiles: FSNode[];
  selectedZipId?: string;
  onSelectZip: (zipId: string) => void;
  onExtractZip: (zipId: string) => { targetFolderId: string | null; extractedCount: number };
  onOpenFolderInFinder: (folderId: string) => void;
}

const EntryTree: React.FC<{ entries: ZipEntryItem[]; depth?: number }> = ({
  entries,
  depth = 0,
}) => {
  return (
    <div className="space-y-1">
      {entries.map((entry, idx) => (
        <div key={`${entry.name}-${idx}`}>
          <div
            className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5"
            style={{ paddingLeft: `${depth * 18 + 8}px` }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <FileKindIcon kind={entry.kind} className="h-5 w-5 shrink-0" />
              <span className="truncate font-medium">{entry.name}</span>
            </div>
            <span className="ml-2 shrink-0 text-[11px] text-neutral-500 tabular-nums">
              {entry.kind === 'folder' ? 'Carpeta' : formatBytes(entry.sizeBytes)}
            </span>
          </div>
          {entry.children && entry.children.length > 0 && (
            <EntryTree entries={entry.children} depth={depth + 1} />
          )}
        </div>
      ))}
    </div>
  );
};

export const ArchiveApp: React.FC<ArchiveAppProps> = ({
  zipFiles,
  selectedZipId,
  onSelectZip,
  onExtractZip,
  onOpenFolderInFinder,
}) => {
  const [extractingId, setExtractingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [lastResult, setLastResult] = useState<{
    zipId: string;
    folderId: string;
    count: number;
  } | null>(null);

  const activeZip = zipFiles.find((z) => z.id === selectedZipId) ?? zipFiles[0] ?? null;

  const handleExtract = () => {
    if (!activeZip || extractingId) return;
    setExtractingId(activeZip.id);
    setProgress(20);

    const t1 = window.setTimeout(() => setProgress(68), 160);
    const t2 = window.setTimeout(() => {
      setProgress(100);
      const res = onExtractZip(activeZip.id);
      if (res.targetFolderId) {
        setLastResult({
          zipId: activeZip.id,
          folderId: res.targetFolderId,
          count: res.extractedCount,
        });
      }
      setExtractingId(null);
    }, 420);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  };

  const extractedFolderId =
    (lastResult?.zipId === activeZip?.id ? lastResult.folderId : undefined) ??
    activeZip?.extractedFolderId;

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar list of .zip archives */}
      <aside className="w-52 shrink-0 border-r border-black/8 bg-neutral-50 p-2.5 dark:border-white/10 dark:bg-neutral-900">
        <p className="px-2 pb-1.5 text-[11px] font-semibold text-neutral-500">
          Archivos comprimidos ({zipFiles.length})
        </p>
        <div className="space-y-1">
          {zipFiles.map((zip) => {
            const active = activeZip?.id === zip.id;
            return (
              <button
                key={zip.id}
                type="button"
                onClick={() => onSelectZip(zip.id)}
                className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition-colors ${
                  active
                    ? 'bg-sky-500/15 text-sky-700 dark:bg-sky-500/25 dark:text-sky-300'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Archive className="h-4 w-4 shrink-0 text-stone-500" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{zip.name}</p>
                  <p className="text-[10px] text-neutral-500 tabular-nums">
                    {formatBytes(zip.sizeBytes)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Inspector & Extraction */}
      <div className="flex min-w-0 flex-1 flex-col bg-white dark:bg-neutral-950">
        {activeZip ? (
          <>
            <div className="flex items-center justify-between border-b border-black/8 px-4 py-3 dark:border-white/10">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold">{activeZip.name}</h3>
                <p className="text-xs text-neutral-500 tabular-nums">
                  Archivo ZIP · {formatBytes(activeZip.sizeBytes)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {extractedFolderId && (
                  <button
                    type="button"
                    onClick={() => onOpenFolderInFinder(extractedFolderId)}
                    className="flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
                  >
                    <FolderOpen className="h-3.5 w-3.5 text-sky-500" />
                    <span>Ver en Finder</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={Boolean(extractingId)}
                  className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
                >
                  <PackageOpen className="h-3.5 w-3.5" />
                  <span>{extractingId ? 'Extrayendo…' : 'Extraer archivos'}</span>
                </button>
              </div>
            </div>

            {extractingId === activeZip.id && (
              <div className="border-b border-black/8 bg-sky-50/70 px-4 py-2 dark:border-white/10 dark:bg-sky-950/30">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div
                    className="h-full bg-sky-600 transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {lastResult?.zipId === activeZip.id && !extractingId && (
              <div className="flex items-center gap-2 border-b border-emerald-500/20 bg-emerald-50/80 px-4 py-2 text-xs font-medium text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  Se extrajeron {lastResult.count} elementos correctamente en Finder.
                </span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-3 mac-scrollbar">
              <p className="px-2 pb-2 text-[11px] font-semibold text-neutral-500">
                Contenido del archivo
              </p>
              {activeZip.zipEntries?.length ? (
                <EntryTree entries={activeZip.zipEntries} />
              ) : (
                <p className="px-2 text-xs text-neutral-400">Archivo vacío</p>
              )}
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-neutral-400">
            No se encontraron archivos .zip
          </div>
        )}
      </div>
    </div>
  );
};
