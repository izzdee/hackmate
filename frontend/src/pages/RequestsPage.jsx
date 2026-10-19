import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check, Inbox, Mail, Send, UserPlus, X } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { acceptRequest, getMyRequests, rejectRequest } from '../services/requestService';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import EmptyState, { ErrorState } from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { timeAgo } from '../utils/format';

const TeamLink = ({ team }) => <Link to={`/teams/${team.id}`} className="font-semibold text-indigo-700 hover:underline">{team.name}</Link>;
const UserLink = ({ user }) => <Link to={`/users/${user.id}`} className="font-semibold text-slate-900 hover:underline">{user.name}</Link>;

// Human sentence for a request, depending on direction and type
function describe(req, direction) {
  if (direction === 'incoming') {
    return req.type === 'INVITE'
      ? <>You were invited to join <TeamLink team={req.team} /></>
      : <><UserLink user={req.user} /> wants to join <TeamLink team={req.team} /></>;
  }
  return req.type === 'INVITE'
    ? <>You invited <UserLink user={req.user} /> to <TeamLink team={req.team} /></>
    : <>You asked to join <TeamLink team={req.team} /></>;
}

function RequestRow({ req, direction, busy, onAccept, onReject }) {
  const Icon = req.type === 'INVITE' ? UserPlus : Send;
  const canAnswer = direction === 'incoming' && req.status === 'PENDING';
  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${req.type === 'INVITE' ? 'bg-violet-50 text-violet-600' : 'bg-sky-50 text-sky-600'}`}>
          <Icon size={16} />
        </span>
        <div>
          <p className="text-sm text-slate-700">{describe(req, direction)}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span>{req.type === 'INVITE' ? 'Invite' : 'Join request'}</span>·<span>{timeAgo(req.createdAt)}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 pl-12 sm:pl-0">
        {canAnswer ? (
          <>
            <button className="btn-secondary btn-sm" onClick={onReject} disabled={busy}><X size={14} /> Reject</button>
            <button className="btn-primary btn-sm" onClick={onAccept} disabled={busy}>
              {busy ? <Spinner size={14} /> : <Check size={14} />} Accept
            </button>
          </>
        ) : <StatusBadge status={req.status} />}
      </div>
    </li>
  );
}

export default function RequestsPage() {
  const [tab, setTab] = useState('incoming');
  const [pendingOnly, setPendingOnly] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const { data, loading, error, reload, setData } = useFetch(getMyRequests, []);

  // Replace one request in local state with the updated version returned by the API
  const replaceRequest = (updated) =>
    setData((d) => ({
      incoming: d.incoming.map((r) => (r.id === updated.id ? updated : r)),
      outgoing: d.outgoing.map((r) => (r.id === updated.id ? updated : r)),
    }));

  const answer = async (req, accept) => {
    setBusyId(req.id);
    try {
      const updated = accept ? await acceptRequest(req.id) : await rejectRequest(req.id);
      replaceRequest(updated);
      if (accept) {
        toast.success(req.type === 'INVITE' ? `You joined ${req.team.name}!` : `${req.user.name} joined ${req.team.name}`);
      } else {
        toast.success('Request rejected');
      }
    } catch {
      // toast shown by shared error handler; refresh in case the request changed meanwhile
      reload({ silent: true });
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = (list) => list.filter((r) => r.status === 'PENDING').length;
  const tabs = [
    { key: 'incoming', label: 'Incoming', icon: Inbox },
    { key: 'outgoing', label: 'Outgoing', icon: Mail },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Requests" subtitle="Invitations to you and join requests to your teams, plus what you've sent." />

      <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex gap-6" role="tablist">
          {tabs.map(({ key, label, icon: Icon }) => {
            const count = data ? pendingCount(data[key]) : 0;
            return (
              <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition ${tab === key ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <Icon size={16} /> {label}
                {count > 0 && <span className="rounded-full bg-indigo-100 px-1.5 text-xs text-indigo-700">{count}</span>}
              </button>
            );
          })}
        </div>
        <label className="mb-3 flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" className="h-4 w-4 accent-indigo-600" checked={pendingOnly} onChange={(e) => setPendingOnly(e.target.checked)} />
          Pending only
        </label>
      </div>

      {loading ? <Spinner fullPage label="Loading requests…" />
        : error ? <ErrorState message={error} onRetry={reload} />
        : (() => {
          const list = data[tab].filter((r) => !pendingOnly || r.status === 'PENDING');
          if (list.length === 0) {
            return (
              <EmptyState icon={tab === 'incoming' ? Inbox : Mail}
                title={pendingOnly ? 'Nothing pending' : tab === 'incoming' ? 'No incoming requests' : 'No outgoing requests'}
                message={tab === 'incoming'
                  ? 'Invites from team leaders and join requests to your teams will show up here.'
                  : 'Request to join a team or invite teammates to see them here.'} />
            );
          }
          return (
            <ul className="card divide-y divide-slate-100">
              {list.map((r) => (
                <RequestRow key={r.id} req={r} direction={tab} busy={busyId === r.id}
                  onAccept={() => answer(r, true)} onReject={() => answer(r, false)} />
              ))}
            </ul>
          );
        })()}
    </div>
  );
}
