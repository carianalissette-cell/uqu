import { MAC_ASSETS } from './assets';
import type { FSNode, ZipEntryItem } from './types';

export const ROOT_IDS = {
  ROOT: 'root',
  DESKTOP: 'folder-desktop',
  DOCUMENTS: 'folder-documents',
  DOWNLOADS: 'folder-downloads',
  PICTURES: 'folder-pictures',
  MUSIC: 'folder-music',
  TRASH: 'folder-trash',
} as const;

export function createInitialFileSystem(): FSNode[] {
  const now = '19 nov 2026';

  return [
    {
      id: ROOT_IDS.DESKTOP,
      name: 'Escritorio',
      kind: 'folder',
      parentId: ROOT_IDS.ROOT,
      isSystem: true,
      sizeBytes: 0,
      updatedAt: now,
    },
    {
      id: ROOT_IDS.DOCUMENTS,
      name: 'Documentos',
      kind: 'folder',
      parentId: ROOT_IDS.ROOT,
      isSystem: true,
      sizeBytes: 0,
      updatedAt: now,
    },
    {
      id: ROOT_IDS.DOWNLOADS,
      name: 'Descargas',
      kind: 'folder',
      parentId: ROOT_IDS.ROOT,
      isSystem: true,
      sizeBytes: 0,
      updatedAt: now,
    },
    {
      id: ROOT_IDS.PICTURES,
      name: 'Imágenes',
      kind: 'folder',
      parentId: ROOT_IDS.ROOT,
      isSystem: true,
      sizeBytes: 0,
      updatedAt: now,
    },
    {
      id: ROOT_IDS.MUSIC,
      name: 'Música',
      kind: 'folder',
      parentId: ROOT_IDS.ROOT,
      isSystem: true,
      sizeBytes: 0,
      updatedAt: now,
    },
    {
      id: ROOT_IDS.TRASH,
      name: 'Papelera',
      kind: 'folder',
      parentId: ROOT_IDS.ROOT,
      isSystem: true,
      sizeBytes: 0,
      updatedAt: now,
    },

    // Desktop items
    {
      id: 'folder-proyectos',
      name: 'Proyectos Creativos',
      kind: 'folder',
      parentId: ROOT_IDS.DESKTOP,
      sizeBytes: 0,
      updatedAt: 'Hoy, 16:40',
    },
    {
      id: 'note-bienvenida',
      name: 'Lista del Día.txt',
      kind: 'note',
      parentId: ROOT_IDS.DESKTOP,
      sizeBytes: 1420,
      updatedAt: 'Hoy, 17:10',
      pinned: true,
      content: `Pendientes de la semana\n\n- [x] Revisar fotos del viaje a la costa\n- [ ] Editar audios del episodio 04\n- [ ] Descomprimir Proyecto_Diseno.zip en Descargas\n- [ ] Responder mensajes en WhatsApp\n\nIdeas clave:\nMantener una estética limpia, tipografía cuidada y sonidos suaves para el set de estudio.`,
    },
    {
      id: 'zip-vacaciones',
      name: 'Vacaciones_2026.zip',
      kind: 'zip',
      parentId: ROOT_IDS.DESKTOP,
      sizeBytes: 14820000,
      updatedAt: 'Ayer, 21:15',
      zipEntries: [
        {
          name: 'Costa Mediterránea',
          kind: 'folder',
          sizeBytes: 0,
          children: [
            {
              name: 'Acantilados_Atardecer.jpg',
              kind: 'photo',
              sizeBytes: 4820000,
              imageUrl: MAC_ASSETS.photoCoast,
            },
            {
              name: 'Diario_Viaje.txt',
              kind: 'note',
              sizeBytes: 980,
              content: 'Día 3 en la cala\n\nEl agua estaba completamente calma al caer el sol. Grabamos el sonido de las olas antes de cenar.',
            },
            {
              name: 'Brisa_Marina_Demo.m4a',
              kind: 'audio',
              sizeBytes: 3420000,
              durationSec: 42,
              audioPreset: 'ambient',
            },
          ],
        },
        {
          name: 'Itinerario_Final.txt',
          kind: 'note',
          sizeBytes: 640,
          content: 'Vuelo de regreso: Domingo 18:30.\nRecordar llevar copias de las tarjetas SD.',
        },
      ],
    },

    // Inside Proyectos Creativos
    {
      id: 'note-guion',
      name: 'Guion_Podcast_Ep04.txt',
      kind: 'note',
      parentId: 'folder-proyectos',
      sizeBytes: 2150,
      updatedAt: '18 nov 2026',
      content: 'Episodio 04: Diseño y calma digital\n\n1. Introducción con música lo-fi de fondo.\n2. Cómo organizar carpetas sin perder el foco.\n3. Cierre con nota de voz de oyentes.',
    },
    {
      id: 'photo-estudio-proj',
      name: 'Mesa_Analoga.jpg',
      kind: 'photo',
      parentId: 'folder-proyectos',
      sizeBytes: 3910000,
      updatedAt: '17 nov 2026',
      imageUrl: MAC_ASSETS.photoDesk,
      album: 'Estudio',
      dimensions: '4032 × 3024',
      camera: 'Leica M6 · 35mm f/2',
    },

    // Documents
    {
      id: 'folder-universidad',
      name: 'Apuntes & Lecturas',
      kind: 'folder',
      parentId: ROOT_IDS.DOCUMENTS,
      sizeBytes: 0,
      updatedAt: '15 nov 2026',
    },
    {
      id: 'note-recetas',
      name: 'Recetas Favoritas.txt',
      kind: 'note',
      parentId: ROOT_IDS.DOCUMENTS,
      sizeBytes: 1120,
      updatedAt: '14 nov 2026',
      content: 'Matcha Latte frío\n- 2g de matcha ceremonial\n- 60ml de agua a 75°C\n- Leche de avena fría con hielo\n\nTostada de masa madre\n- Aceite de oliva, tomate rallado y sal en escamas.',
    },
    {
      id: 'note-ideas-app',
      name: 'Ideas de Diseño.txt',
      kind: 'note',
      parentId: 'folder-universidad',
      sizeBytes: 1680,
      updatedAt: '12 nov 2026',
      pinned: true,
      content: 'Principios de interfaz\n\n- [x] Espaciado respirable\n- [x] Contraste claro y oscuro equilibrado\n- [ ] Revisar transiciones de ventanas',
    },

    // Downloads
    {
      id: 'zip-proyecto-diseno',
      name: 'Proyecto_Diseno.zip',
      kind: 'zip',
      parentId: ROOT_IDS.DOWNLOADS,
      sizeBytes: 9450000,
      updatedAt: 'Hoy, 11:20',
      zipEntries: [
        {
          name: 'Identidad Visual',
          kind: 'folder',
          sizeBytes: 0,
          children: [
            {
              name: 'Paleta_Atardecer.jpg',
              kind: 'photo',
              sizeBytes: 4120000,
              imageUrl: MAC_ASSETS.wallpaperDusk,
            },
            {
              name: 'Portada_Vinilo.jpg',
              kind: 'photo',
              sizeBytes: 2850000,
              imageUrl: MAC_ASSETS.albumWaves,
            },
            {
              name: 'Brief_Cliente.txt',
              kind: 'note',
              sizeBytes: 1240,
              content: 'Brief de marca\n\nObjetivo: Transmitir calma, precisión artesanal y calidez editorial en cada pantalla.',
            },
          ],
        },
      ],
    },
    {
      id: 'zip-audios-ineditos',
      name: 'Audios_Ineditos.zip',
      kind: 'zip',
      parentId: ROOT_IDS.DOWNLOADS,
      sizeBytes: 6380000,
      updatedAt: '16 nov 2026',
      zipEntries: [
        {
          name: 'Sesiones Acústicas',
          kind: 'folder',
          sizeBytes: 0,
          children: [
            {
              name: 'Piano_Noche_Toma2.m4a',
              kind: 'audio',
              sizeBytes: 2940000,
              durationSec: 36,
              audioPreset: 'piano',
            },
            {
              name: 'Lluvia_En_Ventana.m4a',
              kind: 'audio',
              sizeBytes: 3440000,
              durationSec: 45,
              audioPreset: 'rain',
            },
          ],
        },
      ],
    },

    // Pictures
    {
      id: 'photo-tokyo',
      name: 'Callejon_Lluvia.jpg',
      kind: 'photo',
      parentId: ROOT_IDS.PICTURES,
      sizeBytes: 5120000,
      updatedAt: '18 nov 2026',
      imageUrl: MAC_ASSETS.photoTokyo,
      favorite: true,
      album: 'Viajes',
      dimensions: '4032 × 3024',
      camera: 'Leica Q3 · 28mm f/1.7',
    },
    {
      id: 'photo-coast',
      name: 'Acantilados_Dorados.jpg',
      kind: 'photo',
      parentId: ROOT_IDS.PICTURES,
      sizeBytes: 4860000,
      updatedAt: '16 nov 2026',
      imageUrl: MAC_ASSETS.photoCoast,
      favorite: true,
      album: 'Viajes',
      dimensions: '4032 × 3024',
      camera: 'Fujifilm X100VI · 23mm',
    },
    {
      id: 'photo-desk',
      name: 'Escritorio_Mañana.jpg',
      kind: 'photo',
      parentId: ROOT_IDS.PICTURES,
      sizeBytes: 3910000,
      updatedAt: '14 nov 2026',
      imageUrl: MAC_ASSETS.photoDesk,
      favorite: false,
      album: 'Estudio',
      dimensions: '4032 × 3024',
      camera: 'Leica M6 · Portra 400',
    },
    {
      id: 'photo-wallpaper',
      name: 'Horizonte_Crepusculo.jpg',
      kind: 'photo',
      parentId: ROOT_IDS.PICTURES,
      sizeBytes: 6200000,
      updatedAt: '10 nov 2026',
      imageUrl: MAC_ASSETS.wallpaperDusk,
      favorite: true,
      album: 'Fondos',
      dimensions: '5120 × 2880',
      camera: 'Hasselblad X2D',
    },
    {
      id: 'photo-album',
      name: 'Eclipse_Sobre_Mar.jpg',
      kind: 'photo',
      parentId: ROOT_IDS.PICTURES,
      sizeBytes: 2450000,
      updatedAt: '09 nov 2026',
      imageUrl: MAC_ASSETS.albumWaves,
      favorite: false,
      album: 'Diseño',
      dimensions: '3000 × 3000',
      camera: 'Ilustración Digital',
    },

    // Music & Audio Memos
    {
      id: 'audio-lofi',
      name: 'Estudio_Medianoche.m4a',
      kind: 'audio',
      parentId: ROOT_IDS.MUSIC,
      sizeBytes: 3820000,
      updatedAt: 'Hoy, 14:05',
      durationSec: 48,
      audioPreset: 'lofi',
    },
    {
      id: 'audio-piano',
      name: 'Acordes_de_Lluvia.m4a',
      kind: 'audio',
      parentId: ROOT_IDS.MUSIC,
      sizeBytes: 3150000,
      updatedAt: 'Ayer, 20:30',
      durationSec: 36,
      audioPreset: 'piano',
    },
    {
      id: 'audio-voice',
      name: 'Nota_de_Voz_Ideas.m4a',
      kind: 'audio',
      parentId: ROOT_IDS.MUSIC,
      sizeBytes: 1240000,
      updatedAt: '17 nov 2026',
      durationSec: 24,
      audioPreset: 'voice',
    },
    {
      id: 'audio-synth',
      name: 'Horizonte_Analogico.m4a',
      kind: 'audio',
      parentId: ROOT_IDS.MUSIC,
      sizeBytes: 4210000,
      updatedAt: '15 nov 2026',
      durationSec: 52,
      audioPreset: 'synth',
    },
  ];
}

