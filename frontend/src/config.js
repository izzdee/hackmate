// Central app configuration.
// USE_MOCK = true  → services return in-memory mock data (no backend needed).
// USE_MOCK = false → services call the real Spring Boot API at API_BASE_URL.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
// Default is mock mode. To use the real backend without touching code, run:
//   VITE_USE_MOCK=false npm run dev
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// Simulated network latency for mock responses (ms)
export const MOCK_DELAY = 300;
