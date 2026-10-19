import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarPlus, CalendarX, Pencil, Plus, Trash2 } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { deleteHackathon, getHackathons } from '../services/hackathonService';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import EmptyState, { ErrorState } from '../components/EmptyState';
import HackathonFormModal from '../components/HackathonFormModal';
import { ConfirmModal } from '../components/Modal';
import { MODE_LABELS } from '../utils/constants';
import { formatDate, todayIso } from '../utils/format';

export default function AdminHackathonsPage() {
  const { data: hackathons, loading, error, reload, setData } = useFetch(getHackathons, []);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, hackathon = edit
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleSaved = (saved) => {
    setData((list) => {
      const exists = list.some((h) => h.id === saved.id);
      const next = exists ? list.map((h) => (h.id === saved.id ? saved : h)) : [...list, saved];
      return next.sort((a, b) => a.startDate.localeCompare(b.startDate));
    });
    setEditing(null);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteHackathon(toDelete.id);
      setData((list) => list.filter((h) => h.id !== toDelete.id));
      toast.success(`Deleted ${toDelete.title}`);
      setToDelete(null);
    } catch {
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const today = todayIso();
  const statusOf = (h) =>
    h.endDate < today ? ['Ended', 'bg-slate-100 text-slate-500']
      : h.startDate <= today ? ['Live', 'bg-emerald-50 text-emerald-700']
      : h.registrationDeadline < today ? ['Reg. closed', 'bg-amber-50 text-amber-700']
      : ['Open', 'bg-indigo-50 text-indigo-700'];

  return (
    <div>
      <PageHeader title="Manage hackathons" subtitle="Admin only: create, edit and delete hackathons."
        actions={<button className="btn-primary" onClick={() => setEditing({})}><Plus size={16} /> New hackathon</button>} />

      {loading ? <Spinner fullPage label="Loading hackathons…" />
        : error ? <ErrorState message={error} onRetry={reload} />
        : hackathons.length === 0 ? (
          <EmptyState icon={CalendarX} title="No hackathons yet" message="Create the first hackathon for students to join."
            action={<button className="btn-primary btn-sm" onClick={() => setEditing({})}><CalendarPlus size={14} /> New hackathon</button>} />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="min-w-[200px] px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Dates</th>
                  <th className="px-4 py-3 font-medium">Reg. deadline</th>
                  <th className="px-4 py-3 font-medium">Mode</th>
                  <th className="px-4 py-3 font-medium">Team size</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hackathons.map((h) => {
                  const [label, tone] = statusOf(h);
                  return (
                    <tr key={h.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link to={`/hackathons/${h.id}`} className="font-medium text-slate-900 hover:text-indigo-700">{h.title}</Link>
                        <p className="text-xs text-slate-500">{h.organizer}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">{formatDate(h.startDate)} – {formatDate(h.endDate)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">{formatDate(h.registrationDeadline)}</td>
                      <td className="px-4 py-3 text-slate-600">{MODE_LABELS[h.mode]}</td>
                      <td className="px-4 py-3 text-slate-600">{h.maxTeamSize}</td>
                      <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{label}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button className="btn-ghost btn-sm" onClick={() => setEditing(h)} aria-label={`Edit ${h.title}`}><Pencil size={14} /> Edit</button>
                          <button className="btn-ghost btn-sm text-red-600 hover:bg-red-50" onClick={() => setToDelete(h)} aria-label={`Delete ${h.title}`}><Trash2 size={14} /> Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      <HackathonFormModal open={editing !== null} hackathon={editing?.id ? editing : null}
        onClose={() => setEditing(null)} onSaved={handleSaved} />
      <ConfirmModal open={Boolean(toDelete)} onClose={() => setToDelete(null)} onConfirm={handleDelete} busy={deleting} danger
        title="Delete hackathon?" confirmLabel="Delete"
        message={`"${toDelete?.title}" and all of its teams and requests will be permanently deleted.`} />
    </div>
  );
}
