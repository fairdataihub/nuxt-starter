import prisma from "#server/utils/prisma";
import { defineEventHandler } from "h3";
import { requireUserSession } from "#imports";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const { user } = session;
  const userId = user.id;

  const things = await prisma.thing.findMany({
    where: {
      userId,
    },
  });

  return things || [];
});
