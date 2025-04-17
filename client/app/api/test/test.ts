// /app/api/hello/route.ts
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();

  return Response.json({ cookies: allCookies });
}
