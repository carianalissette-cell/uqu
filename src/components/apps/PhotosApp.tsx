import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Image as ImageIcon, Monitor, X } from 'lucide-react';
import type { FSNode } from '../../os/types';

interface PhotosAppProps {
  photos: FSNode[];
  initialPhotoId?: string;
  onToggleFavorite: (photoId: string) => void;
  onSetWallpaper: (imageUrl: string) => void;
}

export const PhotosApp: React.FC<PhotosAppProps> = ({
  photos,
  initialPhotoId,
  onToggleFavorite,
  onSetWallpaper,
}) => {
  const [filter, setFilter] = useState<'all' | 'favorites' | string>('all');
  const [lightboxId, setLightboxId] = useState<string | null>(initialPhotoId ?? null);
  const [cols, setCols] = useState<number>(3);
  const [wallpaperNotice, setWallpaperNotice] = useState(false);

  const albums = Array.from(new Set(photos.map((p) => p.album).filter(Boolean))) as string[];

  const visiblePhotos = photos.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'favorites') return Boolean(p.favorite);
    return p.album === filter;
  });

  const lightboxIndex = visiblePhotos.findIndex((p) => p.id === lightboxId);
  const activePhoto = lightboxIndex >= 0 ? visiblePhotos[lightboxIndex] : null;

  const handleSetWallpaper = (url: string) => {
    onSetWallpaper(url);
    setWallpaperNotice(true);
    window.setTimeout(() => setWallpaperNotice(false), 2000);
  };

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-44 shrink-0 border-r border-black/8 bg-neutral-50 p-2.5 dark:border-white/10 dark:bg-neutral-900">
        <p className="px-2 pb-1.5 text-[11px] font-semibold text-neutral-500">Biblioteca</p>
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium ${
              filter === 'all'
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Todas ({photos.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('favorites')}
            className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium ${
              filter === 'favorites'
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <Heart className="h-3.5 w-3.5" />
            <span>Favoritas ({photos.filter((p) => p.favorite).length})</span>
          </button>
        </div>

        {albums.length > 0 && (
          <>
            <p className="mt-4 px-2 pb-1.5 text-[11px] font-semibold text-neutral-500">Álbumes</p>
            <div className="space-y-0.5">
              {albums.map((alb) => (
                <button
                  key={alb}
                  type="button"
                  onClick={() => setFilter(alb)}
                  className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs font-medium ${
                    filter === alb
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  <span className="truncate">{alb}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </aside>

      {/* Gallery Grid */}
      <div className="flex min-w-0 flex-1 flex-col bg-white dark:bg-neutral-950">
        <div className="flex items-center justify-between border-b border-black/8 px-4 py-2 dark:border-white/10">
          <p className="text-xs font-semibold">
            {filter === 'all' ? 'Todas las fotos' : filter === 'favorites' ? 'Favoritas' : filter}
            <span className="ml-2 font-normal text-neutral-500 tabular-nums">
              {visiblePhotos.length} elementos
            </span>
          </p>

          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>Tamaño</span>
            <input
              type="range"
              min={2}
              max={4}
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              aria-label="Tamaño de cuadrícula"
              className="w-20 accent-rose-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 mac-scrollbar">
          {visiblePhotos.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-neutral-400">
              No hay fotos en esta vista
            </div>
          ) : (
            <div
              className={`grid gap-3 ${
                cols === 2 ? 'grid-cols-2' : cols === 4 ? 'grid-cols-4' : 'grid-cols-3'
              }`}
            >
              {visiblePhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative overflow-hidden rounded-xl border border-black/8 bg-neutral-100 dark:border-white/10 dark:bg-neutral-900"
                >
                  <button
                    type="button"
                    onClick={() => setLightboxId(photo.id)}
                    aria-label={`Ver foto ${photo.name}`}
                    className="block w-full aspect-[4/3] overflow-hidden"
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                    />
                  </button>
                  <div className="flex items-center justify-between px-2.5 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{photo.name.replace(/\.jpg$/i, '')}</p>
                      <p className="text-[10px] text-neutral-500">{photo.dimensions ?? '4032 × 3024'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(photo.id)}
                      aria-label={`Marcar ${photo.name} como favorita`}
                      className={`rounded-md p-1 transition-colors ${
                        photo.favorite
                          ? 'text-rose-500'
                          : 'text-neutral-400 hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${photo.favorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Viewer */}
      {activePhoto && (
        <div className="absolute inset-0 z-30 flex flex-col bg-neutral-950/95 text-white backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">{activePhoto.name}</p>
              <p className="text-[11px] text-neutral-400">
                {activePhoto.camera ?? 'Cámara Mac'} · {activePhoto.dimensions ?? '4032 × 3024'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {activePhoto.imageUrl && (
                <button
                  type="button"
                  onClick={() => handleSetWallpaper(activePhoto.imageUrl!)}
                  className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium hover:bg-white/20"
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span>{wallpaperNotice ? 'Fondo actualizado' : 'Usar como fondo'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onToggleFavorite(activePhoto.id)}
                aria-label="Alternar favorita"
                className={`rounded-lg p-1.5 hover:bg-white/15 ${
                  activePhoto.favorite ? 'text-rose-500' : 'text-white'
                }`}
              >
                <Heart className={`h-4 w-4 ${activePhoto.favorite ? 'fill-current' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setLightboxId(null)}
                aria-label="Cerrar vista ampliada"
                className="rounded-lg p-1.5 hover:bg-white/15"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center p-4 min-h-0">
            <button
              type="button"
              disabled={lightboxIndex <= 0}
              onClick={() => setLightboxId(visiblePhotos[lightboxIndex - 1].id)}
              aria-label="Foto anterior"
              className="absolute left-3 rounded-full bg-white/15 p-2 hover:bg-white/25 disabled:opacity-25"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <img
              src={activePhoto.imageUrl}
              alt={activePhoto.name}
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
            />

            <button
              type="button"
              disabled={lightboxIndex >= visiblePhotos.length - 1}
              onClick={() => setLightboxId(visiblePhotos[lightboxIndex + 1].id)}
              aria-label="Foto siguiente"
              className="absolute right-3 rounded-full bg-white/15 p-2 hover:bg-white/25 disabled:opacity-25"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
