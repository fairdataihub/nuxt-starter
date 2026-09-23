export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const { user } = session;
  const userId = user.id;

  const { id } = event.context.params as { id: string };

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID is required",
    });
  }

  const thing = await prisma.thing.findFirst({
    where: { id, userId },
  });

  if (!thing) {
    throw createError({
      statusCode: 404,
      statusMessage: `Thing with ID ${id} not found`,
    });
  }

  await prisma.thing.deleteMany({
    where: { id, userId },
  });

  return { success: true, message: `Thing with ID ${id} deleted` };
});
