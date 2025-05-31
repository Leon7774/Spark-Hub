// utils/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/auth",
  "/_next",
  "/favicon.ico",
  "/api",
  "/login",
  "/register",
];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          response = NextResponse.next();
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const pathname = request.nextUrl.pathname;

  // const isPublicPath = PUBLIC_PATHS.some((prefix) =>
  //   pathname.startsWith(prefix),
  // );
  // if (isPublicPath) return response;

  const isPublicPath =
    PUBLIC_PATHS.some((prefix) => pathname.startsWith(prefix)) ||
    pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/);

  if (isPublicPath) return response;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url);
  };

  if (!user && !pathname.startsWith("/login")) {
    return redirectTo("/login");
  }

  if (user && (pathname === "/" || pathname === "/login")) {
    return redirectTo("/sessions");
  }

  return response;
}
