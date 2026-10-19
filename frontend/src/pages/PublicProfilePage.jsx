import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Briefcase, Clock, Mail, Pencil, UserPlus } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import useLedTeams from '../hooks/useLedTeams';
import { useAuth } from '../context/AuthContext';
import { getUser } from '../services/userService';
import Spinner from '../components/Spinner';
import { ErrorState } from '../components/EmptyState';
import Avatar from '../components/Avatar';
import SkillChip from '../components/SkillChip';
import InviteModal from '../components/InviteModal';
import { AVAILABILITY_LABELS, EXPERIENCE_LABELS, ROLE_LABELS } from '../utils/constants';

export default function PublicProfilePage() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const { ledTeams } = useLedTeams();
  const [inviteOpen, setInviteOpen] = useState(false);
  const { data: user, loading, error, reload } = useFetch(() => getUser(id), [id]);

  if (loading) return <Spinner fullPage label="Loading profile…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const isMe = user.id === me.id;
  // Only leaders can invite, and only students can be invited
  const canInvite = !isMe && user.role === 'STUDENT' && ledTeams?.length > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/search" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft size={16} /> Find teammates</Link>

      <section className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-indigo-500 to-violet-500" />
        <div className="px-6 pb-6">
          <span className="-mt-8 inline-block rounded-full ring-4 ring-white"><Avatar user={user} size="lg" /></span>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
              <p className="flex items-center gap-1 text-sm text-slate-500"><Mail size={14} /> {user.email}</p>
            </div>
            {isMe ? (
              <Link to="/profile" className="btn-secondary"><Pencil size={16} /> Edit profile</Link>
            ) : canInvite && (
              <button className="btn-primary" onClick={() => setInviteOpen(true)}><UserPlus size={16} /> Invite to my team</button>
            )}
          </div>

          {user.bio && <p className="mt-5 text-slate-700">{user.bio}</p>}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <Briefcase size={16} className="text-slate-400" /> <span className="text-slate-500">Experience:</span>
              <span className="font-medium text-slate-800">{EXPERIENCE_LABELS[user.experienceLevel]}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <Clock size={16} className="text-slate-400" /> <span className="text-slate-500">Availability:</span>
              <span className="font-medium text-slate-800">{AVAILABILITY_LABELS[user.availability]}</span>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Preferred roles</h2>
            {user.preferredRoles.length === 0 ? <p className="text-sm text-slate-400">None listed</p> : (
              <div className="flex flex-wrap gap-1.5">{user.preferredRoles.map((r) => <SkillChip key={r} label={ROLE_LABELS[r]} variant="role" />)}</div>
            )}
          </div>
          <div className="mt-5">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Skills</h2>
            {user.skills.length === 0 ? <p className="text-sm text-slate-400">No skills listed</p> : (
              <div className="flex flex-wrap gap-1.5">{user.skills.map((s) => <SkillChip key={s.id} label={s.name} />)}</div>
            )}
          </div>
        </div>
      </section>

      <InviteModal open={inviteOpen} user={user} ledTeams={ledTeams} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
