/**
 * Live traffic: what the owl says today, the numbers for the chosen range,
 * a chart, top countries and every request (stored + pushed live), each with
 * a one-click block that can be undone.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ChevronRight, CircleAlert, Globe2, Search, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useGetRequestsQuery, useGetStatsQuery } from '@/features/traffic/api';
import { useGetTodayNoteQuery } from '@/features/notes/api';
import { setFilter, setRange, setSearch, setView, type TagFilter } from '@/features/live/slice';
import { groupByIp, type IpGroup } from '@/features/traffic/groupByIp';
import { useIpBlocks } from '@/features/rules/useIpBlocks';
import { useCurrentSite } from '@/hooks/useCurrentSite';
import { hasRole, TAG_LABELS } from '@/shared/constants';
import { bucketLabel, formatNumber } from '@/shared/utils/format';
import type { TrafficRequest } from '@/types';
import PageHeading from '@/components/layout/PageHeading';
import LoadingState from '@/components/layout/LoadingState';
import { OwlMark } from '@/components/layout/Brand';
import StatCard from '@/components/dashboard/StatCard';
import RangePicker from '@/components/dashboard/RangePicker';
import TrafficChart from '@/components/dashboard/TrafficChart';
import CountryList from '@/components/dashboard/CountryList';
import RequestsTable from '@/components/dashboard/RequestsTable';
import IpGroupsTable from '@/components/dashboard/IpGroupsTable';

const FILTERS: TagFilter[] = ['all', 'human', 'bot', 'attack'];

function matches(request: TrafficRequest, filter: TagFilter, search: string): boolean {
  if (filter !== 'all' && request.tag !== filter) return false;
  if (!search) return true;
  return `${request.ip} ${request.path} ${request.country} ${request.method}`.toLowerCase().includes(search);
}

export default function LivePage() {
  const dispatch = useAppDispatch();
  const live = useAppSelector((state) => state.live);
  const { siteId, role } = useCurrentSite();
  const canSeeRequests = hasRole(role, 'viewer');
  const blocks = useIpBlocks(siteId, hasRole(role, 'admin'));
  const [blockError, setBlockError] = useState<string | null>(null);

  const { data: stats, isLoading } = useGetStatsQuery({ siteId, range: live.range }, { pollingInterval: 60_000 });
  const { data: note } = useGetTodayNoteQuery(siteId);
  const { data: page } = useGetRequestsQuery({ siteId, range: live.range, limit: 500 }, { skip: !canSeeRequests, pollingInterval: 60_000 });

  if (isLoading || !stats) return <LoadingState>Finding your latest requests…</LoadingState>;

  const { totals } = stats;
  const search = live.search.trim().toLowerCase();
  // Live events newer than the newest stored row; older ones are already in `page` after a refresh.
  const stored = page?.requests ?? [];
  const newestStored = stored.length ? Date.parse(stored[0].ts) : 0;
  const fresh = live.recent.filter((request) => Date.parse(request.ts) > newestStored);
  const requests = [...fresh, ...stored].filter((request) => matches(request, live.filter, search));
  const groups = live.view === 'ip' ? groupByIp(requests) : [];
  const peak = stats.series.reduce(
    (best, point) => (point.attacks > (best?.attacks ?? 0) ? point : best),
    undefined as (typeof stats.series)[number] | undefined,
  );

  async function toggleBlock(request: TrafficRequest) {
    setBlockError(await blocks.toggle(request.ip, `Blocked from live traffic (${request.reason || request.path})`));
  }

  async function toggleGroupBlock(group: IpGroup) {
    setBlockError(await blocks.toggle(group.ip, `Blocked from live traffic (${group.reason || `${group.count} requests`})`));
  }

  return (
    <>
      <PageHeading
        eyebrow="YOUR WEBSITE, RIGHT NOW"
        title="Live traffic"
        description="A clear view of who’s visiting your website and what they’re up to."
        action={<RangePicker value={live.range} onChange={(range) => dispatch(setRange(range))} />}
      />

      {note && (
        <section className="owl-summary">
          <div className="summary-icon">
            <OwlMark />
          </div>
          <div>
            <span className="summary-label">
              <Sparkles /> OWL SAYS
            </span>
            <p>{note.body.split('\n').slice(0, 2).join(' ')}</p>
          </div>
        </section>
      )}

      <section className="stats-grid" aria-label="Traffic summary">
        <StatCard
          label="Requests"
          value={formatNumber(totals.requests)}
          hint={`${formatNumber(totals.unique_ips)} different addresses`}
          icon={Activity}
          tone="stat-cyan"
        />
        <StatCard label="People" value={formatNumber(totals.humans)} hint="Real visitors" icon={Users} tone="stat-violet" />
        <StatCard label="Bots" value={formatNumber(totals.bots)} hint="Search engines & scripts" icon={Globe2} tone="stat-blue" />
        <StatCard
          label="Attacks"
          value={formatNumber(totals.attacks)}
          hint={totals.attacks ? 'See Threats for details' : 'Nothing suspicious'}
          icon={ShieldCheck}
          tone="stat-amber"
        />
        <StatCard label="Errors" value={formatNumber(totals.errors_5xx)} hint="Server errors (5xx)" icon={CircleAlert} tone="stat-coral" />
      </section>

      <section className="analytics-grid">
        <article className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h2>Requests over time</h2>
              <p>Visits to your website in the last {live.range}</p>
            </div>
            <div className="chart-legend" aria-label="Chart legend">
              <i /> Requests{' '}
              <span>
                <i /> Attacks
              </span>
            </div>
          </div>
          <TrafficChart series={stats.series} bucketSeconds={stats.bucket_seconds} from={stats.from} to={stats.to} />
          {peak && (
            <div className="chart-spike">
              <span className="spike-mark">
                <ShieldCheck />
              </span>
              <span>
                <b>Most attacks around {bucketLabel(peak.bucket, stats.bucket_seconds)}</b>
                <small>{formatNumber(peak.attacks)} suspicious requests in that period.</small>
              </span>
              <Link to="/app/threats">
                Take a look <ChevronRight />
              </Link>
            </div>
          )}
        </article>

        <article className="panel countries-panel">
          <div className="panel-head">
            <div>
              <h2>Where visitors are</h2>
              <p>Top countries in the last {live.range}</p>
            </div>
          </div>
          <CountryList countries={stats.countries} total={totals.requests} />
        </article>
      </section>

      {canSeeRequests && (
        <section className="panel requests-panel">
          <div className="panel-head requests-head">
            <div>
              <h2>
                Recent requests{' '}
                <span className="live-badge">
                  <i /> LIVE
                </span>
              </h2>
              <p>Every visit, in plain sight</p>
            </div>
            <div className="table-tools">
              <label className="traffic-search">
                <Search />
                <span className="sr-only">Search requests</span>
                <input value={live.search} onChange={(event) => dispatch(setSearch(event.target.value))} placeholder="Search IP or page…" />
              </label>
            </div>
          </div>
          <div className="filter-row">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => dispatch(setFilter(filter))}
                className={live.filter === filter ? 'filter-chip active' : 'filter-chip'}
                aria-pressed={live.filter === filter}
              >
                {filter === 'all' ? 'All visitors' : TAG_LABELS[filter]}
              </button>
            ))}
            <div className="view-switch" aria-label="Group requests">
              <button className={live.view === 'ip' ? 'active' : ''} aria-pressed={live.view === 'ip'} onClick={() => dispatch(setView('ip'))}>
                By IP
              </button>
              <button
                className={live.view === 'requests' ? 'active' : ''}
                aria-pressed={live.view === 'requests'}
                onClick={() => dispatch(setView('requests'))}
              >
                Every request
              </button>
            </div>
          </div>
          {blockError && (
            <p className="form-error" role="alert">
              {blockError}
            </p>
          )}
          {live.view === 'ip' ? (
            <IpGroupsTable
              groups={groups}
              canBlock={blocks.canEdit}
              isBlocked={blocks.isBlocked}
              protectedLabel={blocks.protectedLabel}
              onToggleBlock={(group) => void toggleGroupBlock(group)}
              busy={blocks.isBusy}
            />
          ) : (
            <RequestsTable
              requests={requests}
              canBlock={blocks.canEdit}
              isBlocked={blocks.isBlocked}
              protectedLabel={blocks.protectedLabel}
              onToggleBlock={(request) => void toggleBlock(request)}
              busy={blocks.isBusy}
            />
          )}
          <div className="table-footer">
            <span>
              {live.view === 'ip' ? (
                <>
                  <b>{groups.length}</b> different IPs made <b>{requests.length}</b> recent requests
                </>
              ) : (
                <>
                  Showing <b>{requests.length}</b> recent requests
                </>
              )}
            </span>
          </div>
        </section>
      )}
    </>
  );
}
