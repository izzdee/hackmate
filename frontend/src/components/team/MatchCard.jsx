import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, UserPlus } from 'lucide-react';
import Avatar from '../Avatar';
import ScoreBar from '../ScoreBar';
import SkillChip from '../SkillChip';
import Spinner from '../Spinner';
import { AVAILABILITY_LABELS, EXPERIENCE_LABELS, ROLE_LABELS, SCORE_MAX } from '../../utils/constants';

const BREAKDOWN_ROWS = [
  { key: 'skill', label: 'Skill match' },
  { key: 'role', label: 'Role fit' },
  { key: 'experience', label: 'Experience' },
  { key: 'availability', label: 'Availability' },
];

const RANK_STYLES = ['bg-amber-400 text-white', 'bg-slate-400 text-white', 'bg-orange-400 text-white'];

// One ranked candidate from GET /teams/{id}/matches
export default function MatchCard({ match, rank, gapSkillIds, invited, inviting, canInvite, onInvite }) {
  const [open, setOpen] = useState(false);
  const { user, score, breakdown } = match;
  const matchingSkills = user.skills.filter((s) => gapSkillIds.includes(s.id));

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${RANK_STYLES[rank - 1] || 'bg-slate-100 text-slate-600'}`}>
          {rank}
        </span>
        <Avatar user={user} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <Link to={`/users/${user.id}`} className="font-semibold text-slate-900 hover:text-indigo-700">{user.name}</Link>
              <p className="text-xs text-slate-500">
                {EXPERIENCE_LABELS[user.experienceLevel]} · {AVAILABILITY_LABELS[user.availability]}
                {user.preferredRoles.length > 0 && <> · {user.preferredRoles.map((r) => ROLE_LABELS[r]).join(', ')}</>}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {invited ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"><Check size={14} /> Invited</span>
              ) : (
                <button className="btn-primary btn-sm" onClick={onInvite} disabled={!canInvite || inviting}
                  title={canInvite ? undefined : 'Team is full'}>
                  {inviting ? <Spinner size={14} /> : <UserPlus size={14} />} Invite
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1"><ScoreBar value={score} max={100} showValue={false} /></div>
            <span className="w-14 text-right text-lg font-bold text-slate-900">{score.toFixed(1)}</span>
          </div>

          {matchingSkills.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500">Fills gap:</span>
              {matchingSkills.map((s) => <SkillChip key={s.id} label={s.name} variant="covered" />)}
            </div>
          )}

          <button className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
            onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} />
            {open ? 'Hide' : 'Show'} score breakdown
          </button>
          {open && (
            <div className="mt-3 grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-2">
              {BREAKDOWN_ROWS.map((row) => (
                <ScoreBar key={row.key} label={row.label} value={breakdown[row.key]} max={SCORE_MAX[row.key]} thin />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
