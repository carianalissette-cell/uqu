import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ROOT_IDS,
  createInitialFileSystem,
  getChildren,
  createFolder,
  renameNode,
  moveToTrash,
  restoreFromTrash,
  extractZipArchive,
  compressFolderToZip,
  searchNodes,
} from './filesystem';
import {
  openOrFocusWindow,
  minimizeWindow,
  toggleMaximizeWindow,
  closeWindow,
  moveWindow,
} from './windowManager';

test('filesystem initializes standard macOS folders and desktop items', () => {
  const fs = createInitialFileSystem();
  const desktopItems = getChildren(fs, ROOT_IDS.DESKTOP);
  assert.ok(desktopItems.some((item) => item.kind === 'folder'));
  assert.ok(desktopItems.some((item) => item.kind === 'zip'));
  assert.ok(desktopItems.some((item) => item.kind === 'note'));
});

test('createFolder avoids duplicate names and persists inside parent', () => {
  let fs = createInitialFileSystem();
  const first = createFolder(fs, ROOT_IDS.DESKTOP, 'Ideas');
  fs = first.nodes;
  const second = createFolder(fs, ROOT_IDS.DESKTOP, 'Ideas');
  fs = second.nodes;

  assert.equal(first.created.name, 'Ideas');
  assert.equal(second.created.name, 'Ideas 2');
  assert.equal(
    getChildren(fs, ROOT_IDS.DESKTOP).filter((n) => n.id === first.created.id || n.id === second.created.id).length,
    2
  );
});

test('moveToTrash and restoreFromTrash roundtrip non-system items', () => {
  let fs = createInitialFileSystem();
  const created = createFolder(fs, ROOT_IDS.DOCUMENTS, 'Temporal');
  fs = created.nodes;

  fs = moveToTrash(fs, created.created.id);
  assert.equal(getChildren(fs, ROOT_IDS.DOCUMENTS).some((n) => n.id === created.created.id), false);
  assert.equal(getChildren(fs, ROOT_IDS.TRASH).some((n) => n.id === created.created.id), true);

  fs = restoreFromTrash(fs, created.created.id);
  assert.equal(getChildren(fs, ROOT_IDS.DOCUMENTS).some((n) => n.id === created.created.id), true);
  assert.equal(getChildren(fs, ROOT_IDS.TRASH).some((n) => n.id === created.created.id), false);
});

test('extractZipArchive unpacks nested folders and files into parent directory', () => {
  const fs = createInitialFileSystem();
  const result = extractZipArchive(fs, 'zip-proyecto-diseno');
  assert.ok(result.targetFolderId !== null);
  assert.ok(result.extractedCount >= 3);

  const downloadsChildren = getChildren(result.nodes, ROOT_IDS.DOWNLOADS);
  const extractedRoot = downloadsChildren.find((n) => n.id === result.targetFolderId);
  assert.ok(extractedRoot);
  assert.equal(extractedRoot.name, 'Proyecto_Diseno');

  const inner = getChildren(result.nodes, extractedRoot.id);
  assert.ok(inner.some((n) => n.name === 'Identidad Visual' && n.kind === 'folder'));
});

test('compressFolderToZip creates a valid .zip archive with entries', () => {
  const fs = createInitialFileSystem();
  const result = compressFolderToZip(fs, 'folder-proyectos');
  assert.ok(result.createdZip);
  assert.equal(result.createdZip.kind, 'zip');
  assert.equal(result.createdZip.name, 'Proyectos Creativos.zip');
  assert.ok((result.createdZip.zipEntries?.length ?? 0) >= 2);
});

test('renameNode updates non-system file names and searchNodes finds them', () => {
  let fs = createInitialFileSystem();
  fs = renameNode(fs, 'note-bienvenida', 'Objetivos_Q4.txt');
  const found = searchNodes(fs, 'Objetivos_Q4');
  assert.equal(found.length, 1);
  assert.equal(found[0].id, 'note-bienvenida');
});

test('windowManager opens, focuses, minimizes, maximizes, moves and closes windows', () => {
  let wins = openOrFocusWindow([], 'finder');
  assert.equal(wins.length, 1);
  wins = openOrFocusWindow(wins, 'notes');
  assert.equal(wins.length, 2);

  const finderWin = wins.find((w) => w.appId === 'finder')!;
  const notesWin = wins.find((w) => w.appId === 'notes')!;
  assert.ok(notesWin.zIndex > finderWin.zIndex);

  wins = minimizeWindow(wins, notesWin.id);
  assert.equal(wins.find((w) => w.id === notesWin.id)?.isMinimized, true);

  wins = toggleMaximizeWindow(wins, finderWin.id);
  assert.equal(wins.find((w) => w.id === finderWin.id)?.isMaximized, true);

  wins = toggleMaximizeWindow(wins, finderWin.id);
  wins = moveWindow(wins, finderWin.id, 50, 10, 1400, 860);
  assert.equal(wins.find((w) => w.id === finderWin.id)?.y, 28); // clamped below menu bar

  wins = closeWindow(wins, notesWin.id);
  assert.equal(wins.length, 1);
});
