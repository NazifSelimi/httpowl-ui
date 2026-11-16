/**
 * Live traffic state: the chosen time range, list filters and the newest
 * requests pushed over the WebSocket (see ./websocketMiddleware).
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TimeRange, TrafficRequest, VisitorTag } from '@/types';

export type TagFilter = 'all' | VisitorTag;

/** Requests list layout: one row per IP (default) or one row per request. */
export type RequestsView = 'ip' | 'requests';

/** How many pushed requests to keep on screen. */
const MAX_RECENT = 50;

interface LiveState {
  range: TimeRange;
  search: string;
  filter: TagFilter;
  view: RequestsView;
  connected: boolean;
  recent: TrafficRequest[];
}

const initialState: LiveState = { range: '24h', search: '', filter: 'all', view: 'ip', connected: false, recent: [] };

const liveSlice = createSlice({
  name: 'live',
  initialState,
  reducers: {
    setRange(state, action: PayloadAction<TimeRange>) {
      state.range = action.payload;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setFilter(state, action: PayloadAction<TagFilter>) {
      state.filter = action.payload;
    },
    setView(state, action: PayloadAction<RequestsView>) {
      state.view = action.payload;
    },
    /** Handled by websocketMiddleware: open the live feed for a site. */
    connectLiveFeed(state, _action: PayloadAction<number>) {
      state.recent = [];
    },
    /** Handled by websocketMiddleware: close the live feed. */
    disconnectLiveFeed() {},
    feedConnectionChanged(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },
    receiveLiveRequests(state, action: PayloadAction<TrafficRequest[]>) {
      state.recent = [...[...action.payload].reverse(), ...state.recent].slice(0, MAX_RECENT);
    },
  },
});

export const { setRange, setSearch, setFilter, setView, connectLiveFeed, disconnectLiveFeed, feedConnectionChanged, receiveLiveRequests } = liveSlice.actions;
export default liveSlice.reducer;
