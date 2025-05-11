import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 1. Only check auth on paths that need it (avoids unnecessary requests)
  const shouldCheckAuth = ![
    "/auth",
    "/_next",
    "/favicon.ico",
    "/api",
    "/login",
  ].some((prefix) => request.nextUrl.pathname.startsWith(prefix));

  if (!shouldCheckAuth) return supabaseResponse; // Prevents checking auth for static or unimportant paths

  // 2. Important: Only get the user if needed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth")
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 3. Prevent infinite redirects by checking if we're already on the target page
  if (request.nextUrl.pathname === "/" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sessions";
    if (url.pathname === request.nextUrl.pathname) {
      return supabaseResponse; // Avoid unnecessary redirect if we're already on the target page
    }
    return NextResponse.redirect(url);
  }

  // if
  // User is logged in
  // User tries to access login page
  // then
  // Redirect user to sessions page
  if (request.nextUrl.pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sessions";
    if (url.pathname === request.nextUrl.pathname) {
      return supabaseResponse; // Avoid unnecessary redirect if we're already on the target page
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
