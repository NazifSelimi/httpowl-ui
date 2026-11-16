/**
 * Settings for the current website: name and domain, the agent (status and a
 * new install command), and deleting the website (owner only).
 */

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Clipboard, Globe2, Server, Trash2 } from 'lucide-react';
import { useCreateAgentTokenMutation, useDeleteSiteMutation, useGetSiteQuery, useUpdateSiteMutation } from '@/features/sites/api';
import { useCurrentSite } from '@/hooks/useCurrentSite';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { hasRole } from '@/shared/constants';
import { timeAgo } from '@/shared/utils/format';
import PageHeading from '@/components/layout/PageHeading';
import LoadingState from '@/components/layout/LoadingState';
import ErrorNotice from '@/components/layout/ErrorNotice';
import { Button } from '@/components/ui/button';

function WebsiteForm({ siteId, name, domain, canEdit }: { siteId: number; name: string; domain: string; canEdit: boolean }) {
  const [form, setForm] = useState({ name, domain });
  const [saved, setSaved] = useState(false);
  const [updateSite, state] = useUpdateSiteMutation();

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateSite({ siteId, ...form })
      .unwrap()
      .then(() => setSaved(true))
      .catch(() => undefined);
  }

  return (
    <form className="panel settings-panel" onSubmit={save}>
      <div className="settings-section-head">
        <span className="settings-symbol">
          <Globe2 />
        </span>
        <div>
          <h2>Your website</h2>
          <p>The name you see in HTTPowl and the domain it watches.</p>
        </div>
      </div>
      <label className="settings-field">
        Name
        <input value={form.name} disabled={!canEdit} onChange={(event) => setForm({ ...form, name: event.target.value })} />
      </label>
      <label className="settings-field">
        Domain
        <input value={form.domain} disabled={!canEdit} onChange={(event) => setForm({ ...form, domain: event.target.value })} />
      </label>
      <ErrorNotice error={state.error} />
      {canEdit && (
        <div className="settings-save">
          <span>{saved && 'Saved your changes'}</span>
          <Button type="submit" disabled={state.isLoading}>
            {state.isLoading ? 'Saving…' : 'Save'}
          </Button>
        </div>
      )}
    </form>
  );
}

function AgentPanel({ siteId }: { siteId: number }) {
  const { data: site } = useGetSiteQuery(siteId, { pollingInterval: 30_000 });
  const [createToken, tokenState] = useCreateAgentTokenMutation();
  const { copied, copy } = useCopyToClipboard();
  const info = site?.agent_info;
  const command = tokenState.data?.install_command;

  return (
    <section className="panel settings-panel">
      <div className="settings-section-head">
        <span className="settings-symbol">
          <Server />
        </span>
        <div>
          <h2>Agent</h2>
          <p>The small program on your server that reads its access logs and applies your blocks.</p>
        </div>
      </div>
      <div className="website-row">
        <span>
          <b>{site?.agent_online ? 'Connected' : 'Not connected'}</b>
          <small>
            {info?.hostname ? `${info.hostname} · ${(info.servers ?? []).join(', ') || 'no web server found'} · firewall: ${info.firewall ?? 'off'} · ` : ''}
            last seen {timeAgo(site?.agent_last_seen_at)}
          </small>
          {info?.last_error && <small className="form-error">{info.last_error}</small>}
        </span>
        {site?.agent_online && (
          <span className="connected-pill">
            <i /> Watching
          </span>
        )}
      </div>
      {command ? (
        <div className="install-command">
          <code>{command}</code>
          <button onClick={() => void copy(command)} aria-label="Copy install command">
            {copied ? <Check /> : <Clipboard />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      ) : (
        <p className="settings-note">
          Token {site?.token_prefix ? `${site.token_prefix}… is active` : 'not created yet'}. A new token shows the install command once and stops the old
          token.
        </p>
      )}
      <ErrorNotice error={tokenState.error} />
      <Button variant="outline" size="sm" disabled={tokenState.isLoading} onClick={() => void createToken(siteId)}>
        New agent token
      </Button>
    </section>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { site, siteId, role } = useCurrentSite();
  const [deleteSite, deleteState] = useDeleteSiteMutation();
  const [confirm, setConfirm] = useState('');

  if (!site) return <LoadingState />;

  async function remove() {
    await deleteSite(siteId)
      .unwrap()
      .then(() => navigate('/app/live'))
      .catch(() => undefined);
  }

  return (
    <>
      <PageHeading eyebrow="MAKE HTTPOWL YOURS" title="Settings" description="Your website and its agent, in one place." />
      <div className="settings-sections">
        <WebsiteForm key={site.id} siteId={siteId} name={site.name} domain={site.domain} canEdit={hasRole(role, 'admin')} />
        {hasRole(role, 'admin') && <AgentPanel siteId={siteId} />}
        {role === 'owner' && (
          <section className="panel settings-panel">
            <div className="settings-section-head">
              <span className="settings-symbol">
                <Trash2 />
              </span>
              <div>
                <h2>Delete this website</h2>
                <p>Removes its traffic, notes, blocks and team access. Type the domain to confirm.</p>
              </div>
            </div>
            <label className="settings-field">
              Domain
              <input value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder={site.domain} />
            </label>
            <ErrorNotice error={deleteState.error} />
            <Button variant="destructive" disabled={confirm !== site.domain || deleteState.isLoading} onClick={() => void remove()}>
              Delete {site.domain}
            </Button>
          </section>
        )}
      </div>
    </>
  );
}
