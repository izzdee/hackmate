import { Loader2 } from 'lucide-react';

// Inline spinner; use fullPage for a centred page-level loader
export default function Spinner({ size = 20, fullPage = false, label }) {
  const icon = <Loader2 className="animate-spin text-indigo-600" size={size} aria-hidden="true" />;
  if (!fullPage) return icon;
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500" role="status">
      <Loader2 className="animate-spin text-indigo-600" size={32} aria-hidden="true" />
      <span className="text-sm">{label || 'Loading…'}</span>
    </div>
  );
}
