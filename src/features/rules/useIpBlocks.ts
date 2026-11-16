/**
 * One-click IP blocking for tables and cards: tells whether an IP is blocked
 * right now and blocks/unblocks it. Unblocking removes the rule (which can be
 * restored on the Blocked page), so every click can be undone.
 *
 * Your own IP, the server's IPs and live SSH sessions are never offered for
 * blocking (the API refuses them anyway); `protectedLabel` names them instead.
 */

import { useGetRulesQuery, useCreateRuleMutation, useRemoveRuleMutation } from './api';
import { useGetMeQuery } from '@/features/auth/api';
import { useGetSiteQuery } from '@/features/sites/api';
import { extractErrorMessage } from '@/shared/utils/error';

export function useIpBlocks(siteId: number, canEdit: boolean) {
  const { data: rules = [] } = useGetRulesQuery(siteId, { skip: !siteId });
  const [createRule, createState] = useCreateRuleMutation();
  const [removeRule, removeState] = useRemoveRuleMutation();
  const { data: me } = useGetMeQuery();
  const { data: site } = useGetSiteQuery(siteId, { skip: !siteId || !canEdit });
  const protectedIps = new Set(site?.protected_ips ?? []);

  const activeIpRules = new Map(rules.filter((rule) => rule.kind === 'ip' && !rule.removed_at).map((rule) => [rule.value, rule.id]));

  /** Returns an error sentence, or null when it worked. */
  async function toggle(ip: string, note: string): Promise<string | null> {
    const ruleId = activeIpRules.get(ip);
    try {
      if (ruleId) await removeRule({ siteId, ruleId }).unwrap();
      else await createRule({ siteId, kind: 'ip', value: ip, note }).unwrap();
      return null;
    } catch (error) {
      return extractErrorMessage(error, 'Could not change this block.');
    }
  }

  return {
    canEdit,
    isBlocked: (ip: string) => activeIpRules.has(ip),
    /** "You", "Protected" (server / SSH session) or null when the IP can be blocked. */
    protectedLabel: (ip: string): string | null => (ip === me?.ip ? 'You' : protectedIps.has(ip) ? 'Protected' : null),
    toggle,
    isBusy: createState.isLoading || removeState.isLoading,
  };
}
