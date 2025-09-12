import { auth } from "@/auth/authSetup"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl

  if (!req.auth && pathname === "/checkout") {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})


export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}