import { AlertTriangle, Inbox } from 'lucide-react';

// Friendly placeholder when a list has nothing to show
export default function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon size={22} />
      </span>
      <h3 className="font-semibold text-slate-800">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Error version with a retry button
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <AlertTriangle className="mb-2 text-red-500" size={24} />
      <p className="font-medium text-red-800">Couldn&apos;t load this</p>
      <p className="mt-1 text-sm text-red-600">{message}</p>
      {onRetry && <button className="btn-secondary btn-sm mt-4" onClick={() => onRetry()}>Try again</button>}
    </div>
  );
}
