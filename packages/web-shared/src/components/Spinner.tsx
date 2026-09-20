import clsx from "clsx";

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={clsx(
        "h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white",
        className,
      )}
    />
  );
}
