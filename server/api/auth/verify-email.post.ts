import { z } from "zod";

const verifySchema = z.object({
  token: z.string().min(1).max(128),
});

export default defineEventHandler(async (event) => {
  rateLimit(event, {
    name: "verify-email",
    limit: 20,
    windowMs: 15 * 60 * 1000,
  });

  const body = await readValidatedBody(event, (b) => verifySchema.safeParse(b));

  if (!body.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid or missing verification token",
    });
  }

  // Find the user by hashed verification token
  const user = await prisma.user.findUnique({
    where: {
      emailVerificationToken: hashVerificationToken(body.data.token),
    },
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "Invalid or expired verification token",
    });
  }

  // Check if the token has expired
  if (
    user.emailVerificationTokenExpires &&
    user.emailVerificationTokenExpires < new Date()
  ) {
    throw createError({
      statusCode: 410,
      statusMessage:
        "Verification token has expired. Please request a new one.",
    });
  }

  // Mark email as verified and clear the token
  await prisma.user.update({
    data: {
      emailVerificationToken: null,
      emailVerificationTokenExpires: null,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
    where: { id: user.id },
  });

  return { message: "Email successfully verified! You can now log in." };
});
