'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import Avatar from '@/components/ui/Avatar';
import styles from './page.module.css';

interface MessageRow {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromName: string;
  content: string;
  createdAt: string;
  isFromMe: boolean;
}

interface SpecialistOption {
  id: string;
  name: string;
  type?: string;
}

export default function UserMessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const withUserId = searchParams.get('with');
  const [userId, setUserId] = useState<string | null>(null);
  const [specialists, setSpecialists] = useState<SpecialistOption[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(withUserId);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedId(withUserId);
  }, [withUserId]);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        if (me.role !== 'USER') { router.replace(me.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/therapist'); return; }
        setUserId(me.id);
        const list = await api.getConversationPartners(me.id).catch(() => []);
        setSpecialists(Array.isArray(list) ? list.map((s) => ({ id: s.id, name: s.name, type: s.type })) : []);
      } catch {
        setSpecialists([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    api.getMessages(selectedId).then((list) => {
      if (!cancelled) setMessages(Array.isArray(list) ? list : []);
    }).catch(() => { if (!cancelled) setMessages([]); });
    return () => { cancelled = true; };
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!selectedId || !reply.trim() || sending) return;
    setSending(true);
    try {
      await api.postMessage(selectedId, reply.trim());
      setReply('');
      const list = await api.getMessages(selectedId);
      setMessages(Array.isArray(list) ? list : []);
    } finally {
      setSending(false);
    }
  };

  const selected = specialists.find((s) => s.id === selectedId);

  if (loading) {
    return <div className={styles.page}><p className={styles.muted}>Loading…</p></div>;
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Messages</h2>
      <p className={styles.sub}>Chat with your specialists. Select one to view and send messages.</p>

      <div className={styles.layout}>
        <div className={styles.sidebar}>
          {specialists.length === 0 ? (
            <p className={styles.empty}>No specialists yet. Add one by requesting a consultation from Find a Specialist.</p>
          ) : (
            specialists.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`${styles.clientRow} ${selectedId === s.id ? styles.clientRowActive : ''}`}
                onClick={() => { setSelectedId(s.id); router.replace(`/dashboard/user/messages?with=${s.id}`, { scroll: false }); }}
              >
                <Avatar name={s.name} size="sm" />
                <span className={styles.clientName}>{s.name}</span>
              </button>
            ))
          )}
        </div>
        <div className={styles.thread}>
          {!selectedId ? (
            <p className={styles.placeholder}>Select a specialist to view messages.</p>
          ) : (
            <>
              <div className={styles.threadHeader}>
                <Avatar name={selected?.name || 'Specialist'} size="md" />
                <span className={styles.threadTitle}>{selected?.name || 'Specialist'}</span>
              </div>
              <div className={styles.messages}>
                {messages.map((m) => (
                  <div key={m.id} className={m.isFromMe ? styles.msgMe : styles.msgThem}>
                    <span className={styles.msgContent}>{m.content}</span>
                    <span className={styles.msgTime}>{new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className={styles.sendRow}>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type a message…"
                  className={styles.sendInput}
                  rows={2}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                />
                <button type="button" className={styles.sendBtn} onClick={sendMessage} disabled={!reply.trim() || sending}>
                  {sending ? 'Sending…' : 'Send'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
