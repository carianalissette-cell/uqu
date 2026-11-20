import React, { useState } from 'react';
import {
  Bookmark,
  Compass,
  Heart,
  Home,
  MessageCircle,
  User,
  X,
} from 'lucide-react';
import { MAC_ASSETS } from '../../os/assets';
import type { InstagramPost, InstagramStory } from '../../os/types';

interface InstagramAppProps {
  posts: InstagramPost[];
  stories: InstagramStory[];
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onMarkStoryViewed: (storyId: string) => void;
}

export const InstagramApp: React.FC<InstagramAppProps> = ({
  posts,
  stories,
  onToggleLike,
  onToggleSave,
  onAddComment,
  onMarkStoryViewed,
}) => {
  const [nav, setNav] = useState<'feed' | 'explore' | 'profile'>('feed');
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const activeStory = stories.find((s) => s.id === activeStoryId) ?? null;

  const handleCommentSubmit = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    const text = (commentDrafts[postId] ?? '').trim();
    if (!text) return;
    onAddComment(postId, text);
    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-white dark:bg-neutral-950">
      {/* Left Navigation Rail */}
      <aside className="flex w-44 shrink-0 flex-col border-r border-black/8 p-3 dark:border-white/10">
        <h2 className="px-2 pb-4 text-base font-bold tracking-tight">Instagram</h2>
        <nav aria-label="Menú de Instagram" className="space-y-1">
          <button
            type="button"
            onClick={() => setNav('feed')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold ${
              nav === 'feed' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Inicio</span>
          </button>
          <button
            type="button"
            onClick={() => setNav('explore')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold ${
              nav === 'explore' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>Explorar</span>
          </button>
          <button
            type="button"
            onClick={() => setNav('profile')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold ${
              nav === 'profile' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Perfil</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 mac-scrollbar">
        {nav === 'feed' && (
          <div className="mx-auto max-w-lg space-y-5">
            {/* Stories */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {stories.map((story) => (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => {
                    setActiveStoryId(story.id);
                    onMarkStoryViewed(story.id);
                  }}
                  className="flex shrink-0 flex-col items-center gap-1"
                >
                  <div
                    className={`rounded-full p-[2px] ${
                      story.viewed
                        ? 'bg-neutral-300 dark:bg-neutral-700'
                        : 'bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600'
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-neutral-200 text-xs font-bold text-neutral-800 dark:border-neutral-950">
                      {story.avatarUrl ? (
                        <img
                          src={story.avatarUrl}
                          alt={story.username}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        story.initials
                      )}
                    </div>
                  </div>
                  <span className="max-w-[64px] truncate text-[10px] text-neutral-600 dark:text-neutral-300">
                    {story.username}
                  </span>
                </button>
              ))}
            </div>

            {/* Feed Posts */}
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-neutral-900"
              >
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-rose-500 text-xs font-bold text-white">
                      {post.avatarUrl ? (
                        <img
                          src={post.avatarUrl}
                          alt={post.author}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        post.initials
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{post.handle}</p>
                      <p className="text-[10px] text-neutral-500">{post.location}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-neutral-400">{post.timeAgo}</span>
                </div>

                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  referrerPolicy="no-referrer"
                  className="aspect-[4/3] w-full object-cover"
                />

                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onToggleLike(post.id)}
                        aria-label={`Me gusta publicación de ${post.handle}`}
                        className={`transition-transform active:scale-110 ${
                          post.liked ? 'text-rose-500' : 'hover:text-neutral-500'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${post.liked ? 'fill-current' : ''}`} />
                      </button>
                      <span className="text-neutral-500">
                        <MessageCircle className="h-5 w-5" />
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleSave(post.id)}
                      aria-label={`Guardar publicación de ${post.handle}`}
                      className={post.saved ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}
                    >
                      <Bookmark className={`h-5 w-5 ${post.saved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <p className="text-xs font-semibold tabular-nums">{post.likes} Me gusta</p>
                  <p className="text-xs leading-relaxed">
                    <span className="font-semibold mr-1.5">{post.handle}</span>
                    {post.caption}
                  </p>

                  {post.comments.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {post.comments.map((c) => (
                        <p key={c.id} className="text-xs">
                          <span className="font-semibold mr-1.5">{c.author}</span>
                          <span className="text-neutral-600 dark:text-neutral-300">{c.text}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  <form
                    onSubmit={(e) => handleCommentSubmit(e, post.id)}
                    className="flex items-center gap-2 border-t border-black/8 pt-2 dark:border-white/10"
                  >
                    <input
                      type="text"
                      value={commentDrafts[post.id] ?? ''}
                      onChange={(e) =>
                        setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      placeholder="Añade un comentario…"
                      aria-label={`Comentar en publicación de ${post.handle}`}
                      className="flex-1 bg-transparent text-xs focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="text-xs font-semibold text-sky-600 hover:text-sky-700"
                    >
                      Publicar
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}

        {nav === 'explore' && (
          <div className="grid grid-cols-3 gap-2">
            {posts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setNav('feed')}
                className="aspect-square overflow-hidden rounded-lg"
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover hover:scale-105 transition-transform"
                />
              </button>
            ))}
          </div>
        )}

        {nav === 'profile' && (
          <div className="mx-auto max-w-lg space-y-6">
            <div className="flex items-center gap-5 border-b border-black/8 pb-5 dark:border-white/10">
              <img
                src={MAC_ASSETS.userAvatar}
                alt="Sofía Morales"
                referrerPolicy="no-referrer"
                className="h-20 w-20 rounded-full object-cover"
              />
              <div>
                <h3 className="text-base font-bold">sofia.atelier</h3>
                <p className="text-xs text-neutral-500">Sofía Morales · Diseño & Fotografía</p>
                <div className="mt-2 flex gap-4 text-xs tabular-nums">
                  <span>
                    <strong>{posts.length}</strong> publicaciones
                  </span>
                  <span>
                    <strong>1.4k</strong> seguidores
                  </span>
                  <span>
                    <strong>318</strong> seguidos
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {posts.map((post) => (
                <img
                  key={post.id}
                  src={post.imageUrl}
                  alt={post.caption}
                  referrerPolicy="no-referrer"
                  className="aspect-square w-full rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/90 p-4 text-white">
          <div className="relative h-full max-h-[460px] w-full max-w-[300px] overflow-hidden rounded-2xl bg-neutral-900 shadow-2xl">
            <img
              src={activeStory.imageUrl}
              alt={activeStory.caption}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/75 to-transparent p-3">
              <div className="mb-2 h-0.5 w-full rounded-full bg-white/30">
                <div className="h-full w-full rounded-full bg-white" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{activeStory.username}</span>
                <button
                  type="button"
                  onClick={() => setActiveStoryId(null)}
                  aria-label="Cerrar historia"
                  className="rounded-full p-1 hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4">
              <p className="text-xs">{activeStory.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
