import { sendVerificationEmail } from "@/lib/email-auth";
import { prisma } from "@/lib/prisma";
import { createSecureToken, tokenExpiresInHours } from "@/lib/tokens";

export const VERIFICATION_RESEND_COOLDOWN_MS = 60_000;

type VerificationUser = {
  id: string;
  email: string;
  nickname: string;
};

export async function issueAndSendVerificationEmail(user: VerificationUser) {
  const recent = await prisma.emailVerificationToken.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  if (
    recent &&
    recent.createdAt.getTime() > Date.now() - VERIFICATION_RESEND_COOLDOWN_MS
  ) {
    return { ok: false as const, reason: "rate_limited" as const };
  }

  const token = createSecureToken();
  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } }),
    prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: tokenExpiresInHours(24),
      },
    }),
  ]);

  await sendVerificationEmail({
    to: user.email,
    nickname: user.nickname,
    token,
  });

  return { ok: true as const };
}
