import { z } from "zod";
import { hash } from "argon2";

const signupSchema = z.object({
  emailAddress: z.string().email().max(254),
  familyName: z.string().max(100),
  givenName: z.string().max(100),
  password: z.string().min(12).max(128), // Updated password policy
});

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if ("user" in session) {
    return sendRedirect(event, "/app/dashboard");
  }

  rateLimit(event, { name: "signup", limit: 10, windowMs: 60 * 60 * 1000 });

  const config = useRuntimeConfig();
  const body = await readValidatedBody(event, (b) => signupSchema.safeParse(b));

  if (!body.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing or invalid signup details",
    });
  }

  const normalizedEmail = body.data.emailAddress.trim().toLowerCase(); // Normalize email

  // Check if the user already exists
  const user = await prisma.user.findUnique({
    where: {
      emailAddress: normalizedEmail, // Use normalized email
    },
  });

  if (user) {
    // Note: this reveals that the email is registered. If that matters for
    // your project, return the same success message as below instead (and
    // optionally email the existing user).
    throw createError({
      statusCode: 409,
      statusMessage: "Email address already in use",
    });
  }

  const emailVerificationEnabled = config.public.ENABLE_EMAIL_VERIFICATION;

  // Fail early (before creating the user) if verification links can't be built
  const token = emailVerificationEnabled ? createVerificationToken() : null;
  const verificationLink = token ? buildVerificationLink(token.rawToken) : null;

  // Create a new user
  const hashedPassword = await hash(body.data.password);

  const newUser = await prisma.user.create({
    data: {
      emailAddress: normalizedEmail, // Store normalized email
      // If email verification is enabled, store the hashed token and expiry
      emailVerificationToken: token?.hashedToken ?? null,
      emailVerificationTokenExpires: token?.expiresAt ?? null,
      emailVerified: !emailVerificationEnabled,
      emailVerifiedAt: emailVerificationEnabled ? null : new Date(),
      familyName: body.data.familyName,
      givenName: body.data.givenName,
      password: hashedPassword,
    },
  });

  if (verificationLink) {
    try {
      await sendVerificationEmail(newUser.emailAddress, verificationLink);
    } catch (error) {
      console.error("Failed to send verification email", error);

      // Roll back so the user can try signing up again instead of being
      // stuck with an unverifiable account
      await prisma.user.delete({ where: { id: newUser.id } });

      throw createError({
        statusCode: 502,
        statusMessage:
          "Could not send verification email. Please try again later.",
      });
    }

    return { message: "Verification email sent. Please check your inbox." };
  }

  return { message: "User created successfully" };
});
