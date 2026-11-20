import React from 'react';
import { Laptop } from 'lucide-react';
import { formatBytes } from '../../os/filesystem';
import type { FSNode } from '../../os/types';

export const AboutMacModal: React.FC<{ nodes: FSNode[] }> = ({ nodes }) => {
  const totalUsed = nodes.reduce((sum, n) => sum + (n.sizeBytes || 0), 0);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-white p-6 text-center dark:bg-neutral-950">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-800 shadow-sm dark:bg-neutral-800 dark:text-neutral-100">
        <Laptop className="h-9 w-9" />
      </div>

      <h3 className="mt-4 text-lg font-bold tracking-tight">MacBook Air</h3>
      <p className="text-xs text-neutral-500">13 pulgadas, M3 · 2026</p>

      <div className="mt-5 w-full max-w-xs space-y-2 border-t border-black/8 pt-4 text-xs dark:border-white/10">
        <div className="flex justify-between">
          <span className="text-neutral-500">Chip</span>
          <span className="font-medium">Apple M3</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Memoria</span>
          <span className="font-medium tabular-nums">16 GB</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Sistema</span>
          <span className="font-medium">macOS Sequoia</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Archivos locales</span>
          <span className="font-medium tabular-nums">
            {nodes.filter((n) => !n.isSystem).length} ({formatBytes(totalUsed)})
          </span>
        </div>
      </div>
    </div>
  );
};
