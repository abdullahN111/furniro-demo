import { auth } from "@/auth/authSetup";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname, search } = req.nextUrl;

  if (!req.auth && pathname === "/checkout") {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (
    req.auth &&
    (pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/create-account")
  ) {
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
    const target =
      callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/";
    return NextResponse.redirect(new URL(target, req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
