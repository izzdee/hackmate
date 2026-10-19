import { useState } from 'react';
import { SearchX, UserPlus } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import useLedTeams from '../hooks/useLedTeams';
import { searchUsers } from '../services/userService';
import { getSkills } from '../services/skillService';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import EmptyState, { ErrorState } from '../components/EmptyState';
import UserCard from '../components/UserCard';
import InviteModal from '../components/InviteModal';
import { ROLES, ROLE_LABELS } from '../utils/constants';

export default function SearchPage() {
  const [skill, setSkill] = useState(''); // skill NAME, as the contract's ?skill=React expects
  const [role, setRole] = useState('');
  const [inviteUser, setInviteUser] = useState(null);
  const { ledTeams } = useLedTeams();

  const { data: skills } = useFetch(getSkills, []);
  // Re-runs automatically whenever a filter changes
  const { data: users, loading, error, reload } = useFetch(() => searchUsers({ skill, role }), [skill, role]);

  const canInvite = ledTeams?.length > 0;
  const selectedSkillId = skills?.find((s) => s.name === skill)?.id;

  return (
    <div>
      <PageHeader title="Find teammates" subtitle="Filter students by skill and preferred role." />

      <div className="card mb-6 grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="skill-filter" className="label">Skill</label>
          <select id="skill-filter" className="input" value={skill} onChange={(e) => setSkill(e.target.value)} disabled={!skills}>
            <option value="">Any skill</option>
            {skills?.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="role-filter" className="label">Role</label>
          <select id="role-filter" className="input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Any role</option>
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </div>
        <button className="btn-secondary" onClick={() => { setSkill(''); setRole(''); }} disabled={!skill && !role}>Clear</button>
      </div>

      {!loading && !error && (
        <p className="mb-3 text-sm text-slate-500">{users.length} student{users.length === 1 ? '' : 's'} found</p>
      )}

      {loading ? <Spinner fullPage label="Searching…" />
        : error ? <ErrorState message={error} onRetry={reload} />
        : users.length === 0 ? (
          <EmptyState icon={SearchX} title="No students match these filters" message="Try another skill or role." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((u) => (
              <UserCard key={u.id} user={u} highlightSkillIds={selectedSkillId ? [selectedSkillId] : []}
                action={canInvite && (
                  <button className="btn-primary btn-sm" onClick={() => setInviteUser(u)}><UserPlus size={14} /> Invite</button>
                )} />
            ))}
          </div>
        )}

      <InviteModal key={inviteUser?.id} open={Boolean(inviteUser)} user={inviteUser} ledTeams={ledTeams} onClose={() => setInviteUser(null)} />
    </div>
  );
}
