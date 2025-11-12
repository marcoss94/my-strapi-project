import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { STRAPI_BASE_URL } from "./lib/strapi";

const protectedRoutes = ["/dashboard"];

function checkIsProtectedRoute(path: string) {
  return protectedRoutes.includes(path);
}

export async function proxy(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;

  const isProtectedRoute = checkIsProtectedRoute(currentPath);
  if (!isProtectedRoute) return NextResponse.next();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("jwt")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    const response = await fetch(`${STRAPI_BASE_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const userResponse = await response.json();
    if (!userResponse) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    return NextResponse.next();
  } catch (error) {
    console.error("Error proxying request:", error);
    return NextResponse.redirect(new URL("/signin", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
