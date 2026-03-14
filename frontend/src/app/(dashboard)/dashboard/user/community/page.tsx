'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { api } from '@/lib/api';
import Avatar from '@/components/ui/Avatar';
import type { CommunityPost } from '@/lib/dashboard-types';
import styles from './page.module.css';

const SPECIALIST_ROLES = ['THERAPIST', 'LIFE_COACH', 'HYPNOTHERAPIST', 'MUSIC_TUTOR'];

export default function UserCommunityPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [feed, setFeed] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        if (me.role === 'ADMIN') { router.replace('/dashboard/admin'); return; }
        if (SPECIALIST_ROLES.includes(me.role)) { router.replace('/dashboard/therapist'); return; }
        const d = await api.getUserDashboard(me.id);
        setFeed(d.communityFeed ?? []);
      } catch {
        setFeed([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>Loading feed…</p>
      </div>
    );
  }

  const content = (
    <>
      {feed.length === 0 ? (
        <p className={styles.empty}>No posts yet. Check back later for community updates.</p>
      ) : (
        feed.map((post) => (
          <article key={post.id} className={styles.post}>
            <Avatar name={post.authorName} size="md" />
            <div className={styles.body}>
              <span className={styles.author}>{post.authorName}</span>
              <p className={styles.content}>{post.content}</p>
              <span className={styles.meta}>{post.timestamp} · {post.likes} likes · {post.comments} comments</span>
            </div>
          </article>
        ))
      )}
    </>
  );

  if (!isMobile) {
    return (
      <div className={styles.desktop}>
        <h2 className={styles.desktopTitle}>Community Feed</h2>
        <p className={styles.desktopSub}>Share and connect with others on their journey.</p>
        <div className={styles.feedGrid}>{content}</div>
      </div>
    );
  }

  return <div className={styles.page}>{content}</div>;
}
