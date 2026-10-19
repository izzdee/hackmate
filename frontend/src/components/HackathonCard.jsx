import { Link } from 'react-router-dom';
import { CalendarDays, Clock, Globe, MapPin, Users } from 'lucide-react';
import { formatDate, todayIso } from '../utils/format';
import { MODE_LABELS } from '../utils/constants';

export default function HackathonCard({ hackathon }) {
  const today = todayIso();
  const isPast = hackathon.endDate < today;
  const registrationOpen = hackathon.registrationDeadline >= today;
  const ModeIcon = hackathon.mode === 'ONLINE' ? Globe : MapPin;

  return (
    <Link to={`/hackathons/${hackathon.id}`} className="card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700">{hackathon.title}</h3>
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${hackathon.mode === 'ONLINE' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'}`}>
          <ModeIcon size={12} /> {MODE_LABELS[hackathon.mode]}
        </span>
      </div>
      <p className="mb-4 line-clamp-2 text-sm text-slate-500">{hackathon.description}</p>
      <div className="mt-auto space-y-1.5 text-sm text-slate-600">
        <p className="flex items-center gap-2"><CalendarDays size={14} className="text-slate-400" />{formatDate(hackathon.startDate)} – {formatDate(hackathon.endDate)}</p>
        <p className="flex items-center gap-2"><Users size={14} className="text-slate-400" />Up to {hackathon.maxTeamSize} members</p>
        <p className="flex items-center gap-2">
          <Clock size={14} className="text-slate-400" />
          {isPast ? <span className="text-slate-400">Event ended</span>
            : registrationOpen ? <>Register by {formatDate(hackathon.registrationDeadline)}</>
            : <span className="text-amber-600">Registration closed</span>}
        </p>
      </div>
    </Link>
  );
}
