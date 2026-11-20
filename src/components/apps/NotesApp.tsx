import React, { useState } from 'react';
import { CheckSquare, List, Pin, Plus, Search, Trash2 } from 'lucide-react';
import type { FSNode } from '../../os/types';

interface NotesAppProps {
  notes: FSNode[];
  selectedNoteId?: string;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
  onUpdateNote: (noteId: string, patch: Partial<Pick<FSNode, 'name' | 'content' | 'pinned'>>) => void;
  onDeleteNote: (noteId: string) => void;
}

export const NotesApp: React.FC<NotesAppProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [search, setSearch] = useState('');

  const filtered = notes
    .filter((n) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        n.name.toLowerCase().includes(q) ||
        (n.content ?? '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));

  const activeNote =
    filtered.find((n) => n.id === selectedNoteId) ?? filtered[0] ?? null;

  const content = activeNote?.content ?? '';
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const checklistLines = content
    .split('\n')
    .map((line, idx) => ({ line, idx }))
    .filter(({ line }) => line.startsWith('- [ ] ') || line.startsWith('- [x] '));

  const toggleChecklistLine = (lineIdx: number) => {
    if (!activeNote) return;
    const lines = content.split('\n');
    const target = lines[lineIdx];
    if (target.startsWith('- [ ] ')) {
      lines[lineIdx] = target.replace('- [ ] ', '- [x] ');
    } else if (target.startsWith('- [x] ')) {
      lines[lineIdx] = target.replace('- [x] ', '- [ ] ');
    }
    onUpdateNote(activeNote.id, { content: lines.join('\n') });
  };

  const appendSnippet = (snippet: string) => {
    if (!activeNote) return;
    const next = content.endsWith('\n') || !content ? `${content}${snippet}` : `${content}\n${snippet}`;
    onUpdateNote(activeNote.id, { content: next });
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar List */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-black/8 bg-neutral-50 dark:border-white/10 dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-black/8 px-3 py-2.5 dark:border-white/10">
          <span className="text-xs font-semibold">Todas las notas ({notes.length})</span>
          <button
            type="button"
            onClick={onCreateNote}
            aria-label="Crear nueva nota"
            className="flex items-center gap-1 rounded-lg bg-amber-400 px-2 py-1 text-xs font-semibold text-neutral-900 hover:bg-amber-500"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nueva</span>
          </button>
        </div>

        <div className="p-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar notas…"
              aria-label="Buscar en Notas"
              className="w-full rounded-lg border border-black/10 bg-white py-1.5 pl-8 pr-2 text-xs focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-neutral-800"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1 mac-scrollbar">
          {filtered.map((note) => {
            const isActive = activeNote?.id === note.id;
            const preview = (note.content ?? '').split('\n').find((l) => l.trim()) ?? 'Nota vacía';
            return (
              <button
                key={note.id}
                type="button"
                onClick={() => onSelectNote(note.id)}
                className={`w-full rounded-xl p-2.5 text-left transition-colors ${
                  isActive
                    ? 'bg-amber-400/25 text-neutral-900 dark:bg-amber-500/20 dark:text-white'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate text-xs font-semibold">
                    {note.name.replace(/\.txt$/i, '')}
                  </p>
                  {note.pinned && <Pin className="h-3 w-3 shrink-0 text-amber-500" />}
                </div>
                <p className="mt-0.5 truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                  {preview}
                </p>
                <p className="mt-1 text-[10px] text-neutral-400">{note.updatedAt}</p>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-xs text-neutral-400">Sin notas coincidentes</p>
          )}
        </div>
      </aside>

      {/* Editor */}
      <div className="flex min-w-0 flex-1 flex-col bg-white dark:bg-neutral-950">
        {activeNote ? (
          <>
            <div className="flex items-center justify-between border-b border-black/8 px-4 py-2 dark:border-white/10">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => appendSnippet('- [ ] Nueva tarea')}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <CheckSquare className="h-3.5 w-3.5 text-amber-500" />
                  <span>Checklist</span>
                </button>
                <button
                  type="button"
                  onClick={() => appendSnippet('- Elemento de lista')}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <List className="h-3.5 w-3.5 text-neutral-500" />
                  <span>Lista</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-neutral-400 tabular-nums mr-2">
                  {wordCount} palabras
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateNote(activeNote.id, { pinned: !activeNote.pinned })}
                  aria-label={activeNote.pinned ? 'Desfijar nota' : 'Fijar nota'}
                  className={`rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/10 ${
                    activeNote.pinned ? 'text-amber-500' : 'text-neutral-400'
                  }`}
                >
                  <Pin className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteNote(activeNote.id)}
                  aria-label={`Eliminar nota ${activeNote.name}`}
                  className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto p-5 mac-scrollbar">
              <input
                type="text"
                value={activeNote.name.replace(/\.txt$/i, '')}
                onChange={(e) =>
                  onUpdateNote(activeNote.id, {
                    name: `${e.target.value || 'Sin título'}.txt`,
                  })
                }
                aria-label="Título de la nota"
                className="mb-3 bg-transparent text-xl font-bold tracking-tight focus:outline-none"
              />

              {checklistLines.length > 0 && (
                <div className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 dark:border-amber-500/20 dark:bg-amber-950/20">
                  <p className="mb-2 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                    Tareas interactivas
                  </p>
                  <div className="space-y-1.5">
                    {checklistLines.map(({ line, idx }) => {
                      const checked = line.startsWith('- [x] ');
                      const text = line.slice(6);
                      return (
                        <label
                          key={idx}
                          className="flex cursor-pointer items-center gap-2 text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleChecklistLine(idx)}
                            className="h-3.5 w-3.5 accent-amber-500 rounded"
                          />
                          <span className={checked ? 'line-through text-neutral-400' : ''}>
                            {text}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <textarea
                value={content}
                onChange={(e) => onUpdateNote(activeNote.id, { content: e.target.value })}
                aria-label="Contenido de la nota"
                placeholder="Escribe aquí tu nota…"
                className="min-h-[240px] flex-1 resize-none bg-transparent text-sm leading-relaxed focus:outline-none"
              />
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-neutral-400">
            <p className="text-sm">No hay ninguna nota seleccionada</p>
            <button
              type="button"
              onClick={onCreateNote}
              className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-neutral-900"
            >
              Crear primera nota
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
