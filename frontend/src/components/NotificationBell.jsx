import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { getNotifications, getUnreadCount, markAsRead } from '../services/notificationService';
import { errorMessage } from '../api/errorHandler';
import useClickOutside from '../hooks/useClickOutside';
import Spinner from './Spinner';
import { timeAgo } from '../utils/format';

const POLL_MS = 30_000; // poll /notifications/unread-count every 30 seconds

export default function NotificationBell() {
  const location = useLocation();
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState({ items: null, loading: false, error: '' });
  const [busyId, setBusyId] = useState(null); // id being marked, or 'all'
  const boxRef = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(boxRef, close, open);

  const refreshCount = useCallback(() => {
    getUnreadCount().then((r) => setCount(r.count)).catch(() => {});
  }, []);

  // Poll every 30s, and also refresh whenever the user navigates (actions may create notifications)
  useEffect(() => {
    refreshCount();
    const timer = setInterval(refreshCount, POLL_MS);
    return () => clearInterval(timer);
  }, [refreshCount]);
  useEffect(refreshCount, [location.pathname, refreshCount]);

  const loadList = async () => {
    setList((l) => ({ ...l, loading: true, error: '' }));
    try {
      const items = await getNotifications();
      setList({ items, loading: false, error: '' });
      setCount(items.filter((n) => !n.isRead).length);
    } catch (err) {
      setList({ items: null, loading: false, error: errorMessage(err) });
    }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) loadList();
  };

  const markOne = async (n) => {
    setBusyId(n.id);
    try {
      const updated = await markAsRead(n.id);
      setList((l) => ({ ...l, items: l.items.map((x) => (x.id === n.id ? updated : x)) }));
      setCount((c) => Math.max(0, c - 1));
    } catch {
      /* toast shown by shared error handler */
    } finally {
      setBusyId(null);
    }
  };

  // No bulk endpoint in the contract, so mark each unread one individually
  const markAll = async () => {
    const unread = list.items.filter((n) => !n.isRead);
    setBusyId('all');
    try {
      const updated = await Promise.all(unread.map((n) => markAsRead(n.id)));
      const byId = Object.fromEntries(updated.map((n) => [n.id, n]));
      setList((l) => ({ ...l, items: l.items.map((x) => byId[x.id] || x) }));
      setCount(0);
      toast.success('All notifications marked as read');
    } catch {
      loadList();
    } finally {
      setBusyId(null);
    }
  };

  const unreadInList = list.items?.some((n) => !n.isRead);

  return (
    <div className="relative" ref={boxRef}>
      <button onClick={toggle} className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label={`Notifications (${count} unread)`} aria-expanded={open}>
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-2 top-16 z-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="font-semibold text-slate-900">Notifications</p>
            {unreadInList && (
              <button className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline disabled:opacity-50" onClick={markAll} disabled={busyId !== null}>
                <CheckCheck size={14} /> Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {list.loading && !list.items ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : list.error ? (
              <div className="px-4 py-6 text-center text-sm text-red-600">
                {list.error} <button className="ml-1 underline" onClick={loadList}>Retry</button>
              </div>
            ) : !list.items?.length ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-sm text-slate-400"><BellOff size={22} /> You&apos;re all caught up</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {list.items.map((n) => (
                  <li key={n.id} className={`flex items-start gap-3 px-4 py-3 ${n.isRead ? '' : 'bg-indigo-50/50'}`}>
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-indigo-500'}`} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${n.isRead ? 'text-slate-500' : 'text-slate-800'}`}>{n.message}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && (
                      <button className="shrink-0 text-xs font-medium text-indigo-600 hover:underline disabled:opacity-50" onClick={() => markOne(n)} disabled={busyId !== null}>
                        {busyId === n.id ? <Spinner size={12} /> : 'Mark read'}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
