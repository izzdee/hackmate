import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Building2, CalendarDays, Clock, Globe, MapPin, Plus, Send, Users } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { getHackathon } from '../services/hackathonService';
import { getTeams } from '../services/teamService';
import { getMyRequests, requestToJoin } from '../services/requestService';
import Spinner from '../components/Spinner';
import EmptyState, { ErrorState } from '../components/EmptyState';
import TeamCard from '../components/TeamCard';
import TeamFormModal from '../components/TeamFormModal';
import { MODE_LABELS } from '../utils/constants';
import { formatDate, todayIso } from '../utils/format';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Icon size={16} /></span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function HackathonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [joiningId, setJoiningId] = useState(null);

  const { data, loading, error, reload, setData } = useFetch(async () => {
    const [hackathon, teams, requests] = await Promise.all([getHackathon(id), getTeams(id), getMyRequests()]);
    return { hackathon, teams, requests };
  }, [id]);

  if (loading) return <Spinner fullPage label="Loading hackathon…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const { hackathon, teams, requests } = data;
  const isPast = hackathon.endDate < todayIso();
  const myTeam = teams.find((t) => t.members.some((m) => m.id === user.id));
  // Teams I already have a pending join request for
  const pendingTeamIds = new Set(
    requests.outgoing.filter((r) => r.type === 'JOIN_REQUEST' && r.status === 'PENDING').map((r) => r.team.id)
  );
  const canParticipate = !isAdmin && !isPast && !myTeam;

  const handleJoin = async (team) => {
    setJoiningId(team.id);
    try {
      const req = await requestToJoin(team.id);
      toast.success(`Join request sent to ${team.name}`);
      // add the new request locally so the button switches to "Requested"
      setData((d) => ({ ...d, requests: { ...d.requests, outgoing: [req, ...d.requests.outgoing] } }));
    } catch {
      // toast shown by shared error handler
    } finally {
      setJoiningId(null);
    }
  };

  const joinAction = (team) => {
    if (!canParticipate) return null;
    if (pendingTeamIds.has(team.id)) return <span className="text-xs font-medium text-amber-600">Request pending</span>;
    if (team.members.length >= team.maxTeamSize) return <span className="text-xs text-slate-400">Team full</span>;
    return (
      <button className="btn-primary btn-sm" onClick={() => handleJoin(team)} disabled={joiningId !== null}>
        {joiningId === team.id ? <Spinner size={14} /> : <Send size={14} />} Request to Join
      </button>
    );
  };

  return (
    <div className="space-y-8">
      <Link to="/hackathons" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft size={16} /> All hackathons</Link>

      <section className="card overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-8 text-white">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
            {hackathon.mode === 'ONLINE' ? <Globe size={12} /> : <MapPin size={12} />} {MODE_LABELS[hackathon.mode]}
          </span>
          <h1 className="mt-3 text-3xl font-bold">{hackathon.title}</h1>
          <p className="mt-2 max-w-2xl text-indigo-100">{hackathon.description}</p>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <InfoRow icon={Building2} label="Organizer" value={hackathon.organizer} />
          <InfoRow icon={CalendarDays} label="Dates" value={`${formatDate(hackathon.startDate)} – ${formatDate(hackathon.endDate)}`} />
          <InfoRow icon={Clock} label="Registration deadline" value={formatDate(hackathon.registrationDeadline)} />
          <InfoRow icon={Users} label="Team size" value={`Up to ${hackathon.maxTeamSize} members`} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Teams ({teams.length})</h2>
            {myTeam && (
              <p className="text-sm text-slate-500">
                You&apos;re in <Link to={`/teams/${myTeam.id}`} className="font-medium text-indigo-600 hover:underline">{myTeam.name}</Link> for this hackathon.
              </p>
            )}
            {isPast && <p className="text-sm text-slate-500">This hackathon has ended.</p>}
          </div>
          {canParticipate && (
            <button className="btn-primary" onClick={() => setCreateOpen(true)}><Plus size={16} /> Create Team</button>
          )}
        </div>

        {teams.length === 0 ? (
          <EmptyState icon={Users} title="No teams yet"
            message={canParticipate ? 'Be the first to create a team for this hackathon!' : 'No teams have been formed for this hackathon.'}
            action={canParticipate && <button className="btn-primary btn-sm" onClick={() => setCreateOpen(true)}><Plus size={14} /> Create Team</button>} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((t) => <TeamCard key={t.id} team={t} showHackathon={false} action={joinAction(t)} />)}
          </div>
        )}
      </section>

      <TeamFormModal open={createOpen} onClose={() => setCreateOpen(false)} hackathonId={hackathon.id}
        onSaved={(team) => { setCreateOpen(false); navigate(`/teams/${team.id}`); }} />
    </div>
  );
}
