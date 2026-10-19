import { Link } from 'react-router-dom';
import { Crown, Users } from 'lucide-react';
import SkillChip from './SkillChip';
import { ROLE_LABELS } from '../utils/constants';

// Compact team summary. `action` lets the parent add a button (e.g. Request to Join).
export default function TeamCard({ team, action, showHackathon = true }) {
  const isFull = team.members.length >= team.maxTeamSize;
  return (
    <div className="card flex flex-col p-5">
      <div className="mb-1 flex items-start justify-between gap-2">
        <Link to={`/teams/${team.id}`} className="font-semibold text-slate-900 hover:text-indigo-700">{team.name}</Link>
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${isFull ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'}`}>
          <Users size={12} /> {team.members.length}/{team.maxTeamSize}
        </span>
      </div>
      {showHackathon && <p className="text-xs text-indigo-600">{team.hackathon.title}</p>}
      <p className="mt-2 line-clamp-2 text-sm text-slate-500">{team.description}</p>
      <p className="mt-3 flex items-center gap-1 text-xs text-slate-500"><Crown size={12} className="text-amber-500" /> Led by {team.leader.name}</p>
      {team.requiredRoles.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {team.requiredRoles.map((r) => <SkillChip key={r} label={ROLE_LABELS[r]} variant="role" />)}
        </div>
      )}
      <div className="mt-4 flex items-center justify-between gap-2 pt-1">
        <Link to={`/teams/${team.id}`} className="text-sm font-medium text-indigo-600 hover:underline">View team →</Link>
        {action}
      </div>
    </div>
  );
}
