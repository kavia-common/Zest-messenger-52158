/**
 * Small utility to avoid spamming refetches when multiple events arrive quickly.
 */

export function createDebouncedRefetch(fn: () => void | Promise<void>, delayMs: number) {
  let timer: number | null = null;

  return () => {
    if (timer != null) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      timer = null;
      void fn();
    }, delayMs);
  };
}
