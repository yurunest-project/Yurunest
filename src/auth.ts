import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { UserRole } from "@prisma/client";
import authConfig from "@/auth.config";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { checkLoginAllowed, recordLoginAttempt } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validators/auth";

class RateLimitedError extends CredentialsSignin {
  code = "RATE_LIMITED";
}

class EmailNotVerifiedError extends CredentialsSignin {
  code = "EMAIL_NOT_VERIFIED";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "customer",
      name: "Customer",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const email = parsed.data.email.toLowerCase();
        const ip =
          request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          undefined;

        if (!(await checkLoginAllowed(email))) {
          throw new RateLimitedError();
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (
          !user ||
          !(await verifyPassword(parsed.data.password, user.passwordHash))
        ) {
          await recordLoginAttempt(email, false, ip);
          return null;
        }

        if (!user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        await recordLoginAttempt(email, true, ip);

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          nickname: user.nickname,
        };
      },
    }),
  ],
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
  },
});
