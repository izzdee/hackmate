import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Crown, LogOut, Pencil, Send, Sparkles, Trash2, Users } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { deleteTeam, getMatches, getSkillGap, getTeam, leaveTeam } from '../services/teamService';
import { getMyRequests, inviteUser, requestToJoin } from '../services/requestService';
import { errorMessage } from '../api/errorHandler';
import Spinner from '../components/Spinner';
import EmptyState, { ErrorState } from '../components/EmptyState';
import UserCard from '../components/UserCard';
import SkillChip from '../components/SkillChip';
import TeamFormModal from '../components/TeamFormModal';
import { ConfirmModal } from '../components/Modal';
import SkillGapPanel from '../components/team/SkillGapPanel';
import MatchCard from '../components/team/MatchCard';
import { ROLE_LABELS } from '../utils/constants';

export default function TeamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [tab, setTab] = useState('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // 'delete' | 'leave' | null
  const [busy, setBusy] = useState(false);

  // Matches are loaded lazily, only when the leader opens the tab
  const [matches, setMatches] = useState({ data: null, loading: false, error: '' });
  const [invitingId, setInvitingId] = useState(null);

  const { data, loading, error, reload, setData } = useFetch(async () => {
    const [team, gap, requests] = await Promise.all([getTeam(id), getSkillGap(id), getMyRequests()]);
    return { team, gap, requests };
  }, [id]);

  const loadMatches = useCallback(async () => {
    setMatches({ data: null, loading: true, error: '' });
    try {
      setMatches({ data: await getMatches(id), loading: false, error: '' });
    } catch (err) {
      setMatches({ data: null, loading: false, error: errorMessage(err) });
    }
  }, [id]);

  if (loading) return <Spinner fullPage label="Loading team…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const { team, gap, requests } = data;
  const isLeader = team.leader.id === user.id;
  const isMember = team.members.some((m) => m.id === user.id);
  const isFull = team.members.length >= team.maxTeamSize;
  const gapSkillIds = gap.map((s) => s.id);
  const requiredSkillIds = team.requiredSkills.map((s) => s.id);

  // Pending requests involving this team (from GET /requests/me)
  const pendingForTeam = (type) =>
    requests.outgoing.filter((r) => r.team.id === team.id && r.type === type && r.status === 'PENDING');
  const invitedUserIds = new Set(pendingForTeam('INVITE').map((r) => r.user.id));
  const hasPendingJoin = pendingForTeam('JOIN_REQUEST').length > 0;

  const addOutgoing = (req) =>
    setData((d) => ({ ...d, requests: { ...d.requests, outgoing: [req, ...d.requests.outgoing] } }));

  const openTab = (name) => {
    setTab(name);
    if (name === 'matches' && !matches.data && !matches.loading) loadMatches();
  };

  const handleInvite = async (candidate) => {
    setInvitingId(candidate.id);
    try {
      const req = await inviteUser(team.id, candidate.id);
      addOutgoing(req);
      toast.success(`Invite sent to ${candidate.name}`);
    } catch {
      // toast shown by shared error handler
    } finally {
      setInvitingId(null);
    }
  };

  const handleJoin = async () => {
    setBusy(true);
    try {
      addOutgoing(await requestToJoin(team.id));
      toast.success('Join request sent to the team leader');
    } catch {
      /* handled */
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async () => {
    setBusy(true);
    try {
      if (confirm === 'delete') {
        await deleteTeam(team.id);
        toast.success('Team deleted');
        navigate(`/hackathons/${team.hackathon.id}`);
        return;
      }
      await leaveTeam(team.id);
      toast.success(`You left ${team.name}`);
      setConfirm(null);
      reload({ silent: true });
    } catch {
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  const handleSaved = async (updated) => {
    setEditOpen(false);
    // required skills may have changed → refresh gap and matches
    const newGap = await getSkillGap(team.id).catch(() => gap);
    setData((d) => ({ ...d, team: updated, gap: newGap }));
    setMatches({ data: null, loading: false, error: '' });
    if (tab === 'matches') loadMatches();
  };

  // ----- header actions depend on who is looking -----
  let actions = null;
  if (isLeader) {
    actions = (<>
      <button className="btn-secondary" onClick={() => setEditOpen(true)}><Pencil size={16} /> Edit</button>
      <button className="btn-danger" onClick={() => setConfirm('delete')}><Trash2 size={16} /> Delete</button>
    </>);
  } else if (isMember) {
    actions = <button className="btn-secondary text-red-600" onClick={() => setConfirm('leave')}><LogOut size={16} /> Leave team</button>;
  } else if (!isAdmin) {
    actions = hasPendingJoin
      ? <span className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">Join request pending</span>
      : <button className="btn-primary" onClick={handleJoin} disabled={busy || isFull}>
          {busy ? <Spinner size={16} /> : <Send size={16} />} {isFull ? 'Team full' : 'Request to Join'}
        </button>;
  }

  const tabClass = (name) =>
    `flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition ${tab === name ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`;

  return (
    <div className="space-y-6">
      <Link to={`/hackathons/${team.hackathon.id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> {team.hackathon.title}
      </Link>

      {/* ---------- Header ---------- */}
      <section className="card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{team.name}</h1>
              {isLeader && <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"><Crown size={12} /> You lead this team</span>}
              {!isLeader && isMember && <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">Member</span>}
            </div>
            <Link to={`/hackathons/${team.hackathon.id}`} className="text-sm font-medium text-indigo-600 hover:underline">{team.hackathon.title}</Link>
            {team.description && <p className="mt-2 max-w-2xl text-slate-600">{team.description}</p>}
            {team.requiredRoles.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-500">Looking for:</span>
                {team.requiredRoles.map((r) => <SkillChip key={r} label={ROLE_LABELS[r]} variant="role" />)}
              </div>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-slate-400" />
              <span className="text-2xl font-bold text-slate-900">{team.members.length}</span>
              <span className="text-slate-400">/ {team.maxTeamSize} members</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: team.maxTeamSize }).map((_, i) => (
                <span key={i} className={`h-2 w-6 rounded-full ${i < team.members.length ? 'bg-indigo-500' : 'bg-slate-200'}`} />
              ))}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </div>
        </div>
      </section>

      {/* ---------- Tabs ---------- */}
      {isLeader && (
        <div className="flex gap-6 border-b border-slate-200" role="tablist">
          <button role="tab" aria-selected={tab === 'overview'} className={tabClass('overview')} onClick={() => openTab('overview')}><Users size={16} /> Overview</button>
          <button role="tab" aria-selected={tab === 'matches'} className={tabClass('matches')} onClick={() => openTab('matches')}><Sparkles size={16} /> Find Matches</button>
        </div>
      )}

      {tab === 'overview' || !isLeader ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="space-y-4 lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">Members</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {team.members.map((m) => (
                <UserCard key={m.id} user={m} compact highlightSkillIds={requiredSkillIds}
                  badge={m.id === team.leader.id && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"><Crown size={12} /> Leader</span>
                  )} />
              ))}
              {!isFull && Array.from({ length: team.maxTeamSize - team.members.length }).map((_, i) => (
                <div key={`open-${i}`} className="flex min-h-[120px] items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-400">
                  {isLeader
                    ? <button className="hover:text-indigo-600" onClick={() => openTab('matches')}>+ Find a teammate</button>
                    : 'Open spot'}
                </div>
              ))}
            </div>
          </section>
          <aside>
            <SkillGapPanel team={team} gap={gap} />
          </aside>
        </div>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Ranked candidates</h2>
              <p className="text-sm text-slate-500">
                Rule-based score: skill /50 · role /25 · experience /15 · availability /10.
                {gap.length > 0 && <> Skills scored against your {gap.length} missing skill{gap.length > 1 ? 's' : ''}.</>}
              </p>
            </div>
            {isFull && <span className="text-sm font-medium text-amber-600">Your team is full — invites are disabled.</span>}
          </div>
          {matches.loading ? <Spinner fullPage label="Ranking candidates…" />
            : matches.error ? <ErrorState message={matches.error} onRetry={loadMatches} />
            : !matches.data?.length ? (
              <EmptyState icon={Sparkles} title="No candidates available" message="Every student is already in a team for this hackathon." />
            ) : (
              <div className="space-y-3">
                {matches.data.map((m, i) => (
                  <MatchCard key={m.user.id} match={m} rank={i + 1} gapSkillIds={gapSkillIds}
                    invited={invitedUserIds.has(m.user.id)} inviting={invitingId === m.user.id}
                    canInvite={!isFull && invitingId === null} onInvite={() => handleInvite(m.user)} />
                ))}
              </div>
            )}
        </section>
      )}

      <TeamFormModal open={editOpen} team={team} onClose={() => setEditOpen(false)} onSaved={handleSaved} />
      <ConfirmModal
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
        busy={busy}
        danger
        title={confirm === 'delete' ? 'Delete team?' : 'Leave team?'}
        message={confirm === 'delete'
          ? `This permanently deletes "${team.name}" and all its pending requests. Members will be notified.`
          : `You will be removed from "${team.name}". You can request to join again later.`}
        confirmLabel={confirm === 'delete' ? 'Delete team' : 'Leave team'}
      />
    </div>
  );
}
