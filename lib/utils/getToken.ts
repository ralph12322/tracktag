import { parse } from 'cookie';

export function getTokenFromCookie() {
  if (typeof document === 'undefined') return null;
  const cookies = parse(document.cookie || '');
  return cookies.authToken || null;
}
