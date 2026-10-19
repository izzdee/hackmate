import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ExternalLink, Save } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { getMe, updateMe } from '../services/userService';
import { getSkills } from '../services/skillService';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import Avatar from '../components/Avatar';
import { ErrorState } from '../components/EmptyState';
import SkillMultiSelect from '../components/SkillMultiSelect';
import RolePicker from '../components/RolePicker';
import { AVAILABILITY, AVAILABILITY_LABELS, EXPERIENCE_LABELS, EXPERIENCE_LEVELS } from '../utils/constants';

// Turn a User from the API into the PUT /users/me body shape
const toForm = (u) => ({
  name: u.name,
  bio: u.bio || '',
  experienceLevel: u.experienceLevel || 'BEGINNER',
  preferredRoles: u.preferredRoles || [],
  availability: u.availability || 'FULL_TIME',
  skillIds: u.skills.map((s) => s.id),
});

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const { data, loading, error, reload } = useFetch(async () => {
    const [me, skills] = await Promise.all([getMe(), getSkills()]);
    return { me, skills };
  }, []);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(toForm(data.me));
  }, [data]);

  if (loading || (data && !form)) return <Spinner fullPage label="Loading profile…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const dirty = JSON.stringify(form) !== JSON.stringify(toForm(data.me));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.bio.length > 500) errs.bio = 'Bio must be 500 characters or less';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const updated = await updateMe({ ...form, name: form.name.trim() });
      updateUser(updated); // keep navbar + context in sync
      setForm(toForm(updated));
      reload({ silent: true });
      toast.success('Profile saved');
    } catch {
      // error toast shown by the shared error handler
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="My profile"
        subtitle="A complete profile gets you better matches with teams."
        actions={<Link to={`/users/${data.me.id}`} className="btn-secondary btn-sm"><ExternalLink size={14} /> View public profile</Link>}
      />
      <form onSubmit={handleSubmit} className="card space-y-6 p-6" noValidate>
        <div className="flex items-center gap-4">
          <Avatar user={data.me} size="lg" />
          <div>
            <p className="font-semibold text-slate-900">{data.me.email}</p>
            <p className="text-xs uppercase tracking-wide text-slate-500">{data.me.role}</p>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="label">Name</label>
          <input id="name" className="input" value={form.name} onChange={(e) => set('name', e.target.value)} />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="bio" className="label">Bio</label>
          <textarea id="bio" rows={3} className="input" value={form.bio} placeholder="What do you love building?"
            onChange={(e) => set('bio', e.target.value)} />
          <p className={`mt-1 text-right text-xs ${form.bio.length > 500 ? 'text-red-600' : 'text-slate-400'}`}>{form.bio.length}/500</p>
          {errors.bio && <p className="field-error">{errors.bio}</p>}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="experience" className="label">Experience level</label>
            <select id="experience" className="input" value={form.experienceLevel} onChange={(e) => set('experienceLevel', e.target.value)}>
              {EXPERIENCE_LEVELS.map((lvl) => <option key={lvl} value={lvl}>{EXPERIENCE_LABELS[lvl]}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="availability" className="label">Availability</label>
            <select id="availability" className="input" value={form.availability} onChange={(e) => set('availability', e.target.value)}>
              {AVAILABILITY.map((a) => <option key={a} value={a}>{AVAILABILITY_LABELS[a]}</option>)}
            </select>
          </div>
        </div>

        <div>
          <span className="label">Preferred roles</span>
          <RolePicker value={form.preferredRoles} onChange={(v) => set('preferredRoles', v)} />
        </div>

        <div>
          <label htmlFor="skills" className="label">Skills</label>
          <SkillMultiSelect id="skills" allSkills={data.skills} value={form.skillIds} onChange={(v) => set('skillIds', v)} />
          <p className="mt-1 text-xs text-slate-500">Type to search, press Enter to add the first match.</p>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" className="btn-secondary" disabled={!dirty || saving} onClick={() => setForm(toForm(data.me))}>Discard</button>
          <button type="submit" className="btn-primary" disabled={!dirty || saving}>
            {saving ? <Spinner size={16} /> : <Save size={16} />} {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
