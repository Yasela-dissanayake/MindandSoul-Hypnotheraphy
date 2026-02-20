import { type NextRequest } from "next/server";

function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

export function isAuthorizedInternalRequest(request: NextRequest): boolean {
  const expectedToken = process.env.ADMIN_API_TOKEN;

  // In development, allow access even without token for local testing.
  if (!expectedToken && process.env.NODE_ENV !== "production") {
    return true;
  }

  if (!expectedToken) {
    return false;
  }

  const headerToken = request.headers.get("x-admin-token")?.trim();
  const bearerToken = extractBearerToken(request.headers.get("authorization"));

  return headerToken === expectedToken || bearerToken === expectedToken;
}
