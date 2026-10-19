import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyTeams } from '../services/teamService';

// Teams the logged-in user leads (needed to decide whether "Invite" can be shown)
export default function useLedTeams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState(null); // null = still loading

  const reload = useCallback(() => {
    getMyTeams()
      .then((all) => setTeams(all.filter((t) => t.leader.id === user.id)))
      .catch(() => setTeams([]));
  }, [user.id]);

  useEffect(() => { reload(); }, [reload]);
  return { ledTeams: teams, reloadLedTeams: reload };
}
