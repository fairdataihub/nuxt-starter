import prisma from "#server/utils/prisma";
import { defineEventHandler } from "h3";
import { requireUserSession } from "#imports";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const { user } = session;
  const userId = user.id;

  return await prisma.user.findUnique({
    omit: { password: true },
    where: {
      id: userId,
    },
  });
});
