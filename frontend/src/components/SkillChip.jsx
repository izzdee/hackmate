import { Check, X } from 'lucide-react';

// variant: neutral | covered (green) | missing (red) | selected (indigo) | role
const STYLES = {
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  covered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  missing: 'bg-red-50 text-red-700 border-red-200',
  selected: 'bg-indigo-600 text-white border-indigo-600',
  role: 'bg-violet-50 text-violet-700 border-violet-200',
};

export default function SkillChip({ label, variant = 'neutral', onClick, onRemove, title }) {
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      title={title}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[variant]} ${onClick ? 'cursor-pointer transition hover:opacity-80' : ''}`}
    >
      {variant === 'covered' && <Check size={12} />}
      {variant === 'missing' && <X size={12} />}
      {label}
      {onRemove && (
        <button type="button" onClick={onRemove} className="ml-0.5 rounded-full hover:bg-black/10" aria-label={`Remove ${label}`}>
          <X size={12} />
        </button>
      )}
    </Tag>
  );
}
