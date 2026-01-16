import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter (for production use Redis)
const rateLimit = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

function getRateLimitKey(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    return ip;
}

function isRateLimited(key: string): boolean {
    const now = Date.now();
    const record = rateLimit.get(key);

    if (!record || now - record.lastReset > RATE_LIMIT_WINDOW) {
        rateLimit.set(key, { count: 1, lastReset: now });
        return false;
    }

    record.count++;
    return record.count > RATE_LIMIT_MAX;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Rate limit API routes
    if (pathname.startsWith('/api/')) {
        const key = getRateLimitKey(request);
        if (isRateLimited(key)) {
            return new NextResponse('Too Many Requests', {
                status: 429,
                headers: { 'Retry-After': '60' },
            });
        }
    }

    // Create response with security headers
    const response = NextResponse.next();

    // Security Headers
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');

    // XSS Protection
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Strict Transport Security (HSTS)
    if (process.env.NODE_ENV === 'production') {
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    // Content Security Policy
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://apis.google.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' https://generativelanguage.googleapis.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://apis.google.com https://www.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com",
        "frame-src https://accounts.google.com https://*.firebaseapp.com",
        "frame-ancestors 'none'",
    ].join('; ');
    response.headers.set('Content-Security-Policy', csp);

    return response;
}

// Only run on specific paths (exclude static files)
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
    ],
};
