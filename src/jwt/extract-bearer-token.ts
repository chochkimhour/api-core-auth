export function extractBearerToken(authorizationHeader?: string | null): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const parts = authorizationHeader.trim().split(/\s+/);

  if (parts.length !== 2 || !/^Bearer$/i.test(parts[0]) || parts[1].length === 0) {
    return null;
  }

  return parts[1];
}
