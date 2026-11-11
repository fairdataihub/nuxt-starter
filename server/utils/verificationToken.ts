import { createHash } from "crypto";
import { nanoid } from "nanoid";
import dayjs from "dayjs";

export const VERIFICATION_TOKEN_TTL_MINUTES = 30;

export const hashVerificationToken = (rawToken: string) =>
  createHash("sha256").update(rawToken).digest("hex");

/**
 * Returns the raw token (to email to the user) and its hash + expiry
 * (to store in the database). Never store the raw token.
 */
export const createVerificationToken = () => {
  const rawToken = nanoid(32);

  return {
    expiresAt: dayjs().add(VERIFICATION_TOKEN_TTL_MINUTES, "minute").toDate(),
    hashedToken: hashVerificationToken(rawToken),
    rawToken,
  };
};
