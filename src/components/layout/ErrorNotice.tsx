import { CircleAlert } from 'lucide-react';
import { extractErrorMessage } from '@/shared/utils/error';

/** Shows the API's plain-words error for a failed query or mutation. */
export default function ErrorNotice({ error, fallback }: { error: unknown; fallback?: string }) {
  if (!error) return null;
  return (
    <p className="form-error" role="alert">
      <CircleAlert size={14} /> {extractErrorMessage(error, fallback)}
    </p>
  );
}
