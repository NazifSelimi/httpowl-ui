import { useState } from 'react';

/** Copies text and shows "Copied" for two seconds. */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return { copied, copy };
}
