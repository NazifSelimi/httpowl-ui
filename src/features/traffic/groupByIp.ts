/**
 * Folds a request list into one row per IP, so a visitor that made 300
 * requests is one line instead of 300. Pure function: the Live page runs it
 * over the loaded + live requests after search and tag filters are applied.
 */

import type { TrafficRequest, VisitorTag } from '@/types';

export interface IpGroup {
  ip: string;
  country: string;
  count: number;
  /** Newest request first (the order requests arrive in). */
  requests: TrafficRequest[];
  lastSeen: string;
  tags: Record<VisitorTag, number>;
  /** The "worst" tag seen: attack > bot > human. Drives the row colour. */
  tag: VisitorTag;
  /** Plain-words reason of the newest non-human request, if any. */
  reason: string;
  /** Most requested paths, busiest first (max 3). */
  topPaths: { path: string; count: number }[];
  errors: number;
}

const TAG_WEIGHT: Record<VisitorTag, number> = { human: 0, bot: 1, attack: 2 };

/** Groups requests by IP; busiest IPs first, ties broken by most recent. */
export function groupByIp(requests: TrafficRequest[]): IpGroup[] {
  const groups = new Map<string, IpGroup & { paths: Map<string, number> }>();
  for (const request of requests) {
    let group = groups.get(request.ip);
    if (!group) {
      group = {
        ip: request.ip,
        country: request.country,
        count: 0,
        requests: [],
        lastSeen: request.ts,
        tags: { human: 0, bot: 0, attack: 0 },
        tag: 'human',
        reason: '',
        topPaths: [],
        errors: 0,
        paths: new Map(),
      };
      groups.set(request.ip, group);
    }
    group.count += 1;
    group.requests.push(request);
    group.tags[request.tag] += 1;
    if (TAG_WEIGHT[request.tag] > TAG_WEIGHT[group.tag]) group.tag = request.tag;
    if (!group.reason && request.reason) group.reason = request.reason;
    // Compare as times: stored rows and live events may use different ISO offsets (Z vs +01:00).
    if (Date.parse(request.ts) > Date.parse(group.lastSeen)) group.lastSeen = request.ts;
    if (request.status >= 400) group.errors += 1;
    group.paths.set(request.path, (group.paths.get(request.path) ?? 0) + 1);
  }

  return [...groups.values()]
    .map(({ paths, ...group }) => ({
      ...group,
      topPaths: [...paths.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([path, count]) => ({ path, count })),
    }))
    .sort((a, b) => b.count - a.count || Date.parse(b.lastSeen) - Date.parse(a.lastSeen));
}
