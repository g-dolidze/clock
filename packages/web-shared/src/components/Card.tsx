import type { HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm",
        className,
      )}
      {...rest}
    />
  );
}
