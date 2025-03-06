// lib/services/birth-chart.ts

// Ensure you set NEXT_PUBLIC_BASE_URL in your .env file, e.g.,
// NEXT_PUBLIC_BASE_URL=http://localhost:3000
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const BirthChartService = {
  // Retrieve the stored birth chart from your /api/horizon GET endpoint.
  getChart: async (userId: string) => {
    const url = new URL('/api/horizon', BASE_URL);
    url.searchParams.set('userId', userId);
    const res = await fetch(url.toString());
    if (res.status === 404) return null; // No chart exists
    if (!res.ok) throw new Error('Failed to get chart');
    return res.json();
  },
  // Trigger a recalculation by calling your /api/horizon POST endpoint.
  calculateChart: async (userId: string) => {
    const url = new URL('/api/horizon', BASE_URL);
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to calculate chart');
    return res.json();
  },
};
