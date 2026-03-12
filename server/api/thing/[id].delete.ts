export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID is required",
    });
  }

  const thing = await prisma.thing.findUnique({
    where: { id },
  });

  if (!thing) {
    throw createError({
      statusCode: 404,
      statusMessage: `Thing with ID ${id} not found`,
    });
  }

  await prisma.thing.delete({
    where: { id },
  });

  return { success: true, message: `Thing with ID ${id} deleted` };
});
