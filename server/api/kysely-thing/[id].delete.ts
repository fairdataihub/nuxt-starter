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

  const thing = await kysely()
    .selectFrom("Thing")
    .selectAll()
    .where("id", "=", id)
    .where("userId", "=", userId)
    .executeTakeFirst();

  if (!thing) {
    throw createError({
      statusCode: 404,
      statusMessage: `Thing with ID ${id} not found`,
    });
  }

  await kysely()
    .deleteFrom("Thing")
    .where("id", "=", id)
    .where("userId", "=", userId)
    .execute();

  return { success: true, message: `Kysely Thing with ID ${id} deleted` };
});
