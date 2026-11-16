/**
 * The one RTK Query instance for the whole app.
 *
 * Every feature adds its endpoints with `baseApi.injectEndpoints()` in
 * `features/<name>/api.ts`. Auth is the `owl_session` cookie the API sets on
 * login, so requests only need `credentials: 'include'` (no token in JS).
 *
 * A 401 on anything but the auth endpoints means the session ended: the whole
 * cache is reset, `useGetMeQuery` refetches, gets 401 and ProtectedRoute sends
 * the person to /login.
 */

import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

const rawBaseQuery = fetchBaseQuery({ baseUrl: '/api', credentials: 'include' });

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const url = typeof args === 'string' ? args : args.url;
  if (result.error?.status === 401 && !url.startsWith('/auth/')) {
    api.dispatch(baseApi.util.resetApiState());
  }
  return result;
};

/** Cache tags: mutations invalidate them so lists refetch by themselves. */
export const API_TAGS = {
  Me: 'Me',
  Sites: 'Sites',
  Site: 'Site',
  Traffic: 'Traffic',
  Rules: 'Rules',
  Notes: 'Notes',
  Team: 'Team',
  Audit: 'Audit',
} as const;

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: Object.values(API_TAGS),
  endpoints: () => ({}),
});
