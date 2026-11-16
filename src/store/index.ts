/**
 * Redux store — the single source of client state.
 *
 * Shape of the state:
 *   api   – RTK Query cache for every endpoint (server data; refetched, never saved)
 *   sites – which website the dashboard shows (saved to localStorage)
 *   live  – range, filters and requests pushed over the WebSocket
 *
 * Feature API modules are imported first so their injectEndpoints() runs
 * before any component asks for a hook.
 */

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { baseApi } from '@/api/baseApi';
import sitesReducer from '@/features/sites/slice';
import liveReducer from '@/features/live/slice';
import { websocketMiddleware } from '@/features/live/websocketMiddleware';

// Register endpoints on baseApi (these modules add endpoints, not reducers).
import '@/features/auth/api';
import '@/features/sites/api';
import '@/features/traffic/api';
import '@/features/rules/api';
import '@/features/notes/api';
import '@/features/team/api';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    sites: sitesReducer,
    live: liveReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware, websocketMiddleware),
});

// Refetch on window focus / reconnect (RTK Query `refetchOnFocus` options).
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
