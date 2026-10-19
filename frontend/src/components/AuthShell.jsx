import { Users } from 'lucide-react';

// Shared two-column layout for the login and register pages
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 text-white lg:flex">
        <div className="flex items-center gap-2 text-xl font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15"><Users size={20} /></span>
          HackMate
        </div>
        <div>
          <h2 className="text-4xl leading-tight font-bold">Find the teammates<br />your idea deserves.</h2>
          <p className="mt-4 max-w-md text-indigo-100">
            Build a skill profile, join hackathons, and get ranked teammate matches based on the
            skills your team is missing.
          </p>
        </div>
        <p className="text-sm text-indigo-200">Rule-based matching · Skill gap analysis · Invites & join requests</p>
      </div>
      <div className="flex w-full items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 text-xl font-bold text-indigo-700 lg:hidden">
            <Users size={22} /> HackMate
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
