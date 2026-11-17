/**
 * Data shapes returned by the HTTPowl API (see httpowl-api/API.md).
 * Field names match the JSON exactly (snake_case), so no mapping layer is needed.
 */

export type Role = 'owner' | 'admin' | 'viewer' | 'client';
export type VisitorTag = 'human' | 'bot' | 'attack';
export type TimeRange = '15m' | '1h' | '24h' | '7d' | '30d';
export type RuleKind = 'ip' | 'cidr' | 'country' | 'bot';

export interface User {
  id: number;
  email: string;
  name: string;
  /** The IP this browser connects from (as the API sees it). */
  ip?: string;
}

export interface SiteSummary {
  id: number;
  name: string;
  domain: string;
  role: Role;
  created_at: string;
  agent_last_seen_at: string | null;
}

/** What the agent reports every minute (admins and owners only). */
export interface AgentInfo {
  version?: string;
  hostname?: string;
  os?: string;
  servers?: string[] | null;
  log_paths?: string[] | null;
  firewall?: string;
  rules_applied?: number;
  last_error?: string;
  /** false: the server's log has no domain names, so visits to all its sites land on one site. */
  logs_have_domain?: boolean;
  /** "nginx" when blocks for one website only are set up on the server (`setup-blocks`). */
  site_blocks?: string;
  /** Why one-website blocks are not working right now (nginx rejected the list, reload failed). */
  site_blocks_error?: string;
}

export interface Site extends SiteSummary {
  agent_online: boolean;
  agent_info?: AgentInfo;
  token_prefix?: string;
  /** Server IPs and live SSH sessions: the API never lets these be blocked (admins and owners only). */
  protected_ips?: string[];
  /** "site": blocks reach only this domain; "server": the whole server, including every domain in `serves`. */
  block_scope: 'site' | 'server';
  serves?: string[];
}

export interface Totals {
  requests: number;
  humans: number;
  bots: number;
  attacks: number;
  unique_ips: number;
  bytes: number;
  errors_5xx: number;
  errors_4xx: number;
  avg_ms: number;
}

export interface SeriesPoint {
  bucket: string;
  humans: number;
  bots: number;
  attacks: number;
  errors_5xx: number;
}

export interface CountryCount {
  country: string;
  requests: number;
  attacks: number;
}

export interface TopIp {
  ip: string;
  country: string;
  requests: number;
  attacks: number;
  sample_ua: string;
}

export interface TopPath {
  path: string;
  requests: number;
  errors: number;
  avg_ms: number;
}

export interface TopReason {
  tag: VisitorTag;
  reason: string;
  requests: number;
  ips: number;
}

export interface Stats {
  from: string;
  to: string;
  bucket_seconds: number;
  totals: Totals;
  series: SeriesPoint[];
  countries: CountryCount[];
  /** Viewer and up only. */
  top_ips?: TopIp[];
  top_paths?: TopPath[];
  top_reasons?: TopReason[];
}

/** One stored request (also the shape of live WebSocket events, minus a few fields). */
export interface TrafficRequest {
  ts: string;
  ip: string;
  method: string;
  path: string;
  query?: string;
  status: number;
  duration_ms: number;
  ua: string;
  country: string;
  tag: VisitorTag;
  reason: string;
}

export interface RequestsPage {
  requests: TrafficRequest[];
  next_before?: string;
}

export interface Rule {
  id: number;
  kind: RuleKind;
  value: string;
  note: string;
  created_at: string;
  created_by_email: string | null;
  expires_at: string | null;
  removed_at: string | null;
  removed_by_email: string | null;
}

export interface RuleCheck {
  ok: boolean;
  value?: string;
  error?: string;
  explain?: string;
}

export interface DailyNote {
  day: string;
  body: string;
  stats: { totals?: Totals; new_rules?: number };
}

export interface TeamMember {
  id: number;
  email: string;
  name: string;
  role: Role;
  created_at: string;
}

export interface TeamInvite {
  email: string;
  role: Role;
  created_at: string;
}

export interface Team {
  members: TeamMember[];
  invites: TeamInvite[];
  roles: Record<Role, string>;
}

export interface AuditEntry {
  id: number;
  action: string;
  detail: Record<string, unknown>;
  ip: string;
  created_at: string;
  user_email: string | null;
}
