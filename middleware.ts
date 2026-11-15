import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 120;

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // OWASP & Strict Content-Security-Policy Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=(self)"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' https://api.qrserver.com data:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; frame-src https://challenges.cloudflare.com; connect-src 'self';"
  );

  // Sliding-Window API Rate Limiting
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
      response.headers.set("X-RateLimit-Limit", String(MAX_REQUESTS));
      response.headers.set("X-RateLimit-Remaining", String(MAX_REQUESTS - 1));
    } else {
      record.count += 1;
      const remaining = Math.max(0, MAX_REQUESTS - record.count);
      response.headers.set("X-RateLimit-Limit", String(MAX_REQUESTS));
      response.headers.set("X-RateLimit-Remaining", String(remaining));

      if (record.count > MAX_REQUESTS) {
        return NextResponse.json(
          { success: false, error: "Too many requests. Please try again shortly." },
          { status: 429, headers: response.headers }
        );
      }
    }

    response.headers.set("Cache-Control", "no-store, max-age=0");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
