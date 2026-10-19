// Central app configuration.
// USE_MOCK = true  → services return in-memory mock data (no backend needed).
// USE_MOCK = false → services call the real Spring Boot API at API_BASE_URL.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const USE_MOCK = true;

// Simulated network latency for mock responses (ms)
export const MOCK_DELAY = 300;
