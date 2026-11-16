/**
 * The website the dashboard is showing: the saved choice if the person still
 * has access to it, otherwise their first site. `site` is undefined while the
 * list loads or when they have no sites yet (DashboardLayout then sends them to onboarding).
 */

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useGetSitesQuery } from '@/features/sites/api';
import { selectSite } from '@/features/sites/slice';

export function useCurrentSite() {
  const dispatch = useAppDispatch();
  const savedId = useAppSelector((state) => state.sites.currentSiteId);
  const { data: sites = [], isLoading } = useGetSitesQuery();
  const site = sites.find((item) => item.id === savedId) ?? sites[0];

  return {
    site,
    sites,
    isLoading,
    siteId: site?.id ?? 0,
    role: site?.role,
    select: (id: number) => dispatch(selectSite(id)),
  };
}
