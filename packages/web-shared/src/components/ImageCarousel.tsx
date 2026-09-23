import { useEffect, useState } from "react";
import clsx from "clsx";

export interface ImageCarouselProps {
  images: string[];
  /** Applied to the first slide only; later slides get alt="" to avoid
   *  screen readers repeating the same description for what's one photo set. */
  alt: string;
  className?: string;
  /** Interval in ms to auto-advance one slide at a time. Omit to disable. */
  autoPlayMs?: number;
  showArrows?: boolean;
  showDots?: boolean;
}

const MAX_IMAGES = 10;

export function ImageCarousel({
  images,
  alt,
  className,
  autoPlayMs,
  showArrows = true,
  showDots = true,
}: ImageCarouselProps) {
  const slides = images.slice(0, MAX_IMAGES);
  const count = slides.length;
  // Clamped during render (not reset via effect) so a shorter `images`
  // prop never leaves the index pointing past the end of the array.
  const [rawIndex, setIndex] = useState(0);
  const index = count > 0 ? ((rawIndex % count) + count) % count : 0;

  useEffect(() => {
    if (!autoPlayMs || count <= 1) return;
    const interval = setInterval(() => {
      setIndex((i) => i + 1);
    }, autoPlayMs);
    return () => clearInterval(interval);
  }, [autoPlayMs, count]);

  if (count === 0) return null;

  function go(next: number) {
    setIndex(next);
  }

  return (
    <div className={clsx("group relative overflow-hidden", className)}>
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={i === 0 ? alt : ""}
            loading={i === 0 ? "eager" : "lazy"}
            className="h-full w-full shrink-0 object-cover"
          />
        ))}
      </div>

      {showArrows && count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => go(index - 1)}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => go(index + 1)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {showDots && count > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              onClick={() => go(i)}
              className={clsx(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-4 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
