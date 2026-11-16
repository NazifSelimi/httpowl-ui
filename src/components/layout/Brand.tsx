import { Link } from 'react-router-dom';

/** The two owl eyes. Styles: `.owl-mark` in styles/. */
export function OwlMark() {
  return (
    <span className="owl-mark" aria-hidden="true">
      <i />
      <i />
    </span>
  );
}

/** Logo + "httpowl." wordmark, linking to `to`. */
export default function Brand({ to = '/' }: { to?: string }) {
  return (
    <Link className="brand" to={to} aria-label="HTTPowl home">
      <OwlMark />
      <span>
        httpowl<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
