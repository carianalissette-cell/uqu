import React, { useState } from 'react';
import { CheckCheck, Pause, Play, Search, Send, Smile } from 'lucide-react';
import { macAudioSynth } from '../../os/audioSynth';
import type { WhatsAppChat, WhatsAppMessage } from '../../os/types';

interface WhatsAppAppProps {
  chats: WhatsAppChat[];
  onSendMessage: (chatId: string, text: string) => void;
  onMarkRead: (chatId: string) => void;
  systemVolume: number;
}

const QUICK_EMOJIS = ['😊', '🔥', '🙌', '🎧', '✨', '👍'];

export const WhatsAppApp: React.FC<WhatsAppAppProps> = ({
  chats,
  onSendMessage,
  onMarkRead,
  systemVolume,
}) => {
  const [selectedChatId, setSelectedChatId] = useState(chats[0]?.id ?? '');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [showEmojis, setShowEmojis] = useState(false);

  const filteredChats = chats.filter((c) =>
    c.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const activeChat = chats.find((c) => c.id === selectedChatId) ?? chats[0] ?? null;

  const handleSelectChat = (id: string) => {
    setSelectedChatId(id);
    onMarkRead(id);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat || !draft.trim()) return;
    onSendMessage(activeChat.id, draft.trim());
    setDraft('');
    setShowEmojis(false);
  };

  const toggleVoiceNote = (msg: WhatsAppMessage) => {
    if (playingMsgId === msg.id) {
      setPlayingMsgId(null);
      macAudioSynth.stop();
    } else {
      setPlayingMsgId(msg.id);
      macAudioSynth.start(msg.audioPreset ?? 'voice', systemVolume, 1);
      window.setTimeout(() => {
        setPlayingMsgId((curr) => (curr === msg.id ? null : curr));
        macAudioSynth.stop();
      }, 4000);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left Chat List */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-black/8 bg-white dark:border-white/10 dark:bg-neutral-900">
        <div className="border-b border-black/8 p-3 dark:border-white/10">
          <h3 className="mb-2 text-sm font-bold">Chats</h3>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar un chat…"
              aria-label="Buscar chats de WhatsApp"
              className="w-full rounded-lg bg-neutral-100 py-1.5 pl-8 pr-3 text-xs focus:outline-none dark:bg-neutral-800"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mac-scrollbar">
          {filteredChats.map((chat) => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            const isSelected = activeChat?.id === chat.id;
            return (
              <button
                key={chat.id}
                type="button"
                onClick={() => handleSelectChat(chat.id)}
                className={`flex w-full items-center gap-3 border-b border-black/5 px-3 py-2.5 text-left transition-colors dark:border-white/5 ${
                  isSelected
                    ? 'bg-emerald-500/12'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                  {chat.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate text-xs font-semibold">{chat.name}</p>
                    <span className="text-[10px] text-neutral-400 tabular-nums">
                      {lastMsg?.time ?? ''}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-1">
                    <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                      {lastMsg?.kind === 'audio'
                        ? 'Nota de voz'
                        : lastMsg?.kind === 'photo'
                        ? 'Foto'
                        : lastMsg?.text}
                    </p>
                    {chat.unread > 0 && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white tabular-nums">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Active Conversation */}
      <div className="flex min-w-0 flex-1 flex-col bg-[#efeae2] dark:bg-neutral-950">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-black/8 bg-neutral-50 px-4 py-2.5 dark:border-white/10 dark:bg-neutral-900">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                {activeChat.initials}
              </div>
              <div>
                <p className="text-xs font-bold">{activeChat.name}</p>
                <p className="text-[11px] text-neutral-500">{activeChat.status}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 mac-scrollbar">
              {activeChat.messages.map((msg) => {
                const isMe = msg.sender === 'me';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                        isMe
                          ? 'rounded-tr-sm bg-[#d9fdd3] text-neutral-900 dark:bg-emerald-900 dark:text-white'
                          : 'rounded-tl-sm bg-white text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                      }`}
                    >
                      {msg.kind === 'photo' && msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt={msg.text ?? 'Foto compartida'}
                          referrerPolicy="no-referrer"
                          className="mb-1.5 max-h-40 w-full rounded-lg object-cover"
                        />
                      )}

                      {msg.kind === 'audio' ? (
                        <div className="flex items-center gap-2.5 py-0.5">
                          <button
                            type="button"
                            onClick={() => toggleVoiceNote(msg)}
                            aria-label={playingMsgId === msg.id ? 'Pausar nota de voz' : 'Reproducir nota de voz'}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white"
                          >
                            {playingMsgId === msg.id ? (
                              <Pause className="h-3.5 w-3.5" />
                            ) : (
                              <Play className="h-3.5 w-3.5 translate-x-0.5" />
                            )}
                          </button>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 14 }).map((_, i) => (
                              <span
                                key={i}
                                className="w-1 rounded-full bg-emerald-600/60"
                                style={{ height: `${8 + ((i * 7) % 14)}px` }}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] opacity-70 tabular-nums">
                            0:{String(msg.audioDurationSec ?? 12).padStart(2, '0')}
                          </span>
                        </div>
                      ) : (
                        <p className="leading-relaxed">{msg.text}</p>
                      )}

                      <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-60 tabular-nums">
                        <span>{msg.time}</span>
                        {isMe && <CheckCheck className="h-3 w-3 text-sky-600 dark:text-sky-400" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Emoji Picker */}
            {showEmojis && (
              <div className="flex items-center gap-2 border-t border-black/8 bg-white px-4 py-1.5 dark:border-white/10 dark:bg-neutral-900">
                {QUICK_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setDraft((d) => `${d}${em}`)}
                    className="rounded p-1 text-base hover:bg-black/5"
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}

            {/* Message Input */}
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 border-t border-black/8 bg-neutral-50 px-3 py-2.5 dark:border-white/10 dark:bg-neutral-900"
            >
              <button
                type="button"
                onClick={() => setShowEmojis((v) => !v)}
                aria-label="Insertar emoji"
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Smile className="h-4 w-4" />
              </button>
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Escribe un mensaje"
                aria-label="Escribe un mensaje en WhatsApp"
                className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none dark:border-white/10 dark:bg-neutral-800"
              />
              <button
                type="submit"
                aria-label="Enviar mensaje"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-neutral-400">
            Selecciona un chat para comenzar
          </div>
        )}
      </div>
    </div>
  );
};
