// Rule-based, deterministic compatibility scoring.
// Mirrors backend/CLAUDE.md → MatchingService exactly. No AI/ML — just weighted rules.
// Maximum total = 100:
//   skill        /50  – |candidate skills ∩ missing skills| / |missing skills| × 50 (0 if nothing missing)
//   role         /25  – 25 if the candidate prefers any uncovered role, else 0
//   experience   /15  – ADVANCED 15, INTERMEDIATE 10, BEGINNER 5
//   availability /10  – FULL_TIME 10, PART_TIME 6, WEEKENDS 3

export const WEIGHTS = { skill: 50, role: 25, experience: 15, availability: 10 };

const EXPERIENCE_POINTS = { ADVANCED: 15, INTERMEDIATE: 10, BEGINNER: 5 };
const AVAILABILITY_POINTS = { FULL_TIME: 10, PART_TIME: 6, WEEKENDS: 3 };

// Skill gap = required skill ids that no current member has
export function missingSkillIds(team, members) {
  const covered = new Set(members.flatMap((m) => m.skillIds));
  return team.requiredSkillIds.filter((id) => !covered.has(id));
}

// Uncovered roles = required roles that no current member prefers
export function uncoveredRoles(team, members) {
  const covered = new Set(members.flatMap((m) => m.preferredRoles));
  return team.requiredRoles.filter((r) => !covered.has(r));
}

const round1 = (n) => Math.round(n * 10) / 10;

export function scoreCandidate(candidate, team, members) {
  const missing = missingSkillIds(team, members);
  const matched = missing.filter((id) => candidate.skillIds.includes(id)).length;
  const skill = missing.length > 0 ? (matched / missing.length) * WEIGHTS.skill : 0;

  const roles = uncoveredRoles(team, members);
  const role = candidate.preferredRoles.some((r) => roles.includes(r)) ? WEIGHTS.role : 0;

  const experience = EXPERIENCE_POINTS[candidate.experienceLevel] ?? 0;
  const availability = AVAILABILITY_POINTS[candidate.availability] ?? 0;

  const breakdown = { skill: round1(skill), role, experience, availability };
  const score = round1(skill + role + experience + availability);
  return { score, breakdown };
}
