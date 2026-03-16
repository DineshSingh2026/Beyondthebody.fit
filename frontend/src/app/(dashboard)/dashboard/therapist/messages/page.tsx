'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { ClientRosterEntry } from '@/lib/dashboard-types';
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

export default function TherapistMessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const withUserId = searchParams.get('with');
  const [specialistId, setSpecialistId] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientRosterEntry[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(withUserId);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  // mobile: 'list' shows contact list, 'chat' shows conversation
  const [mobileView, setMobileView] = useState<'list' | 'chat'>(withUserId ? 'chat' : 'list');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (withUserId) {
      setSelectedUserId(withUserId);
      setMobileView('chat');
    }
  }, [withUserId]);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.getMe();
        if (me.role === 'ADMIN') { router.replace('/dashboard/admin'); return; }
        if (me.role === 'USER') { router.replace('/dashboard/user'); return; }
        setSpecialistId(me.id);
        const [d, requests] = await Promise.all([
          api.getSpecialistDashboard(me.id),
          api.getSpecialistRequests(me.id).catch(() => []),
        ]);
        const clientList: ClientRosterEntry[] = d.clients ?? [];
        const fromRequests = Array.isArray(requests)
          ? requests.map((r: { userId: string; clientName: string }) => ({
              id: r.userId, name: r.clientName,
              sessionCount: 0, lastSessionDate: '', progressScore: 0, metricLabel: '', metricValue: '',
            }))
          : [];
        const seen = new Set(clientList.map((c) => c.id));
        fromRequests.forEach((r) => { if (!seen.has(r.id)) { seen.add(r.id); clientList.push(r); } });
        setClients(clientList);
      } catch {
        setClients([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  useEffect(() => {
    if (!selectedUserId) { setMessages([]); return; }
    let cancelled = false;
    api.getMessages(selectedUserId)
      .then((list) => { if (!cancelled) setMessages(Array.isArray(list) ? list : []); })
      .catch(() => { if (!cancelled) setMessages([]); });
    return () => { cancelled = true; };
  }, [selectedUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectClient = (id: string) => {
    setSelectedUserId(id);
    setMobileView('chat');
    router.replace(`/dashboard/therapist/messages?with=${id}`, { scroll: false });
  };

  const backToList = () => {
    setMobileView('list');
  };

  const sendMessage = async () => {
    if (!selectedUserId || !reply.trim() || sending) return;
    setSending(true);
    try {
      await api.postMessage(selectedUserId, reply.trim());
      setReply('');
      const list = await api.getMessages(selectedUserId);
      setMessages(Array.isArray(list) ? list : []);
    } finally {
      setSending(false);
    }
  };

  const selectedClient = clients.find((c) => c.id === selectedUserId);

  if (loading) {
    return <div className={styles.page}><p className={styles.muted}>Loading…</p></div>;
  }

  return (
    <div className={styles.page}>
      {/* Desktop header — hidden on mobile chat view */}
      <div className={`${styles.pageHeader} ${mobileView === 'chat' ? styles.pageHeaderHiddenMobile : ''}`}>
        <h2 className={styles.title}>Messages</h2>
        <p className={styles.sub}>Message your clients. Select a client to view and send messages.</p>
      </div>

      <div className={styles.layout}>
        {/* Contact list */}
        <div className={`${styles.sidebar} ${mobileView === 'chat' ? styles.sidebarHiddenMobile : ''}`}>
          <div className={styles.sidebarHeader}>
            <span className={styles.sidebarTitle}>Clients</span>
            <span className={styles.sidebarCount}>{clients.length}</span>
          </div>
          {clients.length === 0 ? (
            <p className={styles.empty}>No clients yet. They appear after sessions or consultation requests.</p>
          ) : (
            clients.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`${styles.clientRow} ${selectedUserId === c.id ? styles.clientRowActive : ''}`}
                onClick={() => selectClient(c.id)}
              >
                <Avatar name={c.name} size="sm" />
                <div className={styles.clientInfo}>
                  <span className={styles.clientName}>{c.name}</span>
                  <span className={styles.clientMeta}>Tap to message</span>
                </div>
                <span className={styles.chevron}>›</span>
              </button>
            ))
          )}
        </div>

        {/* Chat thread */}
        <div className={`${styles.thread} ${mobileView === 'list' ? styles.threadHiddenMobile : ''}`}>
          {!selectedUserId ? (
            <div className={styles.emptyThread}>
              <div className={styles.emptyIcon}>💬</div>
              <p className={styles.emptyThreadText}>Select a client to start messaging</p>
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
                <Avatar name={selectedClient?.name || 'Client'} size="sm" />
                <div className={styles.threadMeta}>
                  <span className={styles.threadTitle}>{selectedClient?.name || 'Client'}</span>
                  <span className={styles.threadSub}>Client</span>
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
                  ref={inputRef}
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
