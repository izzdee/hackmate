// Enum values from API_CONTRACT.md + human-readable labels for the UI
export const ROLES = ['FRONTEND', 'BACKEND', 'FULLSTACK', 'UI_UX', 'ML', 'DEVOPS', 'MOBILE'];
export const ROLE_LABELS = {
  FRONTEND: 'Frontend', BACKEND: 'Backend', FULLSTACK: 'Full-stack', UI_UX: 'UI/UX',
  ML: 'ML', DEVOPS: 'DevOps', MOBILE: 'Mobile',
};

export const EXPERIENCE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
export const EXPERIENCE_LABELS = { BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced' };

export const AVAILABILITY = ['FULL_TIME', 'PART_TIME', 'WEEKENDS'];
export const AVAILABILITY_LABELS = { FULL_TIME: 'Full-time', PART_TIME: 'Part-time', WEEKENDS: 'Weekends' };

export const MODES = ['ONLINE', 'OFFLINE'];
export const MODE_LABELS = { ONLINE: 'Online', OFFLINE: 'Offline' };

// Max points per score component (see the matching algorithm)
export const SCORE_MAX = { skill: 50, role: 25, experience: 15, availability: 10 };
