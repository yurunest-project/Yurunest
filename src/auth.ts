import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
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

        const [user, employee] = await Promise.all([
          prisma.user.findUnique({ where: { email } }),
          prisma.employee.findUnique({ where: { email } }),
        ]);

        if (user) {
          if (!(await verifyPassword(parsed.data.password, user.passwordHash))) {
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
        }

        if (
          !employee ||
          !employee.isActive ||
          !employee.passwordHash ||
          !(await verifyPassword(parsed.data.password, employee.passwordHash))
        ) {
          await recordLoginAttempt(email, false, ip);
          return null;
        }

        await recordLoginAttempt(email, true, ip);
        return {
          id: employee.id,
          email: employee.email,
          role: "EMPLOYEE",
          nickname: employee.name,
          employeeId: employee.id,
        };
      },
    }),
    Credentials({
      id: "employee",
      name: "Employee",
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
        const employee = await prisma.employee.findUnique({
          where: { email },
        });
        if (
          !employee ||
          !employee.isActive ||
          !employee.passwordHash ||
          !(await verifyPassword(parsed.data.password, employee.passwordHash))
        ) {
          await recordLoginAttempt(email, false, ip);
          return null;
        }

        await recordLoginAttempt(email, true, ip);
        return {
          id: employee.id,
          email: employee.email,
          role: "EMPLOYEE",
          nickname: employee.name,
          employeeId: employee.id,
        };
      },
    }),
  ],
});
