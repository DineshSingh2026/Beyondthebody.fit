'use client';

import { useIsMobile } from '@/hooks/useMediaQuery';
import { mockUserDashboard } from '@/lib/mock-data';
import Avatar from '@/components/ui/Avatar';
import styles from './page.module.css';

export default function UserCommunityPage() {
  const isMobile = useIsMobile();
  const d = mockUserDashboard;

  if (!isMobile) {
    return (
      <div className={styles.desktop}>
        <p>Community feed — resize to mobile.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {d.communityFeed.map((post) => (
        <article key={post.id} className={styles.post}>
          <Avatar name={post.authorName} size="md" />
          <div className={styles.body}>
            <span className={styles.author}>{post.authorName}</span>
            <p className={styles.content}>{post.content}</p>
            <span className={styles.meta}>{post.timestamp} · {post.likes} likes · {post.comments} comments</span>
          </div>
        </article>
      ))}
    </div>
  );
}
