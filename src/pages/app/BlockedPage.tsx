/**
 * Blocked: every active block (IP, range, country, bot) with Undo, the
 * recently unblocked ones with Restore, and a form to add a block. Before a
 * block is saved the API's dry run says in plain words what it will do (or why
 * it is refused, e.g. it would lock you out).
 */

import { useState, type FormEvent } from 'react';
import { ArrowDownRight, LockKeyhole, RotateCcw, ShieldCheck } from 'lucide-react';
import { useCheckRuleMutation, useCreateRuleMutation, useGetRulesQuery, useRemoveRuleMutation, useRestoreRuleMutation } from '@/features/rules/api';
import { useGetSiteQuery } from '@/features/sites/api';
import { useCurrentSite } from '@/hooks/useCurrentSite';
import { hasRole } from '@/shared/constants';
import { extractErrorMessage } from '@/shared/utils/error';
import { formatDateTime } from '@/shared/utils/format';
import type { Rule, RuleCheck, RuleKind, Site } from '@/types';
import PageHeading from '@/components/layout/PageHeading';
import LoadingState from '@/components/layout/LoadingState';
import ErrorNotice from '@/components/layout/ErrorNotice';
import { Button } from '@/components/ui/button';

const KIND_LABELS: Record<RuleKind, string> = { ip: 'IP address', cidr: 'IP range', country: 'Country', bot: 'Bot' };
const KIND_PLACEHOLDERS: Record<RuleKind, string> = { ip: '203.0.113.7', cidr: '203.0.113.0/24', country: 'CN', bot: 'ahrefsbot' };

function AddBlockForm({ siteId }: { siteId: number }) {
  const [kind, setKind] = useState<RuleKind>('ip');
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [check, setCheck] = useState<RuleCheck | null>(null);
  const [checkRule, checkState] = useCheckRuleMutation();
  const [createRule, createState] = useCreateRuleMutation();

  function reset() {
    setValue('');
    setNote('');
    setCheck(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!check?.ok) {
      setCheck(
        await checkRule({ siteId, kind, value })
          .unwrap()
          .catch((error: unknown) => ({ ok: false, error: extractErrorMessage(error) })),
      );
      return;
    }
    await createRule({ siteId, kind, value, note })
      .unwrap()
      .then(reset)
      .catch(() => undefined);
  }

  return (
    <form className="panel settings-panel" onSubmit={submit}>
      <div className="settings-section-head">
        <div>
          <h2>Block something</h2>
          <p>Blocks stop web traffic (ports 80/443) on your server. SSH and everything else stay open.</p>
        </div>
      </div>
      <div className="invite-form">
        <div>
          <select
            value={kind}
            onChange={(event) => {
              setKind(event.target.value as RuleKind);
              setCheck(null);
            }}
            aria-label="What to block"
          >
            {(Object.keys(KIND_LABELS) as RuleKind[]).map((item) => (
              <option key={item} value={item}>
                {KIND_LABELS[item]}
              </option>
            ))}
          </select>
          <input
            required
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setCheck(null);
            }}
            placeholder={KIND_PLACEHOLDERS[kind]}
            aria-label="Value"
          />
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Why? (optional)" aria-label="Note" maxLength={200} />
          <Button type="submit" disabled={checkState.isLoading || createState.isLoading}>
            {check?.ok ? 'Confirm block' : 'Check'}
          </Button>
        </div>
        {check &&
          (check.ok ? (
            <small>{check.explain}</small>
          ) : (
            <p className="form-error" role="alert">
              {check.error}
            </p>
          ))}
        <ErrorNotice error={createState.error} />
      </div>
    </form>
  );
}

/** Says which websites this site's blocks reach, and warns when one-website blocks aren't active yet. */
function ScopeBanner({ site, activeCount }: { site?: Site; activeCount: number }) {
  if (!site) return null;
  const failure = site.agent_info?.site_blocks_error;
  if (failure) {
    return (
      <div className="plain-banner banner-red" role="alert">
        <div>
          <b>Website blocks are NOT active.</b>
          <p className="form-error">{failure}</p>
          {site.agent_info?.site_blocks === 'nginx' && (
            <p>Your server kept its previous list, so your websites stay up. Fix the problem above on the server; HTTPowl retries every 30 seconds.</p>
          )}
        </div>
      </div>
    );
  }
  if (site.block_scope === 'site') {
    const notActive = site.agent_info && site.agent_info.site_blocks !== 'nginx' && activeCount > 0;
    return (
      <div className="plain-banner">
        <div>
          <b>Only {site.domain}.</b>
          <p>Blocks here keep visitors away from this website only. Your other websites on the same server stay open to them.</p>
          {notActive && (
            <>
              <p className="form-error">These blocks aren’t active yet: the server needs a one-time setup. Run this on it; it asks first and can be undone:</p>
              <code className="mono-text">sudo httpowl-agent setup-blocks</code>
            </>
          )}
        </div>
      </div>
    );
  }
  if (!site.serves?.length) return null;
  return (
    <div className="plain-banner">
      <div>
        <b>Whole server.</b>
        <p>
          Blocks here keep visitors away from every website on this server: {[site.domain, ...site.serves].join(', ')}. To block someone from one website only,
          open that website and block them there.
        </p>
      </div>
    </div>
  );
}

