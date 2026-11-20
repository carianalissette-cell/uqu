export type AppId =
  | 'finder'
  | 'notes'
  | 'photos'
  | 'audio'
  | 'archive'
  | 'spotify'
  | 'whatsapp'
  | 'instagram'
  | 'about';

export type FileKind = 'folder' | 'note' | 'photo' | 'audio' | 'zip';

export interface ZipEntryItem {
  name: string;
  kind: FileKind;
  sizeBytes: number;
  content?: string;
  imageUrl?: string;
  durationSec?: number;
  audioPreset?: AudioPreset;
  children?: ZipEntryItem[];
}

export type AudioPreset = 'lofi' | 'ambient' | 'piano' | 'synth' | 'voice' | 'rain';

export interface FSNode {
  id: string;
  name: string;
  kind: FileKind;
  parentId: string | null;
  isSystem?: boolean;
  isTrashed?: boolean;
  originalParentId?: string | null;
  sizeBytes: number;
  updatedAt: string;
  // Kind-specific payloads
  content?: string;
  pinned?: boolean;
  imageUrl?: string;
  favorite?: boolean;
  album?: string;
  dimensions?: string;
  camera?: string;
  durationSec?: number;
  audioPreset?: AudioPreset;
  zipEntries?: ZipEntryItem[];
  extractedFolderId?: string;
}

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  payload?: {
    folderId?: string;
    noteId?: string;
    photoId?: string;
    audioId?: string;
    zipNodeId?: string;
  };
}

export interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationSec: number;
  coverUrl: string;
  preset: AudioPreset;
  liked: boolean;
}

export interface WhatsAppMessage {
  id: string;
  sender: 'me' | 'them';
  text?: string;
  time: string;
  kind: 'text' | 'audio' | 'photo';
  audioDurationSec?: number;
  audioPreset?: AudioPreset;
  imageUrl?: string;
}

export interface WhatsAppChat {
  id: string;
  name: string;
  status: string;
  avatarUrl?: string;
  initials: string;
  unread: number;
  messages: WhatsAppMessage[];
}

export interface InstagramComment {
  id: string;
  author: string;
  text: string;
}

export interface InstagramPost {
  id: string;
  author: string;
  handle: string;
  location: string;
  avatarUrl?: string;
  initials: string;
  imageUrl: string;
  caption: string;
  likes: number;
  liked: boolean;
  saved: boolean;
  timeAgo: string;
  comments: InstagramComment[];
}

export interface InstagramStory {
  id: string;
  username: string;
  avatarUrl?: string;
  initials: string;
  imageUrl: string;
  caption: string;
  viewed: boolean;
}
