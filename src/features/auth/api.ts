/**
 * Auth API (injected into baseApi): sign up, log in, log out, who am I.
 * The session lives in an HttpOnly cookie, so the user object is the only thing the app keeps.
 */

import { baseApi, API_TAGS } from '@/api/baseApi';
import type { User } from '@/types';

interface Credentials {
  email: string;
  password: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: [API_TAGS.Me],
    }),
    login: builder.mutation<User, Credentials>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: Object.values(API_TAGS),
    }),
    signup: builder.mutation<User, Credentials & { name: string }>({
      query: (body) => ({ url: '/auth/signup', method: 'POST', body }),
      invalidatesTags: Object.values(API_TAGS),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
  }),
});

export const { useGetMeQuery, useLoginMutation, useSignupMutation, useLogoutMutation } = authApi;
