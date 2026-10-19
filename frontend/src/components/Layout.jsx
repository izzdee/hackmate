import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { USE_MOCK } from '../config';
import { resetMockDb } from '../mocks/db';

// Page shell for every logged-in page: navbar on top, content below
export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
      {USE_MOCK && (
        <footer className="pb-6 text-center text-xs text-slate-400">
          Mock mode – data is stored in your browser.{' '}
          <button className="underline hover:text-slate-600" onClick={() => { resetMockDb(); window.location.reload(); }}>
            Reset demo data
          </button>
        </footer>
      )}
    </div>
  );
}
