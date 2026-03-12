export default defineEventHandler(async (event) => {
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
    .executeTakeFirst();

  if (!thing) {
    throw createError({
      statusCode: 404,
      statusMessage: `Thing with ID ${id} not found`,
    });
  }

  await kysely().deleteFrom("Thing").where("id", "=", id).execute();

  return { success: true, message: `Kysely Thing with ID ${id} deleted` };
});
