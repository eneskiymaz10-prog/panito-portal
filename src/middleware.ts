import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // First handle i18n routing
  const intlResponse = intlMiddleware(request);

  // Then handle Supabase auth session
  const supabaseResponse = await updateSession(request);

  // If supabase middleware returns a redirect, use that
  if (supabaseResponse.headers.get("location")) {
    return supabaseResponse;
  }

  // Copy supabase cookies to intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
