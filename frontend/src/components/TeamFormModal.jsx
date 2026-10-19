import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import Spinner from './Spinner';
import SkillMultiSelect from './SkillMultiSelect';
import RolePicker from './RolePicker';
import { getSkills } from '../services/skillService';
import { createTeam, updateTeam } from '../services/teamService';

// Used for both "Create Team" (hackathonId given) and "Edit Team" (team given).
// Body sent matches the contract: {name, description, hackathonId, requiredSkillIds[], requiredRoles[]}
export default function TeamFormModal({ open, onClose, onSaved, hackathonId, team }) {
  const isEdit = Boolean(team);
  const [skills, setSkills] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', requiredSkillIds: [], requiredRoles: [] });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Reset the form each time the modal opens
  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(team
      ? { name: team.name, description: team.description || '', requiredSkillIds: team.requiredSkills.map((s) => s.id), requiredRoles: team.requiredRoles }
      : { name: '', description: '', requiredSkillIds: [], requiredRoles: [] });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load the skill list once, the first time the modal opens
  useEffect(() => {
    if (open && !skills) getSkills().then(setSkills).catch(() => setSkills([]));
  }, [open, skills]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Team name is required';
    else if (form.name.trim().length > 50) errs.name = 'Keep the name under 50 characters';
    if (form.requiredSkillIds.length === 0) errs.requiredSkillIds = 'Pick at least one skill your team needs';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      hackathonId: isEdit ? team.hackathon.id : Number(hackathonId),
      requiredSkillIds: form.requiredSkillIds,
      requiredRoles: form.requiredRoles,
    };
    setSaving(true);
    try {
      const saved = isEdit ? await updateTeam(team.id, body) : await createTeam(body);
      toast.success(isEdit ? 'Team updated' : `Team "${saved.name}" created`);
      onSaved(saved);
    } catch {
      // toast shown by shared error handler
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={saving ? () => {} : onClose} title={isEdit ? 'Edit team' : 'Create a team'} size="lg"
      footer={<>
        <button className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
        <button className="btn-primary" onClick={handleSubmit} disabled={saving || !skills}>
          {saving && <Spinner size={16} />} {isEdit ? 'Save changes' : 'Create team'}
        </button>
      </>}>
      {!skills ? <Spinner fullPage /> : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="team-name" className="label">Team name</label>
            <input id="team-name" className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Code Crusaders" autoFocus />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="team-desc" className="label">Description</label>
            <textarea id="team-desc" rows={3} className="input" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="What are you building?" />
          </div>
          <div>
            <label htmlFor="team-skills" className="label">Required skills</label>
            <SkillMultiSelect id="team-skills" allSkills={skills} value={form.requiredSkillIds} onChange={(v) => set('requiredSkillIds', v)} />
            {errors.requiredSkillIds && <p className="field-error">{errors.requiredSkillIds}</p>}
            <p className="mt-1 text-xs text-slate-500">Used to compute your skill gap and rank candidate teammates.</p>
          </div>
          <div>
            <span className="label">Roles you need</span>
            <RolePicker value={form.requiredRoles} onChange={(v) => set('requiredRoles', v)} />
          </div>
        </form>
      )}
    </Modal>
  );
}
