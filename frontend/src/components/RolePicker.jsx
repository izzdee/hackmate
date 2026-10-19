import SkillChip from './SkillChip';
import { ROLES, ROLE_LABELS } from '../utils/constants';

// Toggleable role chips (preferred roles / required roles)
export default function RolePicker({ value, onChange }) {
  const toggle = (role) => onChange(value.includes(role) ? value.filter((r) => r !== role) : [...value, role]);
  return (
    <div className="flex flex-wrap gap-2">
      {ROLES.map((role) => (
        <SkillChip key={role} label={ROLE_LABELS[role]} variant={value.includes(role) ? 'selected' : 'neutral'} onClick={() => toggle(role)} />
      ))}
    </div>
  );
}
