import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import SkillChip from './SkillChip';
import { AVAILABILITY_LABELS, EXPERIENCE_LABELS, ROLE_LABELS } from '../utils/constants';

// Summary of a User. `highlightSkillIds` marks skills a team needs; `action` = e.g. Invite button.
export default function UserCard({ user, action, badge, highlightSkillIds = [], compact = false }) {
  return (
    <div className={`card flex flex-col ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-start gap-3">
        <Avatar user={user} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/users/${user.id}`} className="truncate font-semibold text-slate-900 hover:text-indigo-700">{user.name}</Link>
            {badge}
          </div>
          <p className="text-xs text-slate-500">
            {EXPERIENCE_LABELS[user.experienceLevel]} · {AVAILABILITY_LABELS[user.availability]}
          </p>
        </div>
      </div>
      {!compact && user.bio && <p className="mt-3 line-clamp-2 text-sm text-slate-600">{user.bio}</p>}
      {user.preferredRoles.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {user.preferredRoles.map((r) => <SkillChip key={r} label={ROLE_LABELS[r]} variant="role" />)}
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {user.skills.length === 0
          ? <span className="text-xs text-slate-400">No skills listed</span>
          : user.skills.map((s) => (
            <SkillChip key={s.id} label={s.name} variant={highlightSkillIds.includes(s.id) ? 'covered' : 'neutral'} />
          ))}
      </div>
      {action && <div className="mt-4 flex justify-end">{action}</div>}
    </div>
  );
}
