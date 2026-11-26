import { z } from "zod";
import { hash, verify } from "argon2";

const loginSchema = z.object({
  emailAddress: z.string().email().max(254),
  password: z.string().min(8).max(128),
});

// Hash used when the user does not exist, so the response time does not
// reveal whether an account exists for the given email.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () =>
  (dummyHash ??= hash("dummy-password-for-timing-equalization"));

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if ("user" in session) {
    return sendRedirect(event, "/app/dashboard");
  }

  rateLimit(event, { name: "login", limit: 20, windowMs: 15 * 60 * 1000 });

  const body = await readValidatedBody(event, (b) => loginSchema.safeParse(b));

  if (!body.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing login credentials",
    });
  }

  const normalizedEmail = body.data.emailAddress.trim().toLowerCase(); // Normalize email

  // Per-account limit to slow down password guessing from many IPs
  rateLimit(event, {
    name: "login-email",
    extra: normalizedEmail,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });

  // Get the user from the database
  const user = await prisma.user.findUnique({
    where: {
      emailAddress: normalizedEmail, // Use normalized email
    },
  });

  // Always run a hash verification so timing is the same whether or not the
  // user exists
  const passwordValid = await verify(
    user?.password ?? (await getDummyHash()),
    body.data.password,
  );

  if (!user || !passwordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email address or password",
    });
  }

  // Only reveal verification status once the password has been confirmed
  if (!user.emailVerified) {
    throw createError({
      statusCode: 403,
      statusMessage:
        "Email not verified. Please check your email for the verification link.",
    });
  }

  // Create a new session for the user
  const userData = {
    id: user.id,
    emailAddress: user.emailAddress,
    emailVerified: user.emailVerified,
    familyName: user.familyName,
    givenName: user.givenName,
  };

  await setUserSession(event, {
    loggedInAt: new Date(),
    user: userData,
    userSessionField: "",
  });

  return sendRedirect(event, "/app/dashboard");
});
