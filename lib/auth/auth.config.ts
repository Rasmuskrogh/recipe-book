import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnApp =
        nextUrl.pathname.startsWith("/feed") ||
        nextUrl.pathname.startsWith("/recipes") ||
        nextUrl.pathname.startsWith("/profile") ||
        nextUrl.pathname.startsWith("/friends") ||
        nextUrl.pathname.startsWith("/messages") ||
        nextUrl.pathname.startsWith("/groups");
      if (isOnApp && !isLoggedIn) return false;
      return true;
    },
  },
  providers: [],
};
