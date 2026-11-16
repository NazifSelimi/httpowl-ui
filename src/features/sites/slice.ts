/**
 * Which website the dashboard is showing. Remembered in localStorage so a
 * reload stays on the same site; `useCurrentSite` falls back to the first site.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { storage } from '@/shared/utils/storage';

const STORAGE_KEY = 'httpowl:current-site';

interface SitesState {
  currentSiteId: number | null;
}

const saved = Number(storage.get(STORAGE_KEY));
const initialState: SitesState = { currentSiteId: Number.isInteger(saved) && saved > 0 ? saved : null };

const sitesSlice = createSlice({
  name: 'sites',
  initialState,
  reducers: {
    selectSite(state, action: PayloadAction<number>) {
      state.currentSiteId = action.payload;
      storage.set(STORAGE_KEY, String(action.payload));
    },
  },
});

export const { selectSite } = sitesSlice.actions;
export default sitesSlice.reducer;
