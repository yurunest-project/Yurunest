import { prisma } from "@/lib/prisma";

const WINDOW_MINUTES = 15;
const MAX_FAILURES = 5;

export async function checkLoginAllowed(email: string) {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  const failures = await prisma.loginAttempt.count({
    where: {
      email: email.toLowerCase(),
      success: false,
      createdAt: { gte: since },
    },
  });

  return failures < MAX_FAILURES;
}

export async function recordLoginAttempt(
  email: string,
  success: boolean,
  ipAddress?: string,
) {
  await prisma.loginAttempt.create({
    data: {
      email: email.toLowerCase(),
      success,
      ipAddress,
    },
  });
}
