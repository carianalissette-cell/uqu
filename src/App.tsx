/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { AboutMacModal } from './components/apps/AboutMacModal';
import { ArchiveApp } from './components/apps/ArchiveApp';
import { AudioApp } from './components/apps/AudioApp';
import { FinderApp } from './components/apps/FinderApp';
import { InstagramApp } from './components/apps/InstagramApp';
import { NotesApp } from './components/apps/NotesApp';
import { PhotosApp } from './components/apps/PhotosApp';
import { SpotifyApp } from './components/apps/SpotifyApp';
import { WhatsAppApp } from './components/apps/WhatsAppApp';
import { FileKindIcon } from './components/os/AppGlyph';
import { BootScreen } from './components/os/BootScreen';
import { DesktopWindow } from './components/os/DesktopWindow';
import { Dock } from './components/os/Dock';
import { LockScreen } from './components/os/LockScreen';
import { MacBookFrame } from './components/os/MacBookFrame';
import { MenuBar } from './components/os/MenuBar';
import { SpotlightModal } from './components/os/SpotlightModal';
import {
  INITIAL_INSTAGRAM_POSTS,
  INITIAL_INSTAGRAM_STORIES,
  INITIAL_SPOTIFY_TRACKS,
  INITIAL_WHATSAPP_CHATS,
} from './os/appsData';
import { MAC_ASSETS } from './os/assets';
import { macAudioSynth } from './os/audioSynth';
import {
  ROOT_IDS,
  compressFolderToZip,
  createFolder,
  createInitialFileSystem,
  createNoteNode,
  emptyTrash,
  extractZipArchive,
  getChildren,
  moveToTrash,
  renameNode,
  restoreFromTrash,
  updateNoteNode,
} from './os/filesystem';
import type {
  AppId,
  FSNode,
  InstagramPost,
  InstagramStory,
  SpotifyTrack,
  WhatsAppChat,
  WindowState,
} from './os/types';
import {
  APP_DEFAULT_CONFIG,
  closeWindow,
  focusWindow,
  minimizeWindow,
  moveWindow,
  openOrFocusWindow,
  toggleMaximizeWindow,
} from './os/windowManager';

const STORAGE_KEYS = {
  FS: 'macbook-air-os-fs-v1',
  SPOTIFY: 'macbook-air-os-spotify-v1',
  WHATSAPP: 'macbook-air-os-whatsapp-v1',
  INSTAGRAM_POSTS: 'macbook-air-os-ig-posts-v1',
  PREFS: 'macbook-air-os-prefs-v1',
} as const;

function loadStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const autostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [powerPhase, setPowerPhase] = useState<'boot' | 'lock' | 'desktop'>(
    autostart ? 'desktop' : 'boot'
  );
  const [autoTypePassword, setAutoTypePassword] = useState(!autostart);

  const [prefs, setPrefs] = useState(() =>
    loadStorage(STORAGE_KEYS.PREFS, {
      isDark: false,
      brightness: 100,
      volume: 0.7,
      wifiOn: true,
      wallpaperUrl: MAC_ASSETS.wallpaperDusk as string,
    })
  );

  const [nodes, setNodes] = useState<FSNode[]>(() =>
    loadStorage(STORAGE_KEYS.FS, createInitialFileSystem())
  );
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [selectedDesktopId, setSelectedDesktopId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  const [spotifyTracks, setSpotifyTracks] = useState<SpotifyTrack[]>(() =>
    loadStorage(STORAGE_KEYS.SPOTIFY, INITIAL_SPOTIFY_TRACKS)
  );
  const [activeSpotifyId, setActiveSpotifyId] = useState<string>(
    INITIAL_SPOTIFY_TRACKS[0].id
  );

  const [chats, setChats] = useState<WhatsAppChat[]>(() =>
    loadStorage(STORAGE_KEYS.WHATSAPP, INITIAL_WHATSAPP_CHATS)
  );

  const [igPosts, setIgPosts] = useState<InstagramPost[]>(() =>
    loadStorage(STORAGE_KEYS.INSTAGRAM_POSTS, INITIAL_INSTAGRAM_POSTS)
  );
  const [igStories, setIgStories] = useState<InstagramStory[]>(INITIAL_INSTAGRAM_STORIES);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (prefs.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.FS, JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.SPOTIFY, JSON.stringify(spotifyTracks));
  }, [spotifyTracks]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.WHATSAPP, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.INSTAGRAM_POSTS, JSON.stringify(igPosts));
  }, [igPosts]);

  // Spotlight keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (powerPhase === 'desktop') {
          setSpotlightOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [powerPhase]);

  const launchApp = useCallback(
    (appId: AppId, payload?: WindowState['payload'], customTitle?: string) => {
      setWindows((prev) => openOrFocusWindow(prev, appId, payload, customTitle));
    },
    []
  );

  const openFileNode = useCallback(
    (node: FSNode) => {
      switch (node.kind) {
        case 'folder':
          launchApp('finder', { folderId: node.id });
          break;
        case 'note':
          launchApp('notes', { noteId: node.id });
          break;
        case 'photo':
          launchApp('photos', { photoId: node.id });
          break;
        case 'audio':
          launchApp('audio', { audioId: node.id });
          break;
        case 'zip':
          launchApp('archive', { zipNodeId: node.id });
          break;
      }
    },
    [launchApp]
  );

  const handleCreateFolder = useCallback((parentId: string, name: string) => {
    setNodes((prev) => createFolder(prev, parentId, name).nodes);
  }, []);

  const handleCreateNote = useCallback(() => {
    const res = createNoteNode(
      nodes,
      ROOT_IDS.DOCUMENTS,
      `Nota ${nodes.filter((n) => n.kind === 'note').length + 1}`,
      ''
    );
    setNodes(res.nodes);
    launchApp('notes', { noteId: res.created.id });
  }, [nodes, launchApp]);

  const handleUpdateNote = useCallback(
    (noteId: string, patch: Partial<Pick<FSNode, 'name' | 'content' | 'pinned'>>) => {
      setNodes((prev) => updateNoteNode(prev, noteId, patch));
    },
    []
  );

  const handleDeleteNote = useCallback((noteId: string) => {
    setNodes((prev) => moveToTrash(prev, noteId));
  }, []);

  const handleTogglePhotoFav = useCallback((photoId: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === photoId ? { ...n, favorite: !n.favorite } : n))
    );
  }, []);

  const handleAddVoiceMemo = useCallback((name: string, durationSec: number) => {
    const newMemo: FSNode = {
      id: `audio-${Date.now()}`,
      name,
      kind: 'audio',
      parentId: ROOT_IDS.MUSIC,
      sizeBytes: durationSec * 64000,
      updatedAt: 'Ahora mismo',
      durationSec,
      audioPreset: 'voice',
    };
    setNodes((prev) => [...prev, newMemo]);
  }, []);

  const handleExtractZip = useCallback(
    (zipId: string) => {
      const result = extractZipArchive(nodes, zipId);
      setNodes(result.nodes);
      return {
        targetFolderId: result.targetFolderId,
        extractedCount: result.extractedCount,
      };
    },
    [nodes]
  );

  const handleCompressFolder = useCallback((folderId: string) => {
    setNodes((prev) => compressFolderToZip(prev, folderId).nodes);
  }, []);

  const handleSendWhatsApp = useCallback((chatId: string, text: string) => {
    const nowTime = new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const myMsgId = `msg-${Date.now()}`;
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              unread: 0,
              messages: [
                ...c.messages,
                { id: myMsgId, sender: 'me', kind: 'text', text, time: nowTime },
              ],
            }
          : c
      )
    );

    // Simulated natural reply after short delay
    window.setTimeout(() => {
      const replyTime = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const replyText =
        text.toLowerCase().includes('zip') || text.toLowerCase().includes('archivo')
          ? 'Perfecto! Me cuentas qué tal quedaron los archivos descomprimidos.'
          : 'Recibido! Gracias por avisarme, hablamos en un rato.';
      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: `reply-${Date.now()}`,
                    sender: 'them',
                    kind: 'text',
                    text: replyText,
                    time: replyTime,
                  },
                ],
              }
            : c
        )
      );
    }, 900);
  }, []);

  const activeWindow = windows
    .filter((w) => !w.isMinimized)
    .sort((a, b) => b.zIndex - a.zIndex)[0];
  const activeAppTitle = activeWindow
    ? APP_DEFAULT_CONFIG[activeWindow.appId].title
    : 'Finder';

  const desktopItems = getChildren(nodes, ROOT_IDS.DESKTOP);
  const allNotes = nodes.filter((n) => n.kind === 'note' && !n.isTrashed);
  const allPhotos = nodes.filter((n) => n.kind === 'photo' && !n.isTrashed);
  const allAudios = nodes.filter((n) => n.kind === 'audio' && !n.isTrashed);
  const allZips = nodes.filter((n) => n.kind === 'zip' && !n.isTrashed);
  const trashCount = nodes.filter((n) => n.isTrashed).length;

  return (
    <MacBookFrame brightness={prefs.brightness} powerPhase={powerPhase}>
      {powerPhase === 'boot' && (
        <BootScreen
          onComplete={() => {
            setAutoTypePassword(true);
            setPowerPhase('lock');
          }}
        />
      )}

      {powerPhase === 'lock' && (
        <LockScreen
          wallpaperUrl={prefs.wallpaperUrl}
          autoTypeOnMount={autoTypePassword}
          onUnlock={() => setPowerPhase('desktop')}
        />
      )}

      {powerPhase === 'desktop' && (
        <div
          className="relative flex h-full w-full flex-col overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${prefs.wallpaperUrl})` }}
          data-testid="macos-desktop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedDesktopId(null);
              setContextMenu(null);
            }
          }}
          onContextMenu={(e) => {
            if ((e.target as HTMLElement).closest('[role="dialog"]')) return;
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY });
          }}
        >
          <MenuBar
            activeAppTitle={activeAppTitle}
            isDark={prefs.isDark}
            onToggleDark={() => setPrefs((p) => ({ ...p, isDark: !p.isDark }))}
            brightness={prefs.brightness}
            onChangeBrightness={(v) => setPrefs((p) => ({ ...p, brightness: v }))}
            volume={prefs.volume}
            onChangeVolume={(v) => {
              setPrefs((p) => ({ ...p, volume: v }));
              macAudioSynth.setVolume(v);
            }}
            wifiOn={prefs.wifiOn}
            onToggleWifi={() => setPrefs((p) => ({ ...p, wifiOn: !p.wifiOn }))}
            onOpenSpotlight={() => setSpotlightOpen(true)}
            onOpenApp={(appId) => launchApp(appId)}
            onCreateDesktopFolder={() => handleCreateFolder(ROOT_IDS.DESKTOP, 'Nueva carpeta')}
            onLockScreen={() => {
              macAudioSynth.stop();
              setAutoTypePassword(false);
              setPowerPhase('lock');
            }}
            onRestartMac={() => {
              macAudioSynth.stop();
              setWindows([]);
              setAutoTypePassword(true);
              setPowerPhase('boot');
            }}
          />

          {/* Interactive Desktop Workspace */}
          <main
            className="relative flex-1 overflow-hidden p-4"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedDesktopId(null);
                setContextMenu(null);
              }
            }}
          >
            {/* Desktop Icons Grid */}
            <div className="flex flex-col flex-wrap content-start gap-2 max-h-[calc(100%-84px)] w-fit">
              {desktopItems.map((item) => {
                const isSelected = selectedDesktopId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedDesktopId(item.id)}
                    onDoubleClick={() => openFileNode(item)}
                    aria-label={`Escritorio: ${item.name}`}
                    className={`flex w-28 flex-col items-center gap-1 rounded-xl p-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      isSelected
                        ? 'bg-white/25 ring-1 ring-white/50 backdrop-blur-md'
                        : 'hover:bg-white/15'
                    }`}
                  >
                    {item.kind === 'photo' && item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="h-11 w-14 rounded-md object-cover shadow-md ring-1 ring-white/40"
                      />
                    ) : (
                      <FileKindIcon kind={item.kind} className="h-11 w-11 drop-shadow-md" />
                    )}
                    <span className="line-clamp-2 w-full [overflow-wrap:anywhere] rounded px-1 text-[11px] font-medium leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Windows */}
            {windows.map((win) => (
              <DesktopWindow
                key={win.id}
                win={win}
                isActive={activeWindow?.id === win.id}
                onFocus={(id) => setWindows((prev) => focusWindow(prev, id))}
                onClose={(id) => setWindows((prev) => closeWindow(prev, id))}
                onMinimize={(id) => setWindows((prev) => minimizeWindow(prev, id))}
                onToggleMaximize={(id) =>
                  setWindows((prev) => toggleMaximizeWindow(prev, id))
                }
                onMove={(id, x, y) =>
                  setWindows((prev) => moveWindow(prev, id, x, y, 1400, 860))
                }
              >
                {win.appId === 'finder' && (
                  <FinderApp
                    nodes={nodes}
                    currentFolderId={win.payload?.folderId ?? ROOT_IDS.DESKTOP}
                    onNavigateFolder={(folderId) =>
                      setWindows((prev) =>
                        prev.map((w) =>
                          w.id === win.id
                            ? { ...w, payload: { ...w.payload, folderId } }
                            : w
                        )
                      )
                    }
                    onOpenFileNode={openFileNode}
                    onCreateFolder={handleCreateFolder}
                    onRenameNode={(nodeId, newName) =>
                      setNodes((prev) => renameNode(prev, nodeId, newName))
                    }
                    onTrashNode={(nodeId) => setNodes((prev) => moveToTrash(prev, nodeId))}
                    onRestoreNode={(nodeId) =>
                      setNodes((prev) => restoreFromTrash(prev, nodeId))
                    }
                    onEmptyTrash={() => setNodes((prev) => emptyTrash(prev))}
                    onCompressFolder={handleCompressFolder}
                  />
                )}

                {win.appId === 'notes' && (
                  <NotesApp
                    notes={allNotes}
                    selectedNoteId={win.payload?.noteId}
                    onSelectNote={(noteId) =>
                      setWindows((prev) =>
                        prev.map((w) =>
                          w.id === win.id ? { ...w, payload: { ...w.payload, noteId } } : w
                        )
                      )
                    }
                    onCreateNote={handleCreateNote}
                    onUpdateNote={handleUpdateNote}
                    onDeleteNote={handleDeleteNote}
                  />
                )}

                {win.appId === 'photos' && (
                  <PhotosApp
                    photos={allPhotos}
                    initialPhotoId={win.payload?.photoId}
                    onToggleFavorite={handleTogglePhotoFav}
                    onSetWallpaper={(imageUrl) =>
                      setPrefs((p) => ({ ...p, wallpaperUrl: imageUrl }))
                    }
                  />
                )}

                {win.appId === 'audio' && (
                  <AudioApp
                    audios={allAudios}
                    selectedAudioId={win.payload?.audioId}
                    systemVolume={prefs.volume}
                    onAddVoiceMemo={handleAddVoiceMemo}
                  />
                )}

                {win.appId === 'archive' && (
                  <ArchiveApp
                    zipFiles={allZips}
                    selectedZipId={win.payload?.zipNodeId}
                    onSelectZip={(zipNodeId) =>
                      setWindows((prev) =>
                        prev.map((w) =>
                          w.id === win.id
                            ? { ...w, payload: { ...w.payload, zipNodeId } }
                            : w
                        )
                      )
                    }
                    onExtractZip={handleExtractZip}
                    onOpenFolderInFinder={(folderId) => launchApp('finder', { folderId })}
                  />
                )}

                {win.appId === 'spotify' && (
                  <SpotifyApp
                    tracks={spotifyTracks}
                    activeTrackId={activeSpotifyId}
                    onSelectTrack={setActiveSpotifyId}
                    onToggleLike={(trackId) =>
                      setSpotifyTracks((prev) =>
                        prev.map((t) =>
                          t.id === trackId ? { ...t, liked: !t.liked } : t
                        )
                      )
                    }
                    systemVolume={prefs.volume}
                  />
                )}

                {win.appId === 'whatsapp' && (
                  <WhatsAppApp
                    chats={chats}
                    onSendMessage={handleSendWhatsApp}
                    onMarkRead={(chatId) =>
                      setChats((prev) =>
                        prev.map((c) => (c.id === chatId ? { ...c, unread: 0 } : c))
                      )
                    }
                    systemVolume={prefs.volume}
                  />
                )}

                {win.appId === 'instagram' && (
                  <InstagramApp
                    posts={igPosts}
                    stories={igStories}
                    onToggleLike={(postId) =>
                      setIgPosts((prev) =>
                        prev.map((p) =>
                          p.id === postId
                            ? {
                                ...p,
                                liked: !p.liked,
                                likes: p.liked ? p.likes - 1 : p.likes + 1,
                              }
                            : p
                        )
                      )
                    }
                    onToggleSave={(postId) =>
                      setIgPosts((prev) =>
                        prev.map((p) =>
                          p.id === postId ? { ...p, saved: !p.saved } : p
                        )
                      )
                    }
                    onAddComment={(postId, text) =>
                      setIgPosts((prev) =>
                        prev.map((p) =>
                          p.id === postId
                            ? {
                                ...p,
                                comments: [
                                  ...p.comments,
                                  {
                                    id: `c-${Date.now()}`,
                                    author: 'sofia.atelier',
                                    text,
                                  },
                                ],
                              }
                            : p
                        )
                      )
                    }
                    onMarkStoryViewed={(storyId) =>
                      setIgStories((prev) =>
                        prev.map((s) =>
                          s.id === storyId ? { ...s, viewed: true } : s
                        )
                      )
                    }
                  />
                )}

                {win.appId === 'about' && <AboutMacModal nodes={nodes} />}
              </DesktopWindow>
            ))}

            {/* Desktop Context Menu */}
            {contextMenu && (
              <div
                style={{ left: contextMenu.x, top: contextMenu.y }}
                className="fixed z-50 w-52 rounded-xl border border-black/15 bg-white/90 p-1.5 shadow-2xl backdrop-blur-2xl dark:border-white/15 dark:bg-neutral-800/95"
              >
                <button
                  type="button"
                  onClick={() => {
                    handleCreateFolder(ROOT_IDS.DESKTOP, 'Nueva carpeta');
                    setContextMenu(null);
                  }}
                  className="flex w-full rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-sky-500 hover:text-white"
                >
                  Nueva carpeta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCreateNote();
                    setContextMenu(null);
                  }}
                  className="flex w-full rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-sky-500 hover:text-white"
                >
                  Nueva nota
                </button>
                <button
                  type="button"
                  onClick={() => {
                    launchApp('finder', { folderId: ROOT_IDS.DESKTOP });
                    setContextMenu(null);
                  }}
                  className="flex w-full rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-sky-500 hover:text-white"
                >
                  Abrir Finder
                </button>
                <div className="my-1 h-px bg-black/10 dark:bg-white/10" />
                <button
                  type="button"
                  onClick={() => {
                    setPrefs((p) => ({ ...p, isDark: !p.isDark }));
                    setContextMenu(null);
                  }}
                  className="flex w-full rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-sky-500 hover:text-white"
                >
                  Cambiar a {prefs.isDark ? 'modo claro' : 'modo oscuro'}
                </button>
              </div>
            )}
          </main>

          <Dock
            windows={windows}
            onLaunchApp={(appId, payload) => launchApp(appId, payload)}
            onOpenTrash={() => launchApp('finder', { folderId: ROOT_IDS.TRASH })}
            trashCount={trashCount}
          />

          <SpotlightModal
            isOpen={spotlightOpen}
            onClose={() => setSpotlightOpen(false)}
            nodes={nodes}
            spotifyTracks={spotifyTracks}
            onOpenApp={(appId) => launchApp(appId)}
            onOpenFileNode={openFileNode}
            onPlaySpotifyTrack={(trackId) => {
              setActiveSpotifyId(trackId);
              launchApp('spotify');
            }}
          />
        </div>
      )}
    </MacBookFrame>
  );
}
