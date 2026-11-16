/**
 * Rules API (injected into baseApi): block and unblock IPs, ranges, countries and bots.
 * Every block can be undone (remove) and every unblock can be undone (restore).
 * The API refuses rules that would block the person, the server or an SSH session.
 */

import { baseApi, API_TAGS } from '@/api/baseApi';
import type { Rule, RuleCheck, RuleKind } from '@/types';

export interface RuleInput {
  siteId: number;
  kind: RuleKind;
  value: string;
  note?: string;
}

const changed = [API_TAGS.Rules, API_TAGS.Audit];

export const rulesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRules: builder.query<Rule[], number>({
      query: (siteId) => `/sites/${siteId}/rules`,
      providesTags: [API_TAGS.Rules],
    }),
    /** Dry run for the confirm step: would this rule be allowed, and what does it do? */
    checkRule: builder.mutation<RuleCheck, RuleInput>({
      query: ({ siteId, ...body }) => ({ url: `/sites/${siteId}/rules/check`, method: 'POST', body }),
    }),
    createRule: builder.mutation<{ rule: Rule; explain: string }, RuleInput>({
      query: ({ siteId, ...body }) => ({ url: `/sites/${siteId}/rules`, method: 'POST', body }),
      invalidatesTags: changed,
    }),
    removeRule: builder.mutation<void, { siteId: number; ruleId: number }>({
      query: ({ siteId, ruleId }) => ({ url: `/sites/${siteId}/rules/${ruleId}`, method: 'DELETE' }),
      invalidatesTags: changed,
    }),
    restoreRule: builder.mutation<{ rule: Rule }, { siteId: number; ruleId: number }>({
      query: ({ siteId, ruleId }) => ({ url: `/sites/${siteId}/rules/${ruleId}/restore`, method: 'POST' }),
      invalidatesTags: changed,
    }),
  }),
});

export const { useGetRulesQuery, useCheckRuleMutation, useCreateRuleMutation, useRemoveRuleMutation, useRestoreRuleMutation } = rulesApi;
