/**
 * The requests list grouped by IP: one row per visitor with its totals,
 * worst tag, busiest pages and one Block/Undo for the whole IP. Clicking a
 * row opens that IP's own requests (newest first, up to MAX_DETAIL).
 */

import { Fragment, useState } from 'react';
import { ArrowDownRight, Ban, ChevronDown, ChevronRight } from 'lucide-react';
import type { IpGroup } from '@/features/traffic/groupByIp';
import { TAG_LABELS } from '@/shared/constants';
import { formatClock, formatNumber, timeAgo } from '@/shared/utils/format';
import type { VisitorTag } from '@/types';

const MAX_DETAIL = 50;
const TAG_ORDER: VisitorTag[] = ['attack', 'bot', 'human'];

interface IpGroupsTableProps {
  groups: IpGroup[];
  canBlock: boolean;
  isBlocked: (ip: string) => boolean;
  protectedLabel: (ip: string) => string | null;
  onToggleBlock: (group: IpGroup) => void;
  busy: boolean;
}

/** "12 human · 3 attack" — only the tags this IP actually had. */
function tagBreakdown(tags: IpGroup['tags']): string {
  return TAG_ORDER.filter((tag) => tags[tag] > 0)
    .map((tag) => `${formatNumber(tags[tag])} ${TAG_LABELS[tag].toLowerCase()}`)
    .join(' · ');
}

export default function IpGroupsTable({ groups, canBlock, isBlocked, protectedLabel, onToggleBlock, busy }: IpGroupsTableProps) {
  const [open, setOpen] = useState<string | null>(null);
  const columns = canBlock ? 6 : 5;

  return (
    <div className="table-scroll">
      <table className="traffic-table ip-groups-table">
        <thead>
          <tr>
            <th>IP ADDRESS</th>
            <th>REQUESTS</th>
            <th>VISITOR</th>
            <th>BUSIEST PAGES</th>
            <th>ERRORS</th>
            {canBlock && (
              <th>
                <span className="sr-only">Action</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => {
            const expanded = open === group.ip;
            const shield = protectedLabel(group.ip);
            const blocked = isBlocked(group.ip);
            return (
              <Fragment key={group.ip}>
                <tr className={expanded ? 'ip-group-row expanded' : 'ip-group-row'} onClick={() => setOpen(expanded ? null : group.ip)} title={group.reason}>
                  <td>
                    <span className="ip-group-ip">
                      {expanded ? <ChevronDown /> : <ChevronRight />}
                      <span>
                        <span className="ip-cell mono-text">{group.ip}</span>
                        <span className="country-sub">{group.country || 'Unknown'}</span>
                      </span>
                    </span>
                  </td>
                  <td>
                    <b className="ip-group-count">{formatNumber(group.count)}</b>
                    <span className="country-sub">seen {timeAgo(group.lastSeen)}</span>
                  </td>
                  <td>
                    <span className={`visitor-tag visitor-${group.tag}`}>
                      <i />
                      {TAG_LABELS[group.tag]}
                    </span>
                    <span className="country-sub">{tagBreakdown(group.tags)}</span>
                  </td>
                  <td>
                    {group.topPaths.map(({ path, count }) => (
                      <span key={path} className="ip-group-path mono-text">
                        {path}
                        {count > 1 && <small> ×{formatNumber(count)}</small>}
                      </span>
                    ))}
                  </td>
                  <td>
                    <span className={`status-code ${group.errors > 0 ? 'status-warn' : ''}`}>{formatNumber(group.errors)}</span>
                  </td>
                  {canBlock && (
                    <td onClick={(event) => event.stopPropagation()}>
                      {shield ? (
                        <span className="protected-badge" title="HTTPowl never blocks you, your server or an open SSH session">
                          {shield}
                        </span>
                      ) : blocked ? (
                        <button className="undo-action" disabled={busy} onClick={() => onToggleBlock(group)}>
                          <ArrowDownRight /> Undo
                        </button>
                      ) : (
                        <button className="block-action" disabled={busy} onClick={() => onToggleBlock(group)}>
                          <Ban /> Block IP
                        </button>
                      )}
                    </td>
                  )}
                </tr>
                {expanded && (
                  <tr className="ip-group-detail">
                    <td colSpan={columns}>
                      {group.reason && <p className="ip-group-reason">Why it was flagged: {group.reason}</p>}
                      <ul>
                        {group.requests.slice(0, MAX_DETAIL).map((request, index) => (
                          <li key={`${request.ts}-${index}`}>
                            <span className="mono-text time-cell">{formatClock(request.ts)}</span>
                            <span className="request-cell">
                              <b>{request.method}</b>
                              <span className="mono-text">{request.path}</span>
                            </span>
                            <span className={`visitor-tag visitor-${request.tag}`}>
                              <i />
                              {TAG_LABELS[request.tag]}
                            </span>
                            <span className={`status-code ${request.status >= 400 ? 'status-warn' : ''}`}>{request.status}</span>
                          </li>
                        ))}
                      </ul>
                      {group.count > MAX_DETAIL && (
                        <p className="ip-group-reason">
                          Showing the newest {MAX_DETAIL} of {formatNumber(group.count)} requests.
                        </p>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
      {groups.length === 0 && <div className="table-empty">No requests match.</div>}
    </div>
  );
}
