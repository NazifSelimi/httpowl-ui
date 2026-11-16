/**
 * The signed-in app shell: sidebar (site switcher, navigation, user), top bar
 * (current page, live-feed status) and the page in <Outlet/>.
 *
 * It also owns the live feed: while the layout is mounted, one WebSocket is
 * open for the current site; switching sites reconnects, leaving closes it.
 */

import { useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Activity, ChevronDown, CircleHelp, FileText, Globe2, History, LogOut, Menu, Settings, ShieldAlert, ShieldCheck, Users, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { baseApi } from '@/api/baseApi';
import { useGetMeQuery, useLogoutMutation } from '@/features/auth/api';
import { connectLiveFeed, disconnectLiveFeed } from '@/features/live/slice';
import { useCurrentSite } from '@/hooks/useCurrentSite';
import { ROLE_LABELS } from '@/shared/constants';
import { initials } from '@/shared/utils/format';
import Brand from '@/components/layout/Brand';
import LoadingState from '@/components/layout/LoadingState';

const MONITOR_LINKS = [
  { label: 'Live traffic', path: '/app/live', icon: Activity },
  { label: 'Threats', path: '/app/threats', icon: ShieldAlert },
  { label: 'Blocked', path: '/app/blocked', icon: ShieldCheck },
  { label: 'Daily notes', path: '/app/notes', icon: FileText },
];

const WORKSPACE_LINKS = [
  { label: 'Team', path: '/app/team', icon: Users },
  { label: 'Change history', path: '/app/history', icon: History },
  { label: 'Settings', path: '/app/settings', icon: Settings },
];

const ALL_LINKS = [...MONITOR_LINKS, ...WORKSPACE_LINKS];

function SidebarLinks({ links, onNavigate }: { links: typeof ALL_LINKS; onNavigate: () => void }) {
  return (
    <>
      {links.map(({ label, path, icon: Icon }) => (
        <NavLink key={path} to={path} onClick={onNavigate} className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </>
  );
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: user } = useGetMeQuery();
  const [logout] = useLogoutMutation();
  const { site, sites, siteId, isLoading, select } = useCurrentSite();
  const connected = useAppSelector((state) => state.live.connected);

  useEffect(() => {
    if (!siteId) return undefined;
    dispatch(connectLiveFeed(siteId));
    return () => {
      dispatch(disconnectLiveFeed());
    };
  }, [dispatch, siteId]);

  if (isLoading) return <LoadingState>Loading your websites…</LoadingState>;
  if (!site) return <Navigate to="/onboarding" replace />;

  const closeMenu = () => setMobileOpen(false);
  const pageLabel = ALL_LINKS.find((link) => pathname.startsWith(link.path))?.label ?? 'Live traffic';

  async function signOut() {
    dispatch(disconnectLiveFeed());
    await logout()
      .unwrap()
      .catch(() => undefined);
    dispatch(baseApi.util.resetApiState());
    navigate('/login');
  }

  return (
    <div className="dashboard-shell">
      <aside className={mobileOpen ? 'dashboard-sidebar sidebar-open' : 'dashboard-sidebar'}>
        <div className="sidebar-brand">
          <Brand to="/app/live" />
          <button className="sidebar-close" aria-label="Close navigation" onClick={closeMenu}>
            <X />
          </button>
        </div>

        <div className="sidebar-workspace">
          <span className="workspace-label">WEBSITE</span>
          <button className="site-switcher" onClick={() => setSwitcherOpen(!switcherOpen)} aria-expanded={switcherOpen}>
            <span className="site-avatar">
              <Globe2 />
            </span>
            <span>
              <b>{site.name}</b>
              <small>
                {site.domain} · {ROLE_LABELS[site.role]}
              </small>
            </span>
            <ChevronDown />
          </button>
          {switcherOpen && (
            <div className="site-menu" role="menu">
              {sites.map((item) => (
                <button
                  key={item.id}
                  role="menuitem"
                  className={item.id === site.id ? 'site-menu-item active' : 'site-menu-item'}
                  onClick={() => {
                    select(item.id);
                    setSwitcherOpen(false);
                  }}
                >
                  {item.name}
                </button>
              ))}
              <button role="menuitem" className="site-menu-item" onClick={() => navigate('/onboarding')}>
                + Add a website
              </button>
            </div>
          )}
        </div>

        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          <span className="workspace-label">MONITOR</span>
          <SidebarLinks links={MONITOR_LINKS} onNavigate={closeMenu} />
          <span className="workspace-label team-label">WORKSPACE</span>
          <SidebarLinks links={WORKSPACE_LINKS} onNavigate={closeMenu} />
        </nav>

        <div className="sidebar-bottom">
          <a className="sidebar-help" href="mailto:hello@httpowl.net">
            <CircleHelp />
            <span>
              <b>Need a hand?</b>
              <small>We’re happy to help.</small>
            </span>
          </a>
          <button className="sidebar-user" onClick={() => void signOut()} aria-label="Sign out">
            <span className="user-avatar">{initials(user?.name || user?.email || '')}</span>
            <span>
              <b>{user?.name || 'Your account'}</b>
              <small>{user?.email}</small>
            </span>
            <LogOut />
          </button>
        </div>
      </aside>

      {mobileOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={closeMenu} />}

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button className="mobile-nav-toggle" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Menu />
            </button>
            <span className="crumb">{site.domain}</span>
            <span className="crumb-separator">/</span>
            <span className="crumb-current">{pageLabel}</span>
          </div>
          <div className="topbar-actions">
            <span className={connected ? 'connection-status is-live' : 'connection-status'}>
              <i />
              {connected ? 'Live feed connected' : 'Connecting…'}
            </span>
            <a className="help-button" href="mailto:hello@httpowl.net">
              <CircleHelp /> Help
            </a>
          </div>
        </header>
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
