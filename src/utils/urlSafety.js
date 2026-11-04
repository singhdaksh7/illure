/**
 * Utility for safe URL validation and sanitization.
 * Prevents javascript: injection, data: URIs, or malformed redirects.
 */

export function isSafeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();

  // Safe internal anchor links (e.g., #catalog, #collections, #brand-story)
  if (trimmed.startsWith('#')) {
    return /^#[a-zA-Z0-9_-]+$/.test(trimmed);
  }

  // Safe internal absolute paths (e.g., /catalog, /shop)
  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//') && !trimmed.includes('\\');
  }

  // Reject malicious schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return false;
  }

  // Safe external URLs
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function sanitizeUrl(url, fallback = '#') {
  return isSafeUrl(url) ? url.trim() : fallback;
}
