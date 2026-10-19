// Horizontal bar for a score out of `max` (overall score /100 or one breakdown part)
function colorFor(pct) {
  if (pct >= 75) return 'bg-emerald-500';
  if (pct >= 50) return 'bg-indigo-500';
  if (pct >= 25) return 'bg-amber-500';
  return 'bg-red-400';
}

export default function ScoreBar({ value, max = 100, label, showValue = true, thin = false }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="mb-1 flex items-baseline justify-between text-xs">
          {label && <span className="text-slate-600">{label}</span>}
          {showValue && (
            <span className="font-semibold text-slate-800">
              {Number.isInteger(value) ? value : value.toFixed(1)}<span className="font-normal text-slate-400">/{max}</span>
            </span>
          )}
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-slate-100 ${thin ? 'h-1.5' : 'h-2.5'}`}
        role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label || 'Score'}>
        <div className={`h-full rounded-full transition-all duration-500 ${colorFor(pct)}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
