/**
 * localStorage that never throws (private mode, blocked site data, full quota).
 * Only for small conveniences such as the last chosen site.
 */

export const storage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Not saved; the app still works, it just forgets on reload.
    }
  },
};
