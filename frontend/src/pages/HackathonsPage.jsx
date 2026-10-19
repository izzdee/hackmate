import { useMemo, useState } from 'react';
import { CalendarX, Search } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { getHackathons } from '../services/hackathonService';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import EmptyState, { ErrorState } from '../components/EmptyState';
import HackathonCard from '../components/HackathonCard';
import { MODES, MODE_LABELS } from '../utils/constants';
import { todayIso } from '../utils/format';

export default function HackathonsPage() {
  const { data: hackathons, loading, error, reload } = useFetch(getHackathons, []);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('ALL');
  const [showPast, setShowPast] = useState(false);

  // Client-side filtering: search in title/organizer/description + mode filter
  const filtered = useMemo(() => {
    if (!hackathons) return [];
    const q = query.trim().toLowerCase();
    const today = todayIso();
    return hackathons
      .filter((h) => showPast || h.endDate >= today)
      .filter((h) => mode === 'ALL' || h.mode === mode)
      .filter((h) => !q || [h.title, h.organizer, h.description].some((f) => f?.toLowerCase().includes(q)));
  }, [hackathons, query, mode, showPast]);

  return (
    <div>
      <PageHeader title="Hackathons" subtitle="Pick an event, then create a team or join one." />

      <div className="card mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search by title, organizer…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search hackathons" />
        </div>
        <div className="flex rounded-lg border border-slate-300 p-0.5" role="group" aria-label="Mode filter">
          {['ALL', ...MODES].map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${mode === m ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {m === 'ALL' ? 'All' : MODE_LABELS[m]}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} className="h-4 w-4 rounded accent-indigo-600" />
          Show past
        </label>
      </div>

      {loading ? <Spinner fullPage label="Loading hackathons…" />
        : error ? <ErrorState message={error} onRetry={reload} />
        : filtered.length === 0 ? (
          <EmptyState icon={CalendarX} title="No hackathons found"
            message={hackathons.length ? 'Try a different search or filter.' : 'No hackathons have been added yet.'} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((h) => <HackathonCard key={h.id} hackathon={h} />)}
          </div>
        )}
    </div>
  );
}
