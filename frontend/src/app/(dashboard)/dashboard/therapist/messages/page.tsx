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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedUserId(withUserId);
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
          ? requests.map((r: { userId: string; clientName: string }) => ({ id: r.userId, name: r.clientName, sessionCount: 0, lastSessionDate: '', progressScore: 0, metricLabel: '', metricValue: '' }))
          : [];
        const seen = new Set(clientList.map((c) => c.id));
        fromRequests.forEach((r) => {
          if (!seen.has(r.id)) {
            seen.add(r.id);
            clientList.push(r);
          }
        });
        setClients(clientList);
      } catch {
        setClients([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  useEffect(() => {
    if (!selectedUserId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    api.getMessages(selectedUserId).then((list) => {
      if (!cancelled) setMessages(Array.isArray(list) ? list : []);
    }).catch(() => { if (!cancelled) setMessages([]); });
    return () => { cancelled = true; };
  }, [selectedUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      <h2 className={styles.title}>Messages</h2>
      <p className={styles.sub}>Message your clients. Select a client to view and send messages.</p>

      <div className={styles.layout}>
        <div className={styles.sidebar}>
          {clients.length === 0 ? (
            <p className={styles.empty}>No clients yet. Clients appear here after sessions or consultation requests.</p>
          ) : (
            clients.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`${styles.clientRow} ${selectedUserId === c.id ? styles.clientRowActive : ''}`}
                onClick={() => { setSelectedUserId(c.id); router.replace(`/dashboard/therapist/messages?with=${c.id}`, { scroll: false }); }}
              >
                <Avatar name={c.name} size="sm" />
                <span className={styles.clientName}>{c.name}</span>
              </button>
            ))
          )}
        </div>
        <div className={styles.thread}>
          {!selectedUserId ? (
            <p className={styles.placeholder}>Select a client to view messages.</p>
          ) : (
            <>
              <div className={styles.threadHeader}>
                <Avatar name={selectedClient?.name || 'Client'} size="md" />
                <span className={styles.threadTitle}>{selectedClient?.name || 'Client'}</span>
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
