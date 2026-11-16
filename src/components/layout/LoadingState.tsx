/** A calm "loading…" line with the pulsing dot, used while a page's data arrives. */
export default function LoadingState({ children = 'Loading…' }: { children?: React.ReactNode }) {
  return (
    <div className="loading-state" role="status">
      <span className="pulse-dot" /> {children}
    </div>
  );
}
