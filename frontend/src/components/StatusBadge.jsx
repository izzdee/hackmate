const STYLES = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 ring-red-200',
};
const LABELS = { PENDING: 'Pending', ACCEPTED: 'Accepted', REJECTED: 'Rejected' };

// Coloured pill for a TeamRequest status
export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}>
      {LABELS[status] || status}
    </span>
  );
}
