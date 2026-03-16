import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");
      const isProtected =
        nextUrl.pathname.startsWith("/feed") ||
        nextUrl.pathname.startsWith("/profile") ||
        nextUrl.pathname.startsWith("/matches") ||
        nextUrl.pathname.startsWith("/messages") ||
        nextUrl.pathname.startsWith("/community");

      if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/feed", nextUrl));
      }

      return true;
    },
  },
  providers: [],
};
