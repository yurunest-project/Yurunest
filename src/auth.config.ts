import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";

export default {
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.nickname = user.nickname;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = token.role as UserRole;
        session.user.nickname = String(token.nickname ?? "");
      }
      return session;
    },
    authorized() {
      // Route protection is handled in middleware.ts
      return true;
    },
  },
} satisfies NextAuthConfig;
