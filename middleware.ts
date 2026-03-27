import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/login"];

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isPublicPath = PUBLIC_PATHS.some((path) => nextUrl.pathname.startsWith(path));
  const isAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicAsset =
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname === "/favicon.ico";

  if (isAuthRoute || isPublicAsset) {
    return NextResponse.next();
  }

  if (!session && !isPublicPath) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
