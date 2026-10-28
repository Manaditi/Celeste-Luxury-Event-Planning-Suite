/**
 * Debounce a function call to prevent high-frequency firing.
 * Highly useful for live search filters, inputs, and resizing events.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delayMs);
  };
}

/**
 * Throttle a function to run at most once every `limitMs`.
 * Ideal for scroll listeners and high-frequency animations.
 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limitMs);
    }
  };
}

/**
 * Safe JSON parser with typed fallback to prevent runtime exceptions.
 */
export function safeJsonParse<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
}
