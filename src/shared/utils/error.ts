/**
 * Turns any error into one sentence for the user.
 *
 * The API always answers errors as {"error": "plain words message"}, so that
 * text is shown as-is. Network failures and anything else get `fallback`.
 */

import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

export function extractErrorMessage(error: FetchBaseQueryError | SerializedError | unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (typeof error === 'object' && error !== null) {
    if ('data' in error) {
      const data = (error as FetchBaseQueryError).data;
      if (typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string') {
        return data.error;
      }
    }
    if ('status' in error && error.status === 'FETCH_ERROR') {
      return 'Could not reach HTTPowl. Check your connection and try again.';
    }
  }
  return fallback;
}
