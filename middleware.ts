import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// CSP se define solo en next.config.js para evitar cabeceras duplicadas que bloquean eval
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|sw.js).*)",
  ],
};
