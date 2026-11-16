/**
 * Traffic API (injected into baseApi): summary stats and the stored request list.
 * Live requests arrive over the WebSocket instead (features/live).
 */

import { baseApi, API_TAGS } from '@/api/baseApi';
import type { RequestsPage, Stats, TimeRange, VisitorTag } from '@/types';

export interface RequestsQuery {
  siteId: number;
  range: TimeRange;
  tag?: VisitorTag;
  limit?: number;
}

export const trafficApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query<Stats, { siteId: number; range: TimeRange }>({
      query: ({ siteId, range }) => `/sites/${siteId}/stats?range=${range}`,
      providesTags: [API_TAGS.Traffic],
    }),
    getRequests: builder.query<RequestsPage, RequestsQuery>({
      query: ({ siteId, range, tag, limit = 100 }) => ({
        url: `/sites/${siteId}/requests`,
        params: { range, limit, ...(tag ? { tag } : {}) },
      }),
      providesTags: [API_TAGS.Traffic],
    }),
  }),
});

export const { useGetStatsQuery, useGetRequestsQuery } = trafficApi;
