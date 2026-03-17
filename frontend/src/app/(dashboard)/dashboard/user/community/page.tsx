'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Avatar from '@/components/ui/Avatar';
import type { CommunityPost } from '@/lib/dashboard-types';
import styles from './page.module.css';

const SPECIALIST_ROLES = ['THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR'];
const MAX_CHARS = 500;

export default function UserCommunityPage() {
  const router = useRouter();
  const [feed, setFeed]           = useState<CommunityPost[]>([]);
  const [loading, setLoading]     = useState(true);
  const [myId, setMyId]           = useState<string | null>(null);
  const [myName, setMyName]       = useState('');
  const [draft, setDraft]         = useState('');
  const [posting, setPosting]     = useState(false);
  const [postError, setPostError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const refreshFeed = async () => {
    try {
      const data = await api.getCommunityFeed();
      if (Array.isArray(data)) setFeed(data);
    } catch { /* silent */ }
  };

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        if (me.role === 'ADMIN') { router.replace('/dashboard/admin'); return; }
        if (SPECIALIST_ROLES.includes(me.role)) { router.replace('/dashboard/therapist'); return; }
        setMyId(me.id);
        setMyName(me.name);
        await refreshFeed();
      } catch {
        setFeed([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // Auto-resize textarea
  const handleDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length > MAX_CHARS) return;
    setDraft(val);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handlePost = async () => {
    if (!draft.trim() || !myId) return;
    setPosting(true);
    setPostError('');
    try {
      const newPost = await api.postCommunityPost(draft.trim());
      setFeed(prev => [newPost, ...prev]);
      setDraft('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch (e) {
      setPostError(e instanceof Error ? e.message : 'Post failed. Try again.');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    // Optimistic update
    setFeed(prev => prev.map(p =>
      p.id === postId
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
    ));
    try {
      const res = await api.likeCommunityPost(postId);
      setFeed(prev => prev.map(p => p.id === postId ? { ...p, liked: res.liked, likes: res.likes } : p));
    } catch {
      // revert on failure
      setFeed(prev => prev.map(p =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      ));
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Community Feed</h1>
        <p className={styles.sub}>Share your journey. Inspire others. You&apos;re not alone.</p>
      </div>

      {/* Compose box */}
      <div className={styles.composeBox}>
        <Avatar name={myName || 'You'} size="md" />
        <div className={styles.composeRight}>
          <textarea
            ref={textareaRef}
            className={styles.composeInput}
            placeholder="Share a reflection, win, or encouragement…"
            value={draft}
            onChange={handleDraftChange}
            rows={2}
            disabled={posting}
          />
          {postError && <p className={styles.postError}>{postError}</p>}
          <div className={styles.composeFooter}>
            <span className={`${styles.charCount} ${draft.length > MAX_CHARS * 0.9 ? styles.charCountWarn : ''}`}>
              {draft.length}/{MAX_CHARS}
            </span>
            <button
              type="button"
              className={styles.postBtn}
              onClick={handlePost}
              disabled={posting || !draft.trim()}
            >
              {posting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className={styles.loadWrap}><div className={styles.spinner} /></div>
      ) : feed.length === 0 ? (
        <div className={styles.empty}>
          <span>🌱</span>
          <p>No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        <div className={styles.feed}>
          {feed.map(post => (
            <article key={post.id} className={styles.post}>
              <Avatar name={post.authorName} size="md" />
              <div className={styles.postBody}>
                <div className={styles.postMeta}>
                  <span className={styles.postAuthor}>{post.authorName}</span>
                  <span className={styles.postTime}>{post.timestamp}</span>
                </div>
                <p className={styles.postContent}>{post.content}</p>
                <div className={styles.postActions}>
                  <button
                    type="button"
                    className={`${styles.likeBtn} ${post.liked ? styles.likeBtnActive : ''}`}
                    onClick={() => handleLike(post.id)}
                    aria-label={post.liked ? 'Unlike' : 'Like'}
                  >
                    {post.liked ? '❤️' : '🤍'} {post.likes > 0 ? post.likes : ''}
                  </button>
                  {post.comments > 0 && (
                    <span className={styles.commentCount}>💬 {post.comments}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
