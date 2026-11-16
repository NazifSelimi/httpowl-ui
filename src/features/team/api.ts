/**
 * Team and audit API (injected into baseApi): who can see a site, with which
 * role, and the record of every change.
 */

import { baseApi, API_TAGS } from '@/api/baseApi';
import type { AuditEntry, Role, Team } from '@/types';

const changed = [API_TAGS.Team, API_TAGS.Audit];

export const teamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeam: builder.query<Team, number>({
      query: (siteId) => `/sites/${siteId}/team`,
      providesTags: [API_TAGS.Team],
    }),
    /** Adds an existing account, or invites an email that has no account yet. */
    addMember: builder.mutation<{ note?: string }, { siteId: number; email: string; role: Role }>({
      query: ({ siteId, ...body }) => ({ url: `/sites/${siteId}/team`, method: 'POST', body }),
      invalidatesTags: changed,
    }),
    setMemberRole: builder.mutation<void, { siteId: number; userId: number; role: Role }>({
      query: ({ siteId, userId, role }) => ({ url: `/sites/${siteId}/team/${userId}`, method: 'PATCH', body: { role } }),
      invalidatesTags: changed,
    }),
    removeMember: builder.mutation<void, { siteId: number; userId: number }>({
      query: ({ siteId, userId }) => ({ url: `/sites/${siteId}/team/${userId}`, method: 'DELETE' }),
      invalidatesTags: [...changed, API_TAGS.Sites],
    }),
    cancelInvite: builder.mutation<void, { siteId: number; email: string }>({
      query: ({ siteId, email }) => ({ url: `/sites/${siteId}/team/invites/${encodeURIComponent(email)}`, method: 'DELETE' }),
      invalidatesTags: changed,
    }),
    getAudit: builder.query<AuditEntry[], number>({
      query: (siteId) => `/sites/${siteId}/audit`,
      providesTags: [API_TAGS.Audit],
    }),
  }),
});

export const { useGetTeamQuery, useAddMemberMutation, useSetMemberRoleMutation, useRemoveMemberMutation, useCancelInviteMutation, useGetAuditQuery } = teamApi;
