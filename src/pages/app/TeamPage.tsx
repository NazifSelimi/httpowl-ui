/**
 * Team: who can see this website and with which role. Owners change roles;
 * admins can add viewers and clients. An email without an account becomes an
 * invite that is accepted when that person signs up.
 */

import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, Mail, Settings2, ShieldCheck, Trash2 } from 'lucide-react';
import { useAddMemberMutation, useCancelInviteMutation, useGetTeamQuery, useRemoveMemberMutation, useSetMemberRoleMutation } from '@/features/team/api';
import { useGetMeQuery } from '@/features/auth/api';
import { useCurrentSite } from '@/hooks/useCurrentSite';
import { hasRole, ROLE_LABELS } from '@/shared/constants';
import { initials } from '@/shared/utils/format';
import type { Role } from '@/types';
import PageHeading from '@/components/layout/PageHeading';
import LoadingState from '@/components/layout/LoadingState';
import ErrorNotice from '@/components/layout/ErrorNotice';
import { Button } from '@/components/ui/button';

const ROLES: Role[] = ['owner', 'admin', 'viewer', 'client'];

export default function TeamPage() {
  const { siteId, role } = useCurrentSite();
  const { data: me } = useGetMeQuery();
  const { data: team, isLoading } = useGetTeamQuery(siteId, { skip: !hasRole(role, 'viewer') });
  const [addMember, addState] = useAddMemberMutation();
  const [setRole, roleState] = useSetMemberRoleMutation();
  const [removeMember, removeState] = useRemoveMemberMutation();
  const [cancelInvite, cancelState] = useCancelInviteMutation();
  const [email, setEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('viewer');
  const [notice, setNotice] = useState('');

  const isOwner = role === 'owner';
  const canInvite = hasRole(role, 'admin');
  const grantable: Role[] = isOwner ? ROLES : ['viewer', 'client'];

  if (!hasRole(role, 'viewer')) {
    return <PageHeading eyebrow="BETTER TOGETHER" title="Your team" description="Your role shows the daily note and summary only." />;
  }
  if (isLoading || !team) return <LoadingState>Loading your team…</LoadingState>;

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await addMember({ siteId, email, role: newRole })
      .unwrap()
      .catch(() => null);
    if (result) {
      setNotice(result.note ?? `${email} can now see this website.`);
      setEmail('');
    }
  }

  return (
    <>
      <PageHeading eyebrow="BETTER TOGETHER" title="Your team" description="Invite people to help keep an eye on things. You choose what they can see." />
      <section className="panel team-panel">
        <div className="panel-head">
          <div>
            <h2>People with access</h2>
            <p>{team.members.length} people can see this website’s activity</p>
          </div>
        </div>

        {canInvite && (
          <form className="invite-form" onSubmit={invite}>
            <label htmlFor="invite-email">
              <Mail /> Add by email
            </label>
            <div>
              <input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="colleague@company.com"
              />
              <select value={newRole} onChange={(event) => setNewRole(event.target.value as Role)} aria-label="Role">
                {grantable.map((item) => (
                  <option key={item} value={item}>
                    {ROLE_LABELS[item]}
                  </option>
                ))}
              </select>
              <Button type="submit" disabled={addState.isLoading}>
                Add <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
            <small>{notice || 'No account yet? They get access as soon as they sign up with this email.'}</small>
          </form>
        )}
        <ErrorNotice error={addState.error ?? roleState.error ?? removeState.error ?? cancelState.error} />

        <div className="team-list">
          {team.members.map((member) => (
            <div className="team-member" key={member.id}>
              <span className="member-avatar">{initials(member.name || member.email)}</span>
              <span className="member-info">
                <b>{member.name || member.email}</b>
                <small>{member.email}</small>
              </span>
              <span className="member-status active">
                <i />
                Active
              </span>
              <select
                aria-label={`Role for ${member.email}`}
                value={member.role}
                disabled={!isOwner || roleState.isLoading}
                onChange={(event) => void setRole({ siteId, userId: member.id, role: event.target.value as Role })}
              >
                {ROLES.map((item) => (
                  <option key={item} value={item}>
                    {ROLE_LABELS[item]}
                  </option>
                ))}
              </select>
              {(isOwner || member.id === me?.id) && (
                <button
                  className="icon-button"
                  aria-label={member.id === me?.id ? 'Leave this website' : `Remove ${member.email}`}
                  onClick={() => void removeMember({ siteId, userId: member.id })}
                >
                  <Trash2 />
                </button>
              )}
            </div>
          ))}
          {team.invites.map((pending) => (
            <div className="team-member" key={pending.email}>
              <span className="member-avatar">{initials(pending.email)}</span>
              <span className="member-info">
                <b>{pending.email}</b>
                <small>Invited as {ROLE_LABELS[pending.role]}</small>
              </span>
              <span className="member-status invited">
                <i />
                Invited
              </span>
              {canInvite && (
                <button
                  className="icon-button"
                  aria-label={`Cancel invite for ${pending.email}`}
                  onClick={() => void cancelInvite({ siteId, email: pending.email })}
                >
                  <Trash2 />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="role-cards">
        <article>
          <ShieldCheck />
          <b>Owner</b>
          <p>{team.roles.owner}</p>
        </article>
        <article>
          <Settings2 />
          <b>Admin</b>
          <p>{team.roles.admin}</p>
        </article>
        <article>
          <Eye />
          <b>Viewer & Client</b>
          <p>
            {team.roles.viewer}. Clients: {team.roles.client.toLowerCase()}.
          </p>
        </article>
      </div>
    </>
  );
}
