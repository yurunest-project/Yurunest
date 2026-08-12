import type { UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

type AccountRole = UserRole | "EMPLOYEE";

declare module "next-auth" {
  interface User {
    id: string;
    role: AccountRole;
    nickname: string;
    employeeId?: string;
  }

  interface Session {
    user: {
      id: string;
      role: AccountRole;
      nickname: string;
      employeeId?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: AccountRole;
    nickname?: string;
    employeeId?: string;
  }
}
