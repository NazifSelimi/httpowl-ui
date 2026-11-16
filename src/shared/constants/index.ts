import type { Role, TimeRange, VisitorTag } from '@/types';

/** Time ranges offered by the range pickers (the API also accepts 15m). */
export const TIME_RANGES: TimeRange[] = ['1h', '24h', '7d', '30d'];

/** Display names for the request tags the API assigns. */
export const TAG_LABELS: Record<VisitorTag, string> = {
  human: 'Human',
  bot: 'Bot',
  attack: 'Attack',
};

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Admin',
  viewer: 'Viewer',
  client: 'Client',
};

/** Order of power; used to show or hide controls (the API enforces it too). */
const ROLE_RANK: Record<Role, number> = { client: 1, viewer: 2, admin: 3, owner: 4 };

export function hasRole(role: Role | undefined, min: Role): boolean {
  return role !== undefined && ROLE_RANK[role] >= ROLE_RANK[min];
}

/** The one-line agent installer shown in onboarding and settings. */
export function installCommand(token: string): string {
  return `curl -sL https://httpowl.net/install | sudo sh -s -- --token ${token}`;
}
