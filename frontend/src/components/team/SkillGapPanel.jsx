import { AlertCircle, CheckCircle2, Target } from 'lucide-react';
import SkillChip from '../SkillChip';
import ScoreBar from '../ScoreBar';
import { ROLE_LABELS } from '../../utils/constants';

// Shows which required skills are covered (green) vs missing (red), plus uncovered roles.
//   gap: Skill[] from GET /teams/{id}/skill-gap
export default function SkillGapPanel({ team, gap }) {
  const missingIds = new Set(gap.map((s) => s.id));
  const coveredCount = team.requiredSkills.length - missingIds.size;

  // Roles: a required role is covered if any member lists it as a preferred role
  const memberRoles = new Set(team.members.flatMap((m) => m.preferredRoles));
  const uncoveredRoles = team.requiredRoles.filter((r) => !memberRoles.has(r));

  return (
    <div className="card p-5">
      <h3 className="flex items-center gap-2 font-semibold text-slate-900"><Target size={18} className="text-indigo-600" /> Skill gap</h3>

      {team.requiredSkills.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No required skills set for this team.</p>
      ) : (
        <>
          <div className="mt-4">
            <ScoreBar value={coveredCount} max={team.requiredSkills.length} label="Required skills covered" />
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {team.requiredSkills.map((s) => (
              <SkillChip key={s.id} label={s.name} variant={missingIds.has(s.id) ? 'missing' : 'covered'}
                title={missingIds.has(s.id) ? 'No member has this skill yet' : 'Covered by a team member'} />
            ))}
          </div>
          {missingIds.size === 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-emerald-700"><CheckCircle2 size={16} /> All required skills are covered!</p>
          )}
        </>
      )}

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-sm font-medium text-slate-700">Uncovered roles</p>
        {team.requiredRoles.length === 0 ? (
          <p className="mt-1 text-sm text-slate-500">No roles specified.</p>
        ) : uncoveredRoles.length === 0 ? (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-emerald-700"><CheckCircle2 size={16} /> Every role is filled</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {uncoveredRoles.map((r) => (
              <li key={r} className="flex items-center gap-2 text-sm text-red-700"><AlertCircle size={14} /> {ROLE_LABELS[r]}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
