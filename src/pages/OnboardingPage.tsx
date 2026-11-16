/**
 * First-run setup: add a website → get the one-line agent installer →
 * wait until the agent reports in → open the dashboard.
 * Only the agent connection exists today; proxy and plugin are not built yet.
 */

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, CheckCircle2, Clipboard, Globe2, LoaderCircle } from 'lucide-react';
import { useAddSiteMutation, useCreateAgentTokenMutation, useGetSiteQuery } from '@/features/sites/api';
import { useAppDispatch } from '@/app/hooks';
import { selectSite } from '@/features/sites/slice';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { OwlMark } from '@/components/layout/Brand';
import ErrorNotice from '@/components/layout/ErrorNotice';
import { Button } from '@/components/ui/button';

const STEPS = ['Add website', 'Install agent', 'First request'];

function WaitForAgent({ siteId, domain, onReady }: { siteId: number; domain: string; onReady: () => void }) {
  const { data: site } = useGetSiteQuery(siteId, { pollingInterval: 5000 });
  if (site?.agent_online) {
    return (
      <div className="wizard-content success-content">
        <div className="success-orb">
          <CheckCircle2 />
        </div>
        <div className="section-kicker">YOU’RE ALL SET</div>
        <h1>{domain} is on watch.</h1>
        <p>The agent on {site.agent_info?.hostname ?? 'your server'} is connected. Your live traffic view is ready.</p>
        <Button onClick={onReady}>
          Open live traffic <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    );
  }
  return (
    <div className="wizard-content waiting-content">
      <div className="waiting-orbit">
        <span />
        <LoaderCircle />
      </div>
      <div className="section-kicker">LISTENING FOR YOUR AGENT</div>
      <h1>We’re keeping an eye out.</h1>
      <p>
        As soon as the agent on <b>{domain}</b>’s server starts, this page moves on by itself.
      </p>
      <div className="waiting-status">
        <span className="pulse-dot" /> Waiting for {domain}
      </div>
      <button className="simulate-link" onClick={onReady}>
        Skip and open the dashboard
      </button>
    </div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(0);
  const [domain, setDomain] = useState('');
  const [siteId, setSiteId] = useState(0);
  const [addSite, addState] = useAddSiteMutation();
  const [createToken, tokenState] = useCreateAgentTokenMutation();
  const { copied, copy } = useCopyToClipboard();
  const command = tokenState.data?.install_command ?? '';

  async function saveDomain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const site = await addSite({ domain: domain.trim() }).unwrap();
      setDomain(site.domain);
      setSiteId(site.id);
      dispatch(selectSite(site.id));
      await createToken(site.id).unwrap();
      setStep(1);
    } catch {
      // Shown by <ErrorNotice/> below the form.
    }
  }

  function openDashboard() {
    navigate('/app/live');
  }

  return (
    <main className="onboarding-page">
      <header className="onboarding-header">
        <Link className="brand" to="/app/live">
          <OwlMark />
          <span>
            httpowl<span className="brand-dot">.</span>
          </span>
        </Link>
        <span>Quick setup · about 2 minutes</span>
        <button onClick={openDashboard}>Skip for now</button>
      </header>

      <section className="onboarding-card">
        <div className="onboarding-steps" aria-label="Setup progress">
          {STEPS.map((title, index) => (
            <div key={title} className={step >= index ? 'step active' : 'step'}>
              <span>{step > index ? <Check size={13} /> : index + 1}</span>
              <small>{title}</small>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="wizard-content">
            <div className="wizard-icon">
              <Globe2 />
            </div>
            <div className="section-kicker">STEP 1 · YOUR WEBSITE</div>
            <h1>Which website should we watch?</h1>
            <p>Start with the site you care about most. You can add more later.</p>
            <form className="wizard-form" onSubmit={saveDomain}>
              <label htmlFor="domain">Website address</label>
              <input
                id="domain"
                type="text"
                required
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                placeholder="yourstore.com"
                autoComplete="url"
              />
              <Button type="submit" disabled={addState.isLoading || tokenState.isLoading}>
                Continue <ArrowRight data-icon="inline-end" />
              </Button>
            </form>
            <ErrorNotice error={addState.error ?? tokenState.error} />
            <span className="wizard-footnote">
              <CheckCircle2 /> Free for your first website. No credit card needed.
            </span>
          </div>
        )}

        {step === 1 && (
          <div className="wizard-content">
            <div className="wizard-icon">
              <Clipboard />
            </div>
            <div className="section-kicker">STEP 2 · CONNECT {domain.toUpperCase()}</div>
            <h1>One line and you’re connected.</h1>
            <p>Run this on the server that hosts {domain} (Linux, as root). It finds nginx, Apache, Caddy, LiteSpeed or Traefik logs by itself.</p>
            <div className="install-command">
              <code>{command}</code>
              <button onClick={() => void copy(command)} aria-label="Copy install command">
                {copied ? <Check /> : <Clipboard />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="wizard-footnote">
              <CheckCircle2 /> The token is shown only once. Windows/IIS: use install.ps1 from httpowl.net/install.ps1.
            </p>
            <div className="wizard-actions">
              <Button onClick={() => setStep(2)}>
                I’ve run it <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && <WaitForAgent siteId={siteId} domain={domain} onReady={openDashboard} />}
      </section>

      <footer className="onboarding-footer">
        <span>
          Need a hand? <a href="mailto:hello@httpowl.net">Talk to a real person</a>
        </span>
        <span>Removing the agent removes every block it added.</span>
      </footer>
    </main>
  );
}
