import { useEffect, type RefObject } from "react";

export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  callback: () => void,
  active: boolean = true
) {
  useEffect(() => {
    if (!active) return;

    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };

    // Delay to next frame to avoid catching the click that triggered opening
    const frame = requestAnimationFrame(() => {
      document.addEventListener("mousedown", handler);
      document.addEventListener("touchstart", handler);
    });

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, callback, active]);
}
