/**
 * Threats: the addresses that attacked in the last 24 hours, worst first,
 * with what they tried in plain words and a one-click block (undo on Blocked).
 */

import { useState } from 'react';
import { Check, Eye, LockKeyhole, Shield, ShieldAlert } from 'lucide-react';
import { useGetStatsQuery } from '@/features/traffic/api';
import { useIpBlocks } from '@/features/rules/useIpBlocks';
import { useCurrentSite } from '@/hooks/useCurrentSite';
import { hasRole } from '@/shared/constants';
import { countryName, formatNumber, plural } from '@/shared/utils/format';
import type { TopIp } from '@/types';
import PageHeading from '@/components/layout/PageHeading';
import LoadingState from '@/components/layout/LoadingState';
import { Button } from '@/components/ui/button';

type Severity = 'High' | 'Medium' | 'Low';

function severityOf(attacks: number): Severity {
  if (attacks >= 50) return 'High';
  if (attacks >= 10) return 'Medium';
  return 'Low';
}

export default function ThreatsPage() {
  const { siteId, role } = useCurrentSite();
  const blocks = useIpBlocks(siteId, hasRole(role, 'admin'));
  const [error, setError] = useState<string | null>(null);
  const { data: stats, isLoading } = useGetStatsQuery({ siteId, range: '24h' }, { skip: !hasRole(role, 'viewer') });

  if (!hasRole(role, 'viewer')) {
    return (
      <PageHeading eyebrow="WE’RE ON IT" title="Threats" description="Your role shows the daily note and summary only. Ask the site owner for viewer access." />
    );
  }
  if (isLoading || !stats) return <LoadingState>Looking for suspicious activity…</LoadingState>;

  const attackers: TopIp[] = (stats.top_ips ?? []).filter((ip) => ip.attacks > 0);
  const tried = (stats.top_reasons ?? []).filter((reason) => reason.tag === 'attack');
  const toReview = attackers.filter((ip) => !blocks.isBlocked(ip.ip)).length;

  async function block(ip: TopIp) {
    setError(await blocks.toggle(ip.ip, `Blocked from Threats (${formatNumber(ip.attacks)} attacks)`));
  }

  return (
    <>
      <PageHeading
        eyebrow="WE’RE ON IT"
        title="Threats"
        description="Suspicious activity in the last 24 hours, explained simply. You decide what to do next."
        action={
          <span className="attention-count">
            <ShieldAlert /> {toReview} to review
          </span>
        }
      />

      <div className="plain-banner">
        <div className="plain-icon">
          <Eye />
        </div>
        <div>
          <b>Here’s what we noticed.</b>
          <p>
            {tried.length > 0
              ? tried
                  .slice(0, 3)
                  .map((reason) => `${plural(reason.ips, 'address', 'addresses')} ${reason.reason}`)
                  .join('; ') + '.'
              : 'No attacks in the last 24 hours. Nothing has been blocked without your say-so.'}
          </p>
        </div>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="threat-list">
        {attackers.map((ip) => {
          const severity = severityOf(ip.attacks);
          const blocked = blocks.isBlocked(ip.ip);
          const shield = blocks.protectedLabel(ip.ip);
          return (
            <article key={ip.ip} className={`threat-card ${severity.toLowerCase()}`}>
              <div className="threat-top">
                <span className={`severity-pill severity-${severity.toLowerCase()}`}>
                  <i />
                  {severity} attention
                </span>
              </div>
              <h2>{ip.ip}</h2>
              <p>
                From {countryName(ip.country)}. {formatNumber(ip.attacks)} of its {formatNumber(ip.requests)} requests looked like attacks.
              </p>
              <div className="threat-details">
                <span>
                  <b>From</b>
                  <code>{ip.ip}</code>
                </span>
                <span>
                  <b>Attacks</b>
                  <strong>{formatNumber(ip.attacks)}</strong>
                </span>
                <span>
                  <b>Browser name</b>
                  <strong>{ip.sample_ua || 'none'}</strong>
                </span>
              </div>
              <div className="threat-footer">
                <span>
                  <LockKeyhole />{' '}
                  {shield
                    ? 'This is you or your server, so it can’t be blocked.'
                    : blocked
                      ? 'This visitor is blocked. Undo on the Blocked page.'
                      : 'Nothing has been blocked yet.'}
                </span>
                {blocks.canEdit && !shield && (
                  <Button size="sm" variant={blocked ? 'outline' : 'default'} disabled={blocked || blocks.isBusy} onClick={() => void block(ip)}>
                    {blocked ? (
                      <>
                        <Check data-icon="inline-start" /> Blocked
                      </>
                    ) : (
                      <>
                        <Shield data-icon="inline-start" /> Block this visitor
                      </>
                    )}
                  </Button>
                )}
              </div>
            </article>
          );
        })}
        {attackers.length === 0 && <div className="table-empty">No attacking addresses in the last 24 hours. 👍</div>}
      </div>
    </>
  );
}
