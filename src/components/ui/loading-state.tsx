export function LoadingState({ label = "Loading memories…" }: { label?: string }) {
  return <div role="status" className="loading-state"><span className="spinner" aria-hidden="true" /><span>{label}</span></div>;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton ${className}`} />;
}
