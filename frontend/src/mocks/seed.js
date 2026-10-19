// Seed data for mock mode.
// Records are stored "normalised" (ids instead of nested objects), like database rows.
// mocks/db.js turns them into the exact JSON shapes from docs/API_CONTRACT.md.
//
// Demo logins (all mock users share the password "password123"):
//   aryan@example.com   – STUDENT, leader of "Code Crusaders"
//   deeksha@example.com – STUDENT, member of "Neural Ninjas"
//   admin@hackmate.dev  – ADMIN

export const DEMO_PASSWORD = 'password123';

export const seedSkills = [
  'Java', 'Spring Boot', 'Python', 'React', 'JavaScript', 'TypeScript', 'Node.js',
  'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'Figma', 'UI Design',
  'TensorFlow', 'PyTorch', 'Machine Learning', 'Flutter', 'Kotlin', 'Swift',
  'Git', 'Tailwind CSS', 'Data Analysis', 'C++',
].map((name, i) => ({ id: i + 1, name }));

// Helper so user skill lists below read as names
const skillIds = (...names) =>
  names.map((n) => seedSkills.find((s) => s.name === n).id);

export const seedUsers = [
  {
    id: 1, name: 'Aryan Mehta', email: 'aryan@example.com', password: DEMO_PASSWORD,
    bio: 'Backend developer who loves clean APIs and Spring Boot.',
    role: 'STUDENT', experienceLevel: 'INTERMEDIATE', preferredRoles: ['BACKEND'],
    availability: 'FULL_TIME', skillIds: skillIds('Java', 'Spring Boot', 'PostgreSQL', 'Git'),
  },
  {
    id: 2, name: 'Admin', email: 'admin@hackmate.dev', password: DEMO_PASSWORD,
    bio: 'Platform administrator.', role: 'ADMIN', experienceLevel: 'ADVANCED',
    preferredRoles: [], availability: 'FULL_TIME', skillIds: [],
  },
  {
    id: 3, name: 'Deeksha', email: 'deeksha@example.com', password: DEMO_PASSWORD,
    bio: 'Frontend engineer and design enthusiast. React + Figma all day.',
    role: 'STUDENT', experienceLevel: 'ADVANCED', preferredRoles: ['FRONTEND', 'UI_UX'],
    availability: 'FULL_TIME', skillIds: skillIds('React', 'JavaScript', 'Figma', 'Tailwind CSS', 'UI Design'),
  },
  {
    id: 4, name: 'Rohan Gupta', email: 'rohan@example.com', password: DEMO_PASSWORD,
    bio: 'Full-stack dev, MERN stack.', role: 'STUDENT', experienceLevel: 'INTERMEDIATE',
    preferredRoles: ['FULLSTACK'], availability: 'PART_TIME',
    skillIds: skillIds('JavaScript', 'Node.js', 'MongoDB', 'React'),
  },
  {
    id: 5, name: 'Priya Sharma', email: 'priya@example.com', password: DEMO_PASSWORD,
    bio: 'ML researcher, Kaggle competitor.', role: 'STUDENT', experienceLevel: 'ADVANCED',
    preferredRoles: ['ML'], availability: 'FULL_TIME',
    skillIds: skillIds('Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Data Analysis'),
  },
  {
    id: 6, name: 'Kabir Singh', email: 'kabir@example.com', password: DEMO_PASSWORD,
    bio: 'Cloud and DevOps nerd.', role: 'STUDENT', experienceLevel: 'ADVANCED',
    preferredRoles: ['DEVOPS', 'BACKEND'], availability: 'WEEKENDS',
    skillIds: skillIds('Docker', 'Kubernetes', 'AWS', 'Python'),
  },
  {
    id: 7, name: 'Sneha Iyer', email: 'sneha@example.com', password: DEMO_PASSWORD,
    bio: 'UI/UX designer who can also code a bit.', role: 'STUDENT', experienceLevel: 'BEGINNER',
    preferredRoles: ['UI_UX'], availability: 'FULL_TIME',
    skillIds: skillIds('Figma', 'UI Design', 'Tailwind CSS'),
  },
  {
    id: 8, name: 'Vikram Rao', email: 'vikram@example.com', password: DEMO_PASSWORD,
    bio: 'Android and Flutter developer.', role: 'STUDENT', experienceLevel: 'INTERMEDIATE',
    preferredRoles: ['MOBILE'], availability: 'PART_TIME',
    skillIds: skillIds('Flutter', 'Kotlin', 'Java'),
  },
  {
    id: 9, name: 'Ananya Das', email: 'ananya@example.com', password: DEMO_PASSWORD,
    bio: 'Frontend dev, TypeScript fan.', role: 'STUDENT', experienceLevel: 'INTERMEDIATE',
    preferredRoles: ['FRONTEND'], availability: 'FULL_TIME',
    skillIds: skillIds('React', 'TypeScript', 'Tailwind CSS', 'Git'),
  },
  {
    id: 10, name: 'Arjun Nair', email: 'arjun@example.com', password: DEMO_PASSWORD,
    bio: 'Competitive programmer turned backend dev.', role: 'STUDENT', experienceLevel: 'BEGINNER',
    preferredRoles: ['BACKEND'], availability: 'WEEKENDS',
    skillIds: skillIds('C++', 'Java', 'PostgreSQL'),
  },
  {
    id: 11, name: 'Meera Kapoor', email: 'meera@example.com', password: DEMO_PASSWORD,
    bio: 'DevOps + backend. Docker everything.', role: 'STUDENT', experienceLevel: 'INTERMEDIATE',
    preferredRoles: ['DEVOPS'], availability: 'FULL_TIME',
    skillIds: skillIds('Docker', 'AWS', 'Node.js', 'PostgreSQL'),
  },
  {
    id: 12, name: 'Ishaan Verma', email: 'ishaan@example.com', password: DEMO_PASSWORD,
    bio: 'iOS developer.', role: 'STUDENT', experienceLevel: 'BEGINNER',
    preferredRoles: ['MOBILE', 'FRONTEND'], availability: 'PART_TIME',
    skillIds: skillIds('Swift', 'JavaScript', 'React'),
  },
];

