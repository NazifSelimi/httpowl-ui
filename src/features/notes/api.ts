/**
 * Daily notes API (injected into baseApi): plain-words summaries per day,
 * plus a live "so far today" note that is written on request.
 */

import { baseApi, API_TAGS } from '@/api/baseApi';
import type { DailyNote } from '@/types';

export const notesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotes: builder.query<DailyNote[], number>({
      query: (siteId) => `/sites/${siteId}/notes`,
      providesTags: [API_TAGS.Notes],
    }),
    getTodayNote: builder.query<DailyNote, number>({
      query: (siteId) => `/sites/${siteId}/notes/today`,
      providesTags: [API_TAGS.Notes, API_TAGS.Traffic],
    }),
  }),
});

export const { useGetNotesQuery, useGetTodayNoteQuery } = notesApi;