export default function BlockedPage() {
  const { siteId, role } = useCurrentSite();
  const canEdit = hasRole(role, 'admin');
  const { data: site } = useGetSiteQuery(siteId, { skip: !siteId });
  const { data: rules = [], isLoading, error } = useGetRulesQuery(siteId, { skip: !hasRole(role, 'viewer') });
  const [removeRule, removeState] = useRemoveRuleMutation();
  const [restoreRule, restoreState] = useRestoreRuleMutation();

  if (!hasRole(role, 'viewer')) {
    return <PageHeading eyebrow="YOUR PROTECTION LIST" title="Blocked" description="Your role shows the daily note and summary only." />;
  }
  if (isLoading) return <LoadingState>Loading your protection list…</LoadingState>;

  const active = rules.filter((rule) => !rule.removed_at);
  // Unblocked rules that can be restored: skip ones already blocked again, and show each block once.
  const activeKeys = new Set(active.map((rule) => `${rule.kind}:${rule.value}`));
  const seen = new Set<string>();
  const removed = rules.filter((rule) => {
    const key = `${rule.kind}:${rule.value}`;
    if (!rule.removed_at || activeKeys.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const busy = removeState.isLoading || restoreState.isLoading;

  const row = (rule: Rule, action: React.ReactNode) => (
    <tr key={rule.id}>
      <td className="mono-text">{rule.value}</td>
      <td>
        <span className="type-pill">{KIND_LABELS[rule.kind]}</span>
      </td>
      <td>{rule.note || '—'}</td>
      <td>{(rule.removed_at ? rule.removed_by_email : rule.created_by_email) ?? 'HTTPowl'}</td>
      <td>{formatDateTime(rule.removed_at ?? rule.created_at)}</td>
      <td>{canEdit && action}</td>
    </tr>
  );

  return (
    <>
      <PageHeading
        eyebrow="YOUR PROTECTION LIST"
        title="Blocked"
        description="These visitors can’t reach your website right now. Change your mind anytime."
        action={
          <span className="blocked-total">
            <ShieldCheck /> {active.length} active blocks
          </span>
        }
      />
      <div className="plain-banner banner-green">
        <div className="plain-icon">
          <ShieldCheck />
        </div>
        <div>
          <b>You’re in control.</b>
          <p>HTTPowl only blocks what you approve, and never you, your server or your SSH session. Select “Undo” to let anyone back in.</p>
        </div>
      </div>

      <ScopeBanner site={site} activeCount={active.length} />

      {canEdit && <AddBlockForm siteId={siteId} />}
      <ErrorNotice error={error ?? removeState.error ?? restoreState.error} />

      <section className="panel entity-panel">
        <div className="panel-head">
          <div>
            <h2>Active blocks</h2>
            <p>IPs, ranges, countries and bots you’ve kept away</p>
          </div>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>VISITOR</th>
                <th>TYPE</th>
                <th>WHY</th>
                <th>BLOCKED BY</th>
                <th>WHEN</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {active.map((rule) =>
                row(
                  rule,
                  <button className="undo-action" disabled={busy} onClick={() => void removeRule({ siteId, ruleId: rule.id })}>
                    <ArrowDownRight /> Undo
                  </button>,
                ),
              )}
            </tbody>
          </table>
          {active.length === 0 && <div className="table-empty">Nothing blocked. Your protection list is clear.</div>}
        </div>
      </section>

      {removed.length > 0 && (
        <section className="panel entity-panel">
          <div className="panel-head">
            <div>
              <h2>Recently unblocked</h2>
              <p>Changed your mind again? Restore puts the block back.</p>
            </div>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <tbody>
                {removed.map((rule) =>
                  row(
                    rule,
                    <button className="undo-action" disabled={busy} onClick={() => void restoreRule({ siteId, ruleId: rule.id })}>
                      <RotateCcw /> Restore
                    </button>,
                  ),
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="list-footnote">
        <LockKeyhole /> Every block and unblock is recorded in Change history.
      </p>
    </>
  );
}
