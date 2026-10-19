import { useState } from 'react';
import toast from 'react-hot-toast';
import { Check, UserPlus } from 'lucide-react';
import Modal from './Modal';
import Spinner from './Spinner';
import { inviteUser } from '../services/requestService';

// Lets a leader pick which of their teams to invite `user` to.
export default function InviteModal({ open, onClose, user, ledTeams }) {
  const [busyTeamId, setBusyTeamId] = useState(null);
  const [sentTo, setSentTo] = useState([]); // team ids invited during this session

  const handleInvite = async (team) => {
    setBusyTeamId(team.id);
    try {
      await inviteUser(team.id, user.id);
      setSentTo((ids) => [...ids, team.id]);
      toast.success(`Invited ${user.name} to ${team.name}`);
    } catch {
      // toast shown by shared error handler (e.g. already pending, team full)
    } finally {
      setBusyTeamId(null);
    }
  };

  if (!open || !user) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Invite ${user.name}`} size="sm">
      {!ledTeams?.length ? (
        <p className="text-sm text-slate-600">You don&apos;t lead any teams yet. Create a team from a hackathon page first.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {ledTeams.map((team) => {
            const isMember = team.members.some((m) => m.id === user.id);
            const isFull = team.members.length >= team.maxTeamSize;
            const sent = sentTo.includes(team.id);
            return (
              <li key={team.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{team.name}</p>
                  <p className="truncate text-xs text-slate-500">{team.hackathon.title} · {team.members.length}/{team.maxTeamSize}</p>
                </div>
                {isMember ? <span className="text-xs text-slate-400">Already a member</span>
                  : isFull ? <span className="text-xs text-slate-400">Team full</span>
                  : sent ? <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700"><Check size={14} /> Invited</span>
                  : (
                    <button className="btn-primary btn-sm" onClick={() => handleInvite(team)} disabled={busyTeamId !== null}>
                      {busyTeamId === team.id ? <Spinner size={14} /> : <UserPlus size={14} />} Invite
                    </button>
                  )}
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
