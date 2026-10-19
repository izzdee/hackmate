import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Inbox, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { getMyTeams } from '../services/teamService';
import { getMyRequests } from '../services/requestService';
import { getHackathons } from '../services/hackathonService';
import Spinner from '../components/Spinner';
import EmptyState, { ErrorState } from '../components/EmptyState';
import TeamCard from '../components/TeamCard';
import HackathonCard from '../components/HackathonCard';
import { todayIso } from '../utils/format';

function StatTile({ icon: Icon, label, value, to, tone }) {
  return (
    <Link to={to} className="card flex items-center gap-4 p-5 transition hover:shadow-md">
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon size={20} /></span>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  // Load the three dashboard sources in parallel
  const { data, loading, error, reload } = useFetch(async () => {
    const [teams, requests, hackathons] = await Promise.all([getMyTeams(), getMyRequests(), getHackathons()]);
    return { teams, requests, hackathons };
  }, []);

  if (loading) return <Spinner fullPage label="Loading your dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const today = todayIso();
  const pendingIncoming = data.requests.incoming.filter((r) => r.status === 'PENDING').length;
  const upcoming = data.hackathons.filter((h) => h.startDate >= today);
  const profileIncomplete = user.role === 'STUDENT' && (user.skills.length === 0 || user.preferredRoles.length === 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hi, {user.name.split(' ')[0]} 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening with your teams.</p>
      </div>

      {profileIncomplete && (
        <div className="flex flex-col gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-indigo-800">
            <Sparkles size={18} /> Add your skills and preferred roles so team leaders can find you in matches.
          </p>
          <Link to="/profile" className="btn-primary btn-sm">Complete profile</Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile icon={Users} label="My teams" value={data.teams.length} to="#my-teams" tone="bg-indigo-50 text-indigo-600" />
        <StatTile icon={Inbox} label="Pending requests for you" value={pendingIncoming} to="/requests" tone="bg-amber-50 text-amber-600" />
        <StatTile icon={CalendarDays} label="Upcoming hackathons" value={upcoming.length} to="/hackathons" tone="bg-emerald-50 text-emerald-600" />
      </div>

      <section id="my-teams">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">My teams</h2>
        {data.teams.length === 0 ? (
          <EmptyState icon={Users} title="You're not in a team yet"
            message="Browse hackathons to create a team or request to join one."
            action={<Link to="/hackathons" className="btn-primary btn-sm">Browse hackathons</Link>} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.teams.map((t) => <TeamCard key={t.id} team={t} />)}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming hackathons</h2>
          <Link to="/hackathons" className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">View all <ArrowRight size={14} /></Link>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No upcoming hackathons" message="Check back soon for new events." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.slice(0, 3).map((h) => <HackathonCard key={h.id} hackathon={h} />)}
          </div>
        )}
      </section>
    </div>
  );
}
