import { auth } from "@/auth/authSetup"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl

  if (!req.auth && pathname === "/checkout") {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    return NextResponse.redirect(loginUrl)
  }
  if (req.auth && pathname === "/login" || req.auth && pathname === "/create-account") {
    const homeUrl = new URL("/", req.nextUrl.origin)
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
})


export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}