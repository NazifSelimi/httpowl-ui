import { ArrowDownRight, Ban } from 'lucide-react';
import type { TrafficRequest } from '@/types';
import { TAG_LABELS } from '@/shared/constants';
import { formatClock } from '@/shared/utils/format';

interface RequestsTableProps {
  requests: TrafficRequest[];
  /** Hide the block column for roles that can't block. */
  canBlock: boolean;
  isBlocked: (ip: string) => boolean;
  /** "You" / "Protected" for IPs that can't be blocked, otherwise null. */
  protectedLabel: (ip: string) => string | null;
  onToggleBlock: (request: TrafficRequest) => void;
  busy: boolean;
}

/** Every request as a row: time, IP + country, request, visitor tag, status, speed, block/undo. */
export default function RequestsTable({ requests, canBlock, isBlocked, protectedLabel, onToggleBlock, busy }: RequestsTableProps) {
  return (
    <div className="table-scroll">
      <table className="traffic-table">
        <thead>
          <tr>
            <th>TIME</th>
            <th>IP ADDRESS</th>
            <th>REQUEST</th>
            <th>VISITOR</th>
            <th>STATUS</th>
            <th>SPEED</th>
            {canBlock && (
              <th>
                <span className="sr-only">Action</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {requests.map((request, index) => {
            const blocked = isBlocked(request.ip);
            const shield = protectedLabel(request.ip);
            return (
              <tr key={`${request.ts}-${request.ip}-${index}`} title={request.reason || request.ua}>
                <td className="mono-text time-cell">{formatClock(request.ts)}</td>
                <td>
                  <span className="ip-cell mono-text">{request.ip}</span>
                  <span className="country-sub">{request.country || 'Unknown'}</span>
                </td>
                <td>
                  <span className="request-cell">
                    <b>{request.method}</b>
                    <span className="mono-text">{request.path}</span>
                  </span>
                </td>
                <td>
                  <span className={`visitor-tag visitor-${request.tag}`}>
                    <i />
                    {TAG_LABELS[request.tag]}
                  </span>
                </td>
                <td>
                  <span className={`status-code ${request.status >= 400 ? 'status-warn' : ''}`}>{request.status}</span>
                </td>
                <td className="speed-cell">{request.duration_ms > 0 ? `${Math.round(request.duration_ms)} ms` : '—'}</td>
                {canBlock && (
                  <td>
                    {shield ? (
                      <span className="protected-badge" title="HTTPowl never blocks you, your server or an open SSH session">
                        {shield}
                      </span>
                    ) : blocked ? (
                      <button className="undo-action" disabled={busy} onClick={() => onToggleBlock(request)}>
                        <ArrowDownRight /> Undo
                      </button>
                    ) : (
                      <button className="block-action" disabled={busy} onClick={() => onToggleBlock(request)}>
                        <Ban /> Block IP
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {requests.length === 0 && <div className="table-empty">No requests match.</div>}
    </div>
  );
}
