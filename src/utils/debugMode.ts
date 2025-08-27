/**
 * Determines if the application is in debug mode.
 * Debug mode is enabled when:
 * 1. NODE_ENV is 'development', OR
 * 2. URL has query parameter 'debug=true'
 */
export function isDebugMode(): boolean {
  // Check NODE_ENV for development
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Check for debug query parameter (only in browser environment)
  const hasDebugParam =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === 'true';

  return isDevelopment && hasDebugParam;
}
