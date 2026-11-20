import React from 'react';
import {
  Archive,
  Camera,
  FileAudio,
  FileText,
  Folder,
  Headphones,
  MessageCircle,
  Music2,
  StickyNote,
  Trash2,
} from 'lucide-react';
import type { AppId, FileKind } from '../../os/types';

export const AppGlyph: React.FC<{ appId: AppId | 'trash'; className?: string }> = ({
  appId,
  className = 'h-11 w-11',
}) => {
  switch (appId) {
    case 'finder':
      return (
        <div
          className={`${className} flex items-center justify-center rounded-[12px] bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow-md ring-1 ring-white/25`}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-current fill-none" strokeWidth={1.8}>
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <path d="M12 4v16" />
            <path d="M8 10v1M16 10v1" strokeLinecap="round" />
            <path d="M8.5 15c1 .9 2.2 1.3 3.5 1.3s2.5-.4 3.5-1.3" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'notes':
      return (
        <div
          className={`${className} flex items-center justify-center rounded-[12px] bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-neutral-900 shadow-md ring-1 ring-white/30`}
        >
          <StickyNote className="h-6 w-6" />
        </div>
      );
    case 'photos':
      return (
        <div
          className={`${className} flex items-center justify-center rounded-[12px] bg-white text-rose-500 shadow-md ring-1 ring-black/10`}
        >
          <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 text-white">
            <Camera className="h-4 w-4" />
          </div>
        </div>
      );
    case 'audio':
      return (
        <div
          className={`${className} flex items-center justify-center rounded-[12px] bg-gradient-to-b from-slate-800 to-neutral-950 text-rose-400 shadow-md ring-1 ring-white/15`}
        >
          <Headphones className="h-6 w-6" />
        </div>
      );
    case 'archive':
      return (
        <div
          className={`${className} flex items-center justify-center rounded-[12px] bg-gradient-to-b from-stone-200 to-stone-400 text-stone-800 shadow-md ring-1 ring-white/40`}
        >
          <Archive className="h-6 w-6" />
        </div>
      );
    case 'spotify':
      return (
        <div
          className={`${className} flex items-center justify-center rounded-[12px] bg-[#121212] text-[#1DB954] shadow-md ring-1 ring-white/15`}
        >
          <Music2 className="h-6 w-6" />
        </div>
      );
    case 'whatsapp':
      return (
        <div
          className={`${className} flex items-center justify-center rounded-[12px] bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-md ring-1 ring-white/25`}
        >
          <MessageCircle className="h-6 w-6" />
        </div>
      );
    case 'instagram':
      return (
        <div
          className={`${className} flex items-center justify-center rounded-[12px] bg-gradient-to-tr from-amber-400 via-rose-500 to-violet-600 text-white shadow-md ring-1 ring-white/25`}
        >
          <Camera className="h-6 w-6" />
        </div>
      );
    case 'trash':
      return (
        <div
          className={`${className} flex items-center justify-center rounded-[12px] bg-gradient-to-b from-neutral-200 to-neutral-400 text-neutral-700 shadow-md ring-1 ring-white/30`}
        >
          <Trash2 className="h-6 w-6" />
        </div>
      );
    default:
      return (
        <div
          className={`${className} flex items-center justify-center rounded-[12px] bg-neutral-700 text-white shadow-md`}
        >
          <Folder className="h-6 w-6" />
        </div>
      );
  }
};

export const FileKindIcon: React.FC<{ kind: FileKind; className?: string }> = ({
  kind,
  className = 'h-10 w-10',
}) => {
  switch (kind) {
    case 'folder':
      return (
        <svg viewBox="0 0 48 40" className={className} aria-hidden="true">
          <path
            d="M4 8a4 4 0 0 1 4-4h10.5a3 3 0 0 1 2.4 1.2L23.5 8H40a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Z"
            fill="#38BDF8"
          />
          <path
            d="M4 13h40v19a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V13Z"
            fill="#0284C7"
          />
        </svg>
      );
    case 'note':
      return (
        <div className={`${className} flex items-center justify-center rounded-lg bg-amber-100 text-amber-700 ring-1 ring-amber-300/70`}>
          <FileText className="h-5 w-5" />
        </div>
      );
    case 'photo':
      return (
        <div className={`${className} flex items-center justify-center rounded-lg bg-sky-100 text-sky-700 ring-1 ring-sky-300/70`}>
          <Camera className="h-5 w-5" />
        </div>
      );
    case 'audio':
      return (
        <div className={`${className} flex items-center justify-center rounded-lg bg-rose-100 text-rose-600 ring-1 ring-rose-300/70`}>
          <FileAudio className="h-5 w-5" />
        </div>
      );
    case 'zip':
      return (
        <div className={`${className} flex items-center justify-center rounded-lg bg-stone-200 text-stone-700 ring-1 ring-stone-400/70`}>
          <Archive className="h-5 w-5" />
        </div>
      );
  }
};
