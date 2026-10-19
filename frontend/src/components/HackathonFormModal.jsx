import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal';
import Spinner from './Spinner';
import { createHackathon, updateHackathon } from '../services/hackathonService';
import { MODES, MODE_LABELS } from '../utils/constants';

const EMPTY = {
  title: '', description: '', organizer: '', startDate: '', endDate: '',
  registrationDeadline: '', maxTeamSize: 4, mode: 'ONLINE',
};

// Create / edit a hackathon (ADMIN). Body = Hackathon without id, as in the contract.
export default function HackathonFormModal({ open, hackathon, onClose, onSaved }) {
  const isEdit = Boolean(hackathon);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (hackathon) {
      const { id, ...rest } = hackathon; // eslint-disable-line no-unused-vars
      setForm(rest);
    } else {
      setForm(EMPTY);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.organizer.trim()) e.organizer = 'Organizer is required';
    if (!form.startDate) e.startDate = 'Start date is required';
    if (!form.endDate) e.endDate = 'End date is required';
    else if (form.startDate && form.endDate < form.startDate) e.endDate = 'End date must be on or after the start date';
    if (!form.registrationDeadline) e.registrationDeadline = 'Deadline is required';
    else if (form.startDate && form.registrationDeadline > form.startDate) e.registrationDeadline = 'Deadline must be on or before the start date';
    const size = Number(form.maxTeamSize);
    if (!Number.isInteger(size) || size < 1 || size > 10) e.maxTeamSize = 'Team size must be 1–10';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;
    const body = {
      ...form,
      title: form.title.trim(),
      organizer: form.organizer.trim(),
      description: form.description.trim(),
      maxTeamSize: Number(form.maxTeamSize),
    };
    setSaving(true);
    try {
      const saved = isEdit ? await updateHackathon(hackathon.id, body) : await createHackathon(body);
      toast.success(isEdit ? 'Hackathon updated' : 'Hackathon created');
      onSaved(saved);
    } catch {
      // toast shown by shared error handler
    } finally {
      setSaving(false);
    }
  };

  const field = (name, label, props = {}) => (
    <div>
      <label htmlFor={`h-${name}`} className="label">{label}</label>
      <input id={`h-${name}`} className="input" value={form[name]} onChange={set(name)} {...props} />
      {errors[name] && <p className="field-error">{errors[name]}</p>}
    </div>
  );

  return (
    <Modal open={open} onClose={saving ? () => {} : onClose} title={isEdit ? 'Edit hackathon' : 'New hackathon'} size="lg"
      footer={<>
        <button className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
        <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
          {saving && <Spinner size={16} />} {isEdit ? 'Save changes' : 'Create hackathon'}
        </button>
      </>}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {field('title', 'Title', { placeholder: 'e.g. Smart India Hackathon' })}
        <div>
          <label htmlFor="h-description" className="label">Description</label>
          <textarea id="h-description" rows={3} className="input" value={form.description} onChange={set('description')} />
        </div>
        {field('organizer', 'Organizer')}
        <div className="grid gap-4 sm:grid-cols-3">
          {field('startDate', 'Start date', { type: 'date' })}
          {field('endDate', 'End date', { type: 'date' })}
          {field('registrationDeadline', 'Registration deadline', { type: 'date' })}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {field('maxTeamSize', 'Max team size', { type: 'number', min: 1, max: 10 })}
          <div>
            <label htmlFor="h-mode" className="label">Mode</label>
            <select id="h-mode" className="input" value={form.mode} onChange={set('mode')}>
              {MODES.map((m) => <option key={m} value={m}>{MODE_LABELS[m]}</option>)}
            </select>
          </div>
        </div>
        {/* hidden submit so Enter works inside the form */}
        <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
      </form>
    </Modal>
  );
}
