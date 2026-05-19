import { z } from "zod";
import { hash } from "argon2";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
import { sendEmail } from "../../utils/sendEmail";
import { randomBytes } from "crypto";
import { createHash } from "crypto";

const signupSchema = z.object({
  emailAddress: z.string().email(),
  familyName: z.string(),
  givenName: z.string(),
  password: z.string().min(12).max(128), // Updated password policy
});

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if ("user" in session) {
    return sendRedirect(event, "/app/dashboard");
  }

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
    throw createError({
      statusCode: 401,
      statusMessage: "Email address already in use",
    });
  }

  const emailVerificationEnabled = config.public.ENABLE_EMAIL_VERIFICATION;

  // Create a new user
  const hashedPassword = await hash(body.data.password);

  const rawToken = nanoid();
  const hashedToken = createHash("sha256").update(rawToken).digest("hex");

  const verificationToken = rawToken; // Send raw token via email
  const tokenExpiry = dayjs().add(30, "minute").toDate();

  const newUser = await prisma.user.create({
    data: {
      emailAddress: normalizedEmail, // Store normalized email
      // If email verification is enabled, we need to store the verification token and expiry date
      emailVerificationToken: emailVerificationEnabled
        ? hashedToken // Store hashed token in DB
        : null,
      emailVerificationTokenExpires: emailVerificationEnabled
        ? tokenExpiry
        : null,
      emailVerified: !emailVerificationEnabled, // UPDATE THIS IF EMAIL VERIFICATION IS ENABLED
      emailVerifiedAt: emailVerificationEnabled ? null : new Date(),
      familyName: body.data.familyName,
      givenName: body.data.givenName,
      password: hashedPassword,
    },
  });

  if (!newUser) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error creating user",
    });
  }

  if (emailVerificationEnabled) {
    // Send verification email
    const verificationLink = `${config.emailVerificationDomain}/verify-email?token=${verificationToken}`;

    await sendEmail(
      newUser.emailAddress,
      "Verify Your Email Address",
      verificationLink,
    );

    return { message: "Verification email sent. Please check your inbox." };
  }

  return { message: "User created successfully" };
});
