import { z } from "zod";

const resendSchema = z.object({
  emailAddress: z.string().email().max(254),
});

// Same response whether or not the account exists, to avoid revealing
// which emails are registered.
const GENERIC_RESPONSE = {
  message:
    "If an unverified account exists for that email, a new verification link has been sent.",
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  if (!config.public.ENABLE_EMAIL_VERIFICATION) {
    throw createError({
      statusCode: 404,
      statusMessage: "Email verification is not enabled",
    });
  }

  rateLimit(event, {
    name: "resend-verification",
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });

  const body = await readValidatedBody(event, (b) => resendSchema.safeParse(b));

  if (!body.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "A valid email address is required",
    });
  }

  const normalizedEmail = body.data.emailAddress.trim().toLowerCase();

  // Limit emails sent to a single address regardless of requesting IP
  rateLimit(event, {
    name: "resend-verification-email",
    extra: normalizedEmail,
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });

  const user = await prisma.user.findUnique({
    where: { emailAddress: normalizedEmail },
  });

  if (!user || user.emailVerified) {
    return GENERIC_RESPONSE;
  }

  const token = createVerificationToken();
  const verificationLink = buildVerificationLink(token.rawToken);

  await prisma.user.update({
    data: {
      emailVerificationToken: token.hashedToken,
      emailVerificationTokenExpires: token.expiresAt,
    },
    where: { id: user.id },
  });

  try {
    await sendVerificationEmail(user.emailAddress, verificationLink);
  } catch (error) {
    console.error("Failed to resend verification email", error);
  }

  return GENERIC_RESPONSE;
});
