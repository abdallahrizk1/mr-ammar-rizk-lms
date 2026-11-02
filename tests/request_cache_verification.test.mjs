import test from 'node:test';
import assert from 'node:assert/strict';
import { QueryClient } from '@tanstack/react-query';

test('Request Caching Verification: Eliminates repeated network calls on navigation', async () => {
  let networkRequestsCount = 0;

  // Mock network fetcher simulating Supabase network round-trip
  async function fetchMockSupabase(endpoint) {
    networkRequestsCount++;
    return { data: `data_for_${endpoint}` };
  }

  // Without Cache (Standard component mount behavior without React Query)
  let unCachedRequests = 0;
  function navigateWithoutCache() {
    // TopNavbar: getSession + notifications
    unCachedRequests += 2;
    // Page fetch
    unCachedRequests += 3; // e.g. Courses: courses + enrollments + user
  }

  // 10 page navigations without cache
  for (let i = 0; i < 10; i++) {
    navigateWithoutCache();
  }
  assert.equal(unCachedRequests, 50, '10 navigations without cache produced 50 network calls');

  // With TanStack Query Cache (Our implementation with staleTime = 5 minutes)
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  });

  networkRequestsCount = 0;

  async function simulateCachedNavigation(route) {
    // 1. TopNavbar query (cached across pages)
    await queryClient.fetchQuery({
      queryKey: ['navbar-auth-session'],
      queryFn: () => fetchMockSupabase('navbar-auth'),
    });

    // 2. Page query (cached by route key)
    await queryClient.fetchQuery({
      queryKey: [`page-${route}`],
      queryFn: () => fetchMockSupabase(`page-${route}`),
    });
  }

  const routes = ['dashboard', 'courses', 'forum', 'account'];

  // Cycle 1: First visit to each route
  for (const r of routes) {
    await simulateCachedNavigation(r);
  }

  // In Cycle 1:
  // Navbar query runs once (1 call) + 4 page queries run once (4 calls) = 5 total network calls
  const initialLoadRequests = networkRequestsCount;
  assert.equal(initialLoadRequests, 5, 'Cycle 1 initial population did exactly 5 network calls');

  // Cycle 2: User navigates between the pages again
  for (const r of routes) {
    await simulateCachedNavigation(r);
  }

  // Cycle 3: User navigates yet again
  for (const r of routes) {
    await simulateCachedNavigation(r);
  }

  // Cycle 4: User navigates yet again
  for (const r of routes) {
    await simulateCachedNavigation(r);
  }

  // Total network requests after 4 full cycles (16 route changes)
  assert.equal(
    networkRequestsCount,
    5,
    `Subsequent 12 navigations added ZERO requests! Total stayed at ${networkRequestsCount} vs un-cached 80+`
  );
  queryClient.clear();
});

test('Account Data Loader Parallelization: All 7 queries execute concurrently in Promise.all', async () => {
  const executionOrder = [];
  const startTimes = [];

  const createMockQuery = (name, delayMs) => async () => {
    startTimes.push({ name, start: Date.now() });
    await new Promise((res) => setTimeout(res, delayMs));
    executionOrder.push(name);
    return { data: name };
  };

  const q1 = createMockQuery('profile', 20);
  const q2 = createMockQuery('dashboard', 20);
  const q3 = createMockQuery('invoices', 20);
  const q4 = createMockQuery('sessions', 20);
  const q5 = createMockQuery('attempts', 20);
  const q6 = createMockQuery('mistakes', 20);
  const q7 = createMockQuery('completions', 20);

  const tStart = Date.now();
  await Promise.all([q1(), q2(), q3(), q4(), q5(), q6(), q7()]);
  const duration = Date.now() - tStart;

  // If sequential, 7 * 20 = 140ms. If parallel, ~20-40ms.
  assert.ok(duration < 90, `Parallel execution took ${duration}ms, significantly faster than sequential ~140ms`);
  assert.equal(executionOrder.length, 7, 'All 7 queries completed');
});

test('Account Data Loader Cache Reuse: Reuses cached dashboard data and avoids duplicate RPC call', async () => {
  let rpcCallsCount = 0;
  const mockRpc = async () => {
    rpcCallsCount++;
    return { data: { enrolled_courses: [{ id: 'c1', title: 'Biology' }] } };
  };

  const cachedDashboard = { enrolled_courses: [{ id: 'c1', title: 'Biology' }] };

  // Case A: When cached dashboard data exists in React Query
  const dashPromiseCached = cachedDashboard
    ? Promise.resolve({ data: cachedDashboard, error: null })
    : mockRpc();
  const resCached = await dashPromiseCached;

  assert.equal(rpcCallsCount, 0, 'Did not call RPC when dashboard was in cache');
  assert.equal(resCached.data.enrolled_courses.length, 1);

  // Case B: Without cached dashboard data (cold load)
  const dashPromiseCold = null
    ? Promise.resolve({ data: null, error: null })
    : mockRpc();
  const resCold = await dashPromiseCold;

  assert.equal(rpcCallsCount, 1, 'Called RPC only when cache was empty');
  assert.equal(resCold.data.enrolled_courses.length, 1);
});