export function getChildren(nodes: FSNode[], folderId: string): FSNode[] {
  if (folderId === ROOT_IDS.TRASH) {
    return nodes.filter((n) => n.isTrashed);
  }
  return nodes.filter((n) => !n.isTrashed && n.parentId === folderId);
}

export function getBreadcrumbs(nodes: FSNode[], folderId: string): FSNode[] {
  const trail: FSNode[] = [];
  let current = nodes.find((n) => n.id === folderId);
  const visited = new Set<string>();
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    trail.unshift(current);
    if (!current.parentId || current.parentId === ROOT_IDS.ROOT) break;
    current = nodes.find((n) => n.id === current!.parentId);
  }
  return trail;
}

export function createFolder(
  nodes: FSNode[],
  parentId: string,
  requestedName: string
): { nodes: FSNode[]; created: FSNode } {
  const baseName = requestedName.trim() || 'Nueva carpeta';
  const siblings = getChildren(nodes, parentId);
  let finalName = baseName;
  let counter = 2;
  while (siblings.some((s) => s.name.toLowerCase() === finalName.toLowerCase())) {
    finalName = `${baseName} ${counter}`;
    counter += 1;
  }

  const created: FSNode = {
    id: `folder-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: finalName,
    kind: 'folder',
    parentId: parentId === ROOT_IDS.TRASH ? ROOT_IDS.DESKTOP : parentId,
    sizeBytes: 0,
    updatedAt: 'Ahora mismo',
  };

  return { nodes: [...nodes, created], created };
}

export function createNoteNode(
  nodes: FSNode[],
  parentId: string,
  title: string,
  content: string
): { nodes: FSNode[]; created: FSNode } {
  const cleanTitle = title.trim() || 'Nueva nota';
  const fileName = cleanTitle.endsWith('.txt') ? cleanTitle : `${cleanTitle}.txt`;
  const created: FSNode = {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: fileName,
    kind: 'note',
    parentId,
    sizeBytes: Math.max(128, content.length * 2),
    updatedAt: 'Ahora mismo',
    content,
  };
  return { nodes: [...nodes, created], created };
}

export function updateNoteNode(
  nodes: FSNode[],
  noteId: string,
  patch: Partial<Pick<FSNode, 'name' | 'content' | 'pinned'>>
): FSNode[] {
  return nodes.map((node) => {
    if (node.id !== noteId) return node;
    const nextContent = patch.content ?? node.content ?? '';
    return {
      ...node,
      ...patch,
      sizeBytes: Math.max(128, nextContent.length * 2),
      updatedAt: 'Ahora mismo',
    };
  });
}

export function renameNode(nodes: FSNode[], nodeId: string, newName: string): FSNode[] {
  const trimmed = newName.trim();
  if (!trimmed) return nodes;
  return nodes.map((node) =>
    node.id === nodeId && !node.isSystem ? { ...node, name: trimmed, updatedAt: 'Ahora mismo' } : node
  );
}

export function moveToTrash(nodes: FSNode[], nodeId: string): FSNode[] {
  const target = nodes.find((n) => n.id === nodeId);
  if (!target || target.isSystem) return nodes;

  const idsToTrash = new Set<string>([nodeId]);
  let added = true;
  while (added) {
    added = false;
    for (const node of nodes) {
      if (node.parentId && idsToTrash.has(node.parentId) && !idsToTrash.has(node.id)) {
        idsToTrash.add(node.id);
        added = true;
      }
    }
  }

  return nodes.map((node) =>
    idsToTrash.has(node.id)
      ? {
          ...node,
          isTrashed: true,
          originalParentId: node.originalParentId ?? node.parentId,
        }
      : node
  );
}

export function restoreFromTrash(nodes: FSNode[], nodeId: string): FSNode[] {
  const target = nodes.find((n) => n.id === nodeId);
  if (!target) return nodes;

  const idsToRestore = new Set<string>([nodeId]);
  let added = true;
  while (added) {
    added = false;
    for (const node of nodes) {
      if (node.parentId && idsToRestore.has(node.parentId) && !idsToRestore.has(node.id)) {
        idsToRestore.add(node.id);
        added = true;
      }
    }
  }

  return nodes.map((node) =>
    idsToRestore.has(node.id)
      ? {
          ...node,
          isTrashed: false,
          parentId: node.originalParentId ?? ROOT_IDS.DESKTOP,
        }
      : node
  );
}

export function emptyTrash(nodes: FSNode[]): FSNode[] {
  return nodes.filter((n) => !n.isTrashed);
}

function materialiseZipEntries(
  entries: ZipEntryItem[],
  parentId: string,
  suffix: string
): FSNode[] {
  const created: FSNode[] = [];
  entries.forEach((entry, index) => {
    const id = `extracted-${suffix}-${index}-${Math.random().toString(36).slice(2, 6)}`;
    created.push({
      id,
      name: entry.name,
      kind: entry.kind,
      parentId,
      sizeBytes: entry.sizeBytes,
      updatedAt: 'Extraído ahora',
      content: entry.content,
      imageUrl: entry.imageUrl,
      durationSec: entry.durationSec,
      audioPreset: entry.audioPreset,
      dimensions: entry.kind === 'photo' ? '4032 × 3024' : undefined,
      camera: entry.kind === 'photo' ? 'Archivo comprimido' : undefined,
    });
    if (entry.kind === 'folder' && entry.children?.length) {
      created.push(...materialiseZipEntries(entry.children, id, `${suffix}-${index}`));
    }
  });
  return created;
}

export function extractZipArchive(
  nodes: FSNode[],
  zipNodeId: string
): { nodes: FSNode[]; extractedCount: number; targetFolderId: string | null } {
  const zipNode = nodes.find((n) => n.id === zipNodeId && n.kind === 'zip');
  if (!zipNode || !zipNode.zipEntries?.length) {
    return { nodes, extractedCount: 0, targetFolderId: null };
  }

  const parentId = zipNode.parentId ?? ROOT_IDS.DOWNLOADS;
  const baseFolderName = zipNode.name.replace(/\.zip$/i, '');
  const siblings = getChildren(nodes, parentId);
  let folderName = baseFolderName;
  let counter = 2;
  while (siblings.some((s) => s.name.toLowerCase() === folderName.toLowerCase())) {
    folderName = `${baseFolderName} (${counter})`;
    counter += 1;
  }

  const wrapperFolderId = `folder-unzip-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
  const wrapperFolder: FSNode = {
    id: wrapperFolderId,
    name: folderName,
    kind: 'folder',
    parentId,
    sizeBytes: 0,
    updatedAt: 'Extraído ahora',
  };

  const innerNodes = materialiseZipEntries(
    zipNode.zipEntries,
    wrapperFolderId,
    String(Date.now())
  );

  const updatedNodes = nodes.map((n) =>
    n.id === zipNodeId ? { ...n, extractedFolderId: wrapperFolderId } : n
  );

  return {
    nodes: [...updatedNodes, wrapperFolder, ...innerNodes],
    extractedCount: innerNodes.length,
    targetFolderId: wrapperFolderId,
  };
}

export function compressFolderToZip(
  nodes: FSNode[],
  folderId: string
): { nodes: FSNode[]; createdZip: FSNode | null } {
  const folder = nodes.find((n) => n.id === folderId && n.kind === 'folder');
  if (!folder) return { nodes, createdZip: null };

  const parentId = folder.parentId === ROOT_IDS.ROOT ? ROOT_IDS.DESKTOP : (folder.parentId ?? ROOT_IDS.DESKTOP);
  const toZipEntry = (node: FSNode): ZipEntryItem => {
    const children = nodes.filter((c) => !c.isTrashed && c.parentId === node.id);
    return {
      name: node.name,
      kind: node.kind,
      sizeBytes: node.sizeBytes || 1024,
      content: node.content,
      imageUrl: node.imageUrl,
      durationSec: node.durationSec,
      audioPreset: node.audioPreset,
      children: node.kind === 'folder' ? children.map(toZipEntry) : undefined,
    };
  };

  const entries = nodes
    .filter((n) => !n.isTrashed && n.parentId === folderId)
    .map(toZipEntry);

  const totalSize = entries.reduce((sum, item) => sum + (item.sizeBytes || 2048), 2048);
  const siblings = getChildren(nodes, parentId);
  let zipName = `${folder.name}.zip`;
  let counter = 2;
  while (siblings.some((s) => s.name.toLowerCase() === zipName.toLowerCase())) {
    zipName = `${folder.name} ${counter}.zip`;
    counter += 1;
  }

  const createdZip: FSNode = {
    id: `zip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: zipName,
    kind: 'zip',
    parentId,
    sizeBytes: Math.round(totalSize * 0.68),
    updatedAt: 'Ahora mismo',
    zipEntries: entries.length
      ? entries
      : [{ name: 'LEEME.txt', kind: 'note', sizeBytes: 256, content: `Archivo comprimido de ${folder.name}` }],
  };

  return { nodes: [...nodes, createdZip], createdZip };
}

export function searchNodes(nodes: FSNode[], query: string): FSNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return nodes.filter(
    (n) =>
      !n.isTrashed &&
      !n.isSystem &&
      (n.name.toLowerCase().includes(q) || (n.content && n.content.toLowerCase().includes(q)))
  );
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
