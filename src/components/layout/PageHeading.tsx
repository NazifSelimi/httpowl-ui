import type { ReactNode } from 'react';

interface PageHeadingProps {
  /** Small all-caps line above the title. */
  eyebrow: string;
  title: string;
  description: string;
  /** Controls on the right (range picker, buttons). */
  action?: ReactNode;
}

/** The top of every dashboard page: one h1, a sentence, optional actions. */
export default function PageHeading({ eyebrow, title, description, action }: PageHeadingProps) {
  return (
    <div className="page-heading">
      <div>
        <span className="page-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="page-heading-action">{action}</div>}
    </div>
  );
}