export const seedHackathons = [
  {
    id: 1, title: 'Smart India Hackathon',
    description: 'National-level hackathon solving real problem statements from ministries and industry.',
    organizer: 'Ministry of Education', startDate: '2026-11-20', endDate: '2026-11-22',
    registrationDeadline: '2026-11-10', maxTeamSize: 4, mode: 'OFFLINE',
  },
  {
    id: 2, title: 'HackMIT Online',
    description: 'A 36-hour online hackathon focused on AI for social good.',
    organizer: 'MIT', startDate: '2026-12-05', endDate: '2026-12-06',
    registrationDeadline: '2026-11-28', maxTeamSize: 4, mode: 'ONLINE',
  },
  {
    id: 3, title: 'DevOps Days Sprint',
    description: 'Build and ship cloud-native tools in 24 hours.',
    organizer: 'CNCF Student Chapter', startDate: '2026-11-08', endDate: '2026-11-09',
    registrationDeadline: '2026-11-01', maxTeamSize: 3, mode: 'ONLINE',
  },
  {
    id: 4, title: 'Campus Code Fest',
    description: 'Inter-college hackathon with tracks in FinTech, HealthTech and EdTech.',
    organizer: 'College Tech Club', startDate: '2027-01-15', endDate: '2027-01-17',
    registrationDeadline: '2027-01-05', maxTeamSize: 5, mode: 'OFFLINE',
  },
  {
    id: 5, title: 'Monsoon Hack 2026',
    description: 'Past event: climate and disaster-response solutions.',
    organizer: 'Green Tech Society', startDate: '2026-08-10', endDate: '2026-08-11',
    registrationDeadline: '2026-08-01', maxTeamSize: 4, mode: 'OFFLINE',
  },
];

export const seedTeams = [
  {
    id: 1, name: 'Code Crusaders', description: 'Building a smart grievance portal for municipalities.',
    hackathonId: 1, leaderId: 1, memberIds: [1, 4],
    requiredSkillIds: skillIds('Java', 'React', 'Figma', 'Docker', 'PostgreSQL'),
    requiredRoles: ['BACKEND', 'FRONTEND', 'UI_UX'],
  },
  {
    id: 2, name: 'Byte Busters', description: 'AI-driven crop disease detection app.',
    hackathonId: 1, leaderId: 5, memberIds: [5, 8],
    requiredSkillIds: skillIds('Python', 'Machine Learning', 'Flutter', 'Figma'),
    requiredRoles: ['ML', 'MOBILE', 'UI_UX'],
  },
  {
    id: 3, name: 'Neural Ninjas', description: 'Accessible learning assistant for visually impaired students.',
    hackathonId: 2, leaderId: 6, memberIds: [6, 3],
    requiredSkillIds: skillIds('Python', 'React', 'AWS', 'TensorFlow'),
    requiredRoles: ['ML', 'FRONTEND', 'DEVOPS'],
  },
  {
    id: 4, name: 'Ship It', description: 'One-click preview environments for pull requests.',
    hackathonId: 3, leaderId: 11, memberIds: [11],
    requiredSkillIds: skillIds('Docker', 'Kubernetes', 'Node.js'),
    requiredRoles: ['DEVOPS', 'BACKEND'],
  },
];

// TeamRequest rows. userId = the invited user (INVITE) or the requester (JOIN_REQUEST).
export const seedRequests = [
  { id: 1, type: 'JOIN_REQUEST', status: 'PENDING', createdAt: '2026-10-18T14:30:00', teamId: 1, userId: 9 },
  { id: 2, type: 'INVITE', status: 'PENDING', createdAt: '2026-10-18T09:15:00', teamId: 1, userId: 7 },
  { id: 3, type: 'INVITE', status: 'PENDING', createdAt: '2026-10-17T18:00:00', teamId: 4, userId: 1 },
  { id: 4, type: 'JOIN_REQUEST', status: 'REJECTED', createdAt: '2026-10-15T11:00:00', teamId: 2, userId: 1 },
];

export const seedNotifications = [
  { id: 1, userId: 1, message: 'Ananya Das requested to join Code Crusaders', isRead: false, createdAt: '2026-10-18T14:30:00' },
  { id: 2, userId: 1, message: 'Meera Kapoor invited you to join Ship It', isRead: false, createdAt: '2026-10-17T18:00:00' },
  { id: 3, userId: 1, message: 'Priya Sharma rejected your request to join Byte Busters', isRead: true, createdAt: '2026-10-16T10:00:00' },
  { id: 4, userId: 7, message: 'Aryan Mehta invited you to join Code Crusaders', isRead: false, createdAt: '2026-10-18T09:15:00' },
  { id: 5, userId: 3, message: 'Kabir Singh accepted your request to join Neural Ninjas', isRead: false, createdAt: '2026-10-14T12:00:00' },
];
