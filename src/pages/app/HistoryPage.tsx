/**
 * Change history: the audit log for this website — who did what, and when.
 * Admins and owners only (the API enforces it).
 */

import { Globe2, LockKeyhole, Settings2, Shield, Users } from 'lucide-react';
import { useGetAuditQuery } from '@/features/team/api';
import { useCurrentSite } from '@/hooks/useCurrentSite';
import { hasRole } from '@/shared/constants';
import { formatDateTime } from '@/shared/utils/format';
import type { AuditEntry } from '@/types';
import PageHeading from '@/components/layout/PageHeading';
import LoadingState from '@/components/layout/LoadingState';
import ErrorNotice from '@/components/layout/ErrorNotice';

/** Plain words for each audit action the API writes. */
const ACTION_TEXT: Record<string, string> = {
  'site.create': 'Added the website',
  'site.update': 'Changed the website details',
  'site.delete': 'Deleted the website',
  'agent.token_created': 'Created a new agent token',
  'rule.create': 'Blocked',
  'rule.remove': 'Unblocked',
  'rule.restore': 'Restored a block',
  'team.invite': 'Invited',
  'team.invite_accepted': 'Accepted an invite',
  'team.invite_cancel': 'Cancelled an invite',
  'team.add': 'Added to the team',
  'team.role': 'Changed a role',
  'team.remove': 'Removed from the team',
  'team.leave': 'Left the team',
};

const ICONS = { rule: Shield, team: Users, site: Globe2, agent: Settings2 };

function describe(entry: AuditEntry): string {
  const d = entry.detail;
  const what = [d.kind, d.value, d.email, d.role, d.domain].filter((part) => typeof part === 'string' && part).join(' · ');
  return what || '';
}

export default function HistoryPage() {
  const { siteId, role } = useCurrentSite();
  const { data: entries = [], isLoading, error } = useGetAuditQuery(siteId, { skip: !hasRole(role, 'admin') });

  if (!hasRole(role, 'admin')) {
    return <PageHeading eyebrow="A CLEAR RECORD, ALWAYS" title="Change history" description="Admins and owners can see the change history." />;
  }
  if (isLoading) return <LoadingState>Loading your history…</LoadingState>;

  return (
    <>
      <PageHeading
        eyebrow="A CLEAR RECORD, ALWAYS"
        title="Change history"
        description="See who changed what and when. Nothing gets lost or swept under the rug."
      />
      <ErrorNotice error={error} />
      <section className="panel history-panel">
        <div className="panel-head">
          <div>
            <h2>Recent activity</h2>
            <p>The last 100 changes to this website</p>
          </div>
        </div>
        <div className="history-list">
          {entries.map((entry) => {
            const type = entry.action.split('.')[0] as keyof typeof ICONS;
            const Icon = ICONS[type] ?? Settings2;
            return (
              <article key={entry.id} className="history-item">
                <div className={`history-icon history-${type === 'rule' ? 'block' : type}`}>
                  <Icon />
                </div>
                <div className="history-copy">
                  <b>{ACTION_TEXT[entry.action] ?? entry.action}</b>
                  <p>{describe(entry)}</p>
                  <span>{entry.user_email ?? 'HTTPowl'}</span>
                </div>
                <time dateTime={entry.created_at}>{formatDateTime(entry.created_at)}</time>
              </article>
            );
          })}
          {entries.length === 0 && <div className="table-empty">No changes yet.</div>}
        </div>
      </section>
      <p className="list-footnote">
        <LockKeyhole /> Only admins and owners of this website can see this history.
      </p>
    </>
  );
}
