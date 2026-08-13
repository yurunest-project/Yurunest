import type { NextAuthConfig } from "next-auth";

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
        token.employeeId = user.employeeId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role =
          (token.role as "CUSTOMER" | "ADMIN" | "EMPLOYEE" | undefined) ??
          "CUSTOMER";
        session.user.nickname = String(token.nickname ?? "");
        session.user.employeeId =
          typeof token.employeeId === "string" ? token.employeeId : undefined;
      }
      return session;
    },
    authorized() {
      // Route protection is handled in middleware.ts
      return true;
    },
  },
} satisfies NextAuthConfig;
