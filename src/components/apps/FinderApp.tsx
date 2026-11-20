import React, { useState } from 'react';
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Folder,
  FolderPlus,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Music,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import {
  ROOT_IDS,
  formatBytes,
  getBreadcrumbs,
  getChildren,
} from '../../os/filesystem';
import type { FSNode } from '../../os/types';
import { FileKindIcon } from '../os/AppGlyph';

interface FinderAppProps {
  nodes: FSNode[];
  currentFolderId: string;
  onNavigateFolder: (folderId: string) => void;
  onOpenFileNode: (node: FSNode) => void;
  onCreateFolder: (parentId: string, name: string) => void;
  onRenameNode: (nodeId: string, newName: string) => void;
  onTrashNode: (nodeId: string) => void;
  onRestoreNode: (nodeId: string) => void;
  onEmptyTrash: () => void;
  onCompressFolder: (folderId: string) => void;
}

const SIDEBAR_ITEMS: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: 'recents', label: 'Recientes', icon: <Clock className="h-4 w-4 text-sky-500" /> },
  { id: ROOT_IDS.DESKTOP, label: 'Escritorio', icon: <Folder className="h-4 w-4 text-sky-500" /> },
  { id: ROOT_IDS.DOCUMENTS, label: 'Documentos', icon: <FileText className="h-4 w-4 text-sky-500" /> },
  { id: ROOT_IDS.DOWNLOADS, label: 'Descargas', icon: <Download className="h-4 w-4 text-sky-500" /> },
  { id: ROOT_IDS.PICTURES, label: 'Imágenes', icon: <ImageIcon className="h-4 w-4 text-sky-500" /> },
  { id: ROOT_IDS.MUSIC, label: 'Música', icon: <Music className="h-4 w-4 text-sky-500" /> },
  { id: ROOT_IDS.TRASH, label: 'Papelera', icon: <Trash2 className="h-4 w-4 text-neutral-500" /> },
];

