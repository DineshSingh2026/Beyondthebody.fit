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
  avatarUrl?: string | null;
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
  // mobile: 'list' shows contact list, 'chat' shows conversation
  const [mobileView, setMobileView] = useState<'list' | 'chat'>(withUserId ? 'chat' : 'list');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (withUserId) {
      setSelectedId(withUserId);
      setMobileView('chat');
    }
  }, [withUserId]);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        if (me.role !== 'USER') { router.replace(me.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/therapist'); return; }
        setUserId(me.id);
        const list = await api.getConversationPartners(me.id).catch(() => []);
        setSpecialists(Array.isArray(list) ? list.map((s) => ({ id: s.id, name: s.name, type: s.type, avatarUrl: s.avatarUrl ?? null })) : []);
      } catch {
        setSpecialists([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  useEffect(() => {
    if (!selectedId) { setMessages([]); return; }
    let cancelled = false;
    api.getMessages(selectedId)
      .then((list) => { if (!cancelled) setMessages(Array.isArray(list) ? list : []); })
      .catch(() => { if (!cancelled) setMessages([]); });
    return () => { cancelled = true; };
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectSpecialist = (id: string) => {
    setSelectedId(id);
    setMobileView('chat');
    router.replace(`/dashboard/user/messages?with=${id}`, { scroll: false });
  };

  const backToList = () => {
    setMobileView('list');
  };

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
      {/* Desktop page header */}
      <div className={`${styles.pageHeader} ${mobileView === 'chat' ? styles.pageHeaderHiddenMobile : ''}`}>
        <h2 className={styles.title}>Messages</h2>
        <p className={styles.sub}>Chat with your specialists. Select one to view and send messages.</p>
      </div>

      <div className={styles.layout}>
        {/* Contact list */}
        <div className={`${styles.sidebar} ${mobileView === 'chat' ? styles.sidebarHiddenMobile : ''}`}>
          <div className={styles.sidebarHeader}>
            <span className={styles.sidebarTitle}>Specialists</span>
            <span className={styles.sidebarCount}>{specialists.length}</span>
          </div>
          {specialists.length === 0 ? (
            <p className={styles.empty}>No specialists yet. Request a consultation from Find a Specialist to get started.</p>
          ) : (
            specialists.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`${styles.clientRow} ${selectedId === s.id ? styles.clientRowActive : ''}`}
                onClick={() => selectSpecialist(s.id)}
              >
                <Avatar name={s.name} src={s.avatarUrl} size="sm" />
                <div className={styles.clientInfo}>
                  <span className={styles.clientName}>{s.name}</span>
                  <span className={styles.clientMeta}>{s.type?.replace('_', ' ') || 'Specialist'}</span>
                </div>
                <span className={styles.chevron}>›</span>
              </button>
            ))
          )}
        </div>

        {/* Chat thread */}
        <div className={`${styles.thread} ${mobileView === 'list' ? styles.threadHiddenMobile : ''}`}>
          {!selectedId ? (
            <div className={styles.emptyThread}>
              <div className={styles.emptyIcon}>💬</div>
              <p className={styles.emptyThreadText}>Select a specialist to start messaging</p>
            </div>
          ) : (
            <>
              <div className={styles.threadHeader}>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={backToList}
                  aria-label="Back to contacts"
                >
                  ←
                </button>
                <Avatar name={selected?.name || 'Specialist'} src={selected?.avatarUrl} size="sm" />
                <div className={styles.threadMeta}>
                  <span className={styles.threadTitle}>{selected?.name || 'Specialist'}</span>
                  <span className={styles.threadSub}>{selected?.type?.replace('_', ' ') || 'Specialist'}</span>
                </div>
              </div>

              <div className={styles.messages}>
                {messages.length === 0 && (
                  <p className={styles.noMessages}>No messages yet. Send the first one!</p>
                )}
                {messages.map((m) => (
                  <div key={m.id} className={m.isFromMe ? styles.msgMe : styles.msgThem}>
                    <span className={styles.msgContent}>{m.content}</span>
                    <span className={styles.msgTime}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                  rows={1}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                />
                <button
                  type="button"
                  className={styles.sendBtn}
                  onClick={sendMessage}
                  disabled={!reply.trim() || sending}
                  aria-label="Send message"
                >
                  {sending ? '…' : '↑'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
