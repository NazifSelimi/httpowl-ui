/**
 * Sites API (injected into baseApi): the websites a person can see, and the agent token.
 */

import { baseApi, API_TAGS } from '@/api/baseApi';
import type { Site, SiteSummary } from '@/types';

interface SiteInput {
  name?: string;
  domain: string;
}

export interface AgentToken {
  token: string;
  install_command: string;
  note: string;
}

export const sitesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSites: builder.query<SiteSummary[], void>({
      query: () => '/sites',
      providesTags: [API_TAGS.Sites],
    }),
    getSite: builder.query<Site, number>({
      query: (siteId) => `/sites/${siteId}`,
      providesTags: [API_TAGS.Site],
    }),
    addSite: builder.mutation<SiteSummary, SiteInput>({
      query: (body) => ({ url: '/sites', method: 'POST', body }),
      invalidatesTags: [API_TAGS.Sites],
    }),
    updateSite: builder.mutation<void, SiteInput & { siteId: number }>({
      query: ({ siteId, ...body }) => ({ url: `/sites/${siteId}`, method: 'PATCH', body }),
      invalidatesTags: [API_TAGS.Sites, API_TAGS.Site, API_TAGS.Audit],
    }),
    deleteSite: builder.mutation<void, number>({
      query: (siteId) => ({ url: `/sites/${siteId}`, method: 'DELETE' }),
      invalidatesTags: [API_TAGS.Sites],
    }),
    /** New agent token; shown once, and the previous token stops working. */
    createAgentToken: builder.mutation<AgentToken, number>({
      query: (siteId) => ({ url: `/sites/${siteId}/agent-token`, method: 'POST' }),
      invalidatesTags: [API_TAGS.Site, API_TAGS.Audit],
    }),
  }),
});

export const { useGetSitesQuery, useGetSiteQuery, useAddSiteMutation, useUpdateSiteMutation, useDeleteSiteMutation, useCreateAgentTokenMutation } = sitesApi;
