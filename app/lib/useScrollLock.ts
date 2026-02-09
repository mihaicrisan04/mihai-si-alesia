import { useEffect } from "react";

/**
 * Lock body scroll without layout shift or scroll-position jump.
 *
 * Sets `overflow: hidden` on `<html>` and compensates for the removed
 * scrollbar with `padding-right`. No `position: fixed` — scroll position
 * is naturally preserved by the browser.
 *
 * Approach borrowed from Headless UI / Radix.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const html = document.documentElement;
    const body = document.body;

    // Measure scrollbar width before hiding overflow
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    const prevOverflow = html.style.overflow;
    const prevPaddingRight = html.style.paddingRight;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      html.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      html.style.overflow = prevOverflow;
      html.style.paddingRight = prevPaddingRight;
      body.style.overflow = prevBodyOverflow;
    };
  }, [locked]);
}