export const FinderApp: React.FC<FinderAppProps> = ({
  nodes,
  currentFolderId,
  onNavigateFolder,
  onOpenFileNode,
  onCreateFolder,
  onRenameNode,
  onTrashNode,
  onRestoreNode,
  onEmptyTrash,
  onCompressFolder,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([currentFolderId]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const navigate = (folderId: string) => {
    setSelectedId(null);
    setRenamingId(null);
    const nextHistory = [...history.slice(0, historyIndex + 1), folderId];
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    onNavigateFolder(folderId);
  };

  const canBack = historyIndex > 0;
  const canForward = historyIndex < history.length - 1;

  const goBack = () => {
    if (!canBack) return;
    const nextIdx = historyIndex - 1;
    setHistoryIndex(nextIdx);
    onNavigateFolder(history[nextIdx]);
  };

  const goForward = () => {
    if (!canForward) return;
    const nextIdx = historyIndex + 1;
    setHistoryIndex(nextIdx);
    onNavigateFolder(history[nextIdx]);
  };

  const rawItems: FSNode[] =
    currentFolderId === 'recents'
      ? nodes.filter((n) => !n.isSystem && !n.isTrashed)
      : getChildren(nodes, currentFolderId);

  const items = search.trim()
    ? rawItems.filter((n) => n.name.toLowerCase().includes(search.trim().toLowerCase()))
    : rawItems;

  const breadcrumbs =
    currentFolderId === 'recents'
      ? [{ id: 'recents', name: 'Recientes' }]
      : getBreadcrumbs(nodes, currentFolderId);

  const selectedNode = items.find((i) => i.id === selectedId) ?? null;
  const isTrashView = currentFolderId === ROOT_IDS.TRASH;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetParent = currentFolderId === 'recents' || isTrashView ? ROOT_IDS.DESKTOP : currentFolderId;
    onCreateFolder(targetParent, newFolderName || 'Nueva carpeta');
    setNewFolderName('');
    setCreatingFolder(false);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingId && renameValue.trim()) {
      onRenameNode(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  return (
    <div className="flex h-full w-full overflow-hidden text-sm">
      {/* Sidebar */}
      <aside className="w-44 shrink-0 border-r border-black/8 bg-neutral-100/75 p-2.5 dark:border-white/10 dark:bg-neutral-900/60">
        <p className="px-2 pb-1.5 text-[11px] font-semibold text-neutral-500">Favoritos</p>
        <nav aria-label="Ubicaciones de Finder" className="space-y-0.5">
          {SIDEBAR_ITEMS.map((item) => {
            const active = currentFolderId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-colors ${
                  active
                    ? 'bg-sky-500/15 text-sky-700 dark:bg-sky-500/25 dark:text-sky-300'
                    : 'text-neutral-700 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/10'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col bg-white dark:bg-neutral-950">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/8 px-3 py-2 dark:border-white/10">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={goBack}
              disabled={!canBack}
              aria-label="Carpeta anterior"
              className="rounded-md p-1 hover:bg-black/5 disabled:opacity-35 dark:hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goForward}
              disabled={!canForward}
              aria-label="Carpeta siguiente"
              className="rounded-md p-1 hover:bg-black/5 disabled:opacity-35 dark:hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="ml-1 flex items-center gap-1 text-xs font-semibold">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.id}>
                  {idx > 0 && <span className="text-neutral-400">/</span>}
                  <button
                    type="button"
                    onClick={() => navigate(crumb.id)}
                    className="rounded px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 whitespace-nowrap"
                  >
                    {crumb.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {!isTrashView && (
              <button
                type="button"
                onClick={() => {
                  setCreatingFolder(true);
                  setNewFolderName('');
                }}
                className="flex items-center gap-1 rounded-lg border border-black/10 px-2.5 py-1 text-xs font-medium hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10 whitespace-nowrap"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                <span>Nueva carpeta</span>
              </button>
            )}

            {isTrashView && items.length > 0 && (
              <button
                type="button"
                onClick={onEmptyTrash}
                className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-600 whitespace-nowrap"
              >
                Vaciar papelera
              </button>
            )}

            <div className="flex items-center rounded-lg bg-neutral-100 p-0.5 dark:bg-neutral-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Vista en cuadrícula"
                className={`rounded-md p-1 ${
                  viewMode === 'grid' ? 'bg-white shadow-sm dark:bg-neutral-700' : 'text-neutral-500'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="Vista en lista"
                className={`rounded-md p-1 ${
                  viewMode === 'list' ? 'bg-white shadow-sm dark:bg-neutral-700' : 'text-neutral-500'
                }`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar"
                aria-label="Buscar en Finder"
                className="w-32 rounded-lg border border-black/10 bg-neutral-50 py-1 pl-7 pr-2 text-xs focus:border-sky-500 focus:outline-none dark:border-white/15 dark:bg-neutral-900"
              />
            </div>
          </div>
        </div>

        {/* Inline New Folder Creation Bar */}
        {creatingFolder && (
          <form
            onSubmit={handleCreateSubmit}
            className="flex items-center gap-2 border-b border-black/8 bg-sky-50/80 px-4 py-2 dark:border-white/10 dark:bg-sky-950/30"
          >
            <Folder className="h-4 w-4 text-sky-500" />
            <input
              type="text"
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nombre de la nueva carpeta"
              aria-label="Nombre de la nueva carpeta"
              className="flex-1 rounded-md border border-sky-300 bg-white px-2.5 py-1 text-xs focus:outline-none dark:border-sky-700 dark:bg-neutral-900"
            />
            <button
              type="submit"
              className="rounded-md bg-sky-600 px-3 py-1 text-xs font-medium text-white hover:bg-sky-700"
            >
              Crear
            </button>
            <button
              type="button"
              onClick={() => setCreatingFolder(false)}
              className="rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-black/5"
            >
              Cancelar
            </button>
          </form>
        )}

        {/* Action Bar for Selected Item */}
        {selectedNode && (
          <div className="flex items-center justify-between border-b border-black/8 bg-neutral-50 px-4 py-1.5 text-xs dark:border-white/10 dark:bg-neutral-900/70">
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold truncate">{selectedNode.name}</span>
              <span className="text-neutral-500 tabular-nums">
                · {formatBytes(selectedNode.sizeBytes)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {!isTrashView && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedNode.kind === 'folder') {
                        navigate(selectedNode.id);
                      } else {
                        onOpenFileNode(selectedNode);
                      }
                    }}
                    className="rounded-md bg-sky-600 px-2.5 py-1 font-medium text-white hover:bg-sky-700"
                  >
                    Abrir
                  </button>
                  {selectedNode.kind === 'folder' && !selectedNode.isSystem && (
                    <button
                      type="button"
                      onClick={() => onCompressFolder(selectedNode.id)}
                      className="flex items-center gap-1 rounded-md border border-black/10 px-2 py-1 hover:bg-black/5 dark:border-white/15"
                    >
                      <Archive className="h-3 w-3" />
                      <span>Comprimir .zip</span>
                    </button>
                  )}
                  {!selectedNode.isSystem && (
                    <button
                      type="button"
                      onClick={() => {
                        setRenamingId(selectedNode.id);
                        setRenameValue(selectedNode.name);
                      }}
                      aria-label={`Renombrar ${selectedNode.name}`}
                      className="rounded-md border border-black/10 p-1 hover:bg-black/5 dark:border-white/15"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  )}
                  {!selectedNode.isSystem && (
                    <button
                      type="button"
                      onClick={() => {
                        onTrashNode(selectedNode.id);
                        setSelectedId(null);
                      }}
                      aria-label={`Mover ${selectedNode.name} a la Papelera`}
                      className="rounded-md border border-black/10 p-1 text-red-600 hover:bg-red-50 dark:border-white/15 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </>
              )}

              {isTrashView && (
                <button
                  type="button"
                  onClick={() => {
                    onRestoreNode(selectedNode.id);
                    setSelectedId(null);
                  }}
                  className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 font-medium text-white hover:bg-emerald-700"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Restaurar</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Files Area */}
        <div className="flex-1 overflow-y-auto p-4 mac-scrollbar">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-neutral-400">
              <Folder className="mb-2 h-10 w-10 opacity-40" />
              <p className="text-xs font-medium">
                {isTrashView ? 'La papelera está vacía' : 'Esta carpeta está vacía'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {items.map((node) => {
                const isSelected = selectedId === node.id;
                return (
                  <div key={node.id} className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => setSelectedId(node.id)}
                      onDoubleClick={() => {
                        if (isTrashView) return;
                        if (node.kind === 'folder') {
                          navigate(node.id);
                        } else {
                          onOpenFileNode(node);
                        }
                      }}
                      className={`flex w-full flex-col items-center gap-1.5 rounded-xl p-2.5 text-center transition-colors ${
                        isSelected
                          ? 'bg-sky-500/15 ring-1 ring-sky-500/50'
                          : 'hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {node.kind === 'photo' && node.imageUrl ? (
                        <img
                          src={node.imageUrl}
                          alt={node.name}
                          referrerPolicy="no-referrer"
                          className="h-12 w-14 rounded-md object-cover shadow-sm"
                        />
                      ) : (
                        <FileKindIcon kind={node.kind} className="h-11 w-11" />
                      )}
                      {renamingId === node.id ? (
                        <form onSubmit={handleRenameSubmit} className="w-full" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={handleRenameSubmit}
                            className="w-full rounded border border-sky-500 bg-white px-1 text-center text-[11px] dark:bg-neutral-900"
                          />
                        </form>
                      ) : (
                        <span className="w-full truncate text-xs font-medium">{node.name}</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/8 text-[11px] text-neutral-500 dark:border-white/10">
                  <th className="pb-2 font-medium">Nombre</th>
                  <th className="pb-2 font-medium">Modificado</th>
                  <th className="pb-2 text-right font-medium">Tamaño</th>
                </tr>
              </thead>
              <tbody>
                {items.map((node) => {
                  const isSelected = selectedId === node.id;
                  return (
                    <tr
                      key={node.id}
                      className={`border-b border-black/5 dark:border-white/5 ${
                        isSelected ? 'bg-sky-500/15' : 'hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <td className="py-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedId(node.id)}
                          onDoubleClick={() => {
                            if (isTrashView) return;
                            if (node.kind === 'folder') navigate(node.id);
                            else onOpenFileNode(node);
                          }}
                          className="flex w-full items-center gap-2 text-left font-medium"
                        >
                          <FileKindIcon kind={node.kind} className="h-5 w-5 shrink-0" />
                          <span className="truncate">{node.name}</span>
                        </button>
                      </td>
                      <td className="py-1.5 text-neutral-500">{node.updatedAt}</td>
                      <td className="py-1.5 text-right text-neutral-500 tabular-nums">
                        {formatBytes(node.sizeBytes)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
