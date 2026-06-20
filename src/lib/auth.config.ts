import type { NextAuthConfig } from "next-auth";

const STANDALONE =
  process.env.NEXT_PUBLIC_STANDALONE === "true" ||
  process.env.STANDALONE === "true";

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request }) {
      if (STANDALONE) return true;

      const isLoggedIn = !!auth?.user;
      const path = request.nextUrl.pathname;
      const isPublic =
        path.startsWith("/login") ||
        path.startsWith("/register") ||
        path.startsWith("/api/auth") ||
        path.startsWith("/api/register") ||
        path === "/manifest.webmanifest";

      if (!isLoggedIn && !isPublic) return false;
      if (isLoggedIn && (path === "/login" || path === "/register")) {
        return Response.redirect(new URL("/", request.nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
