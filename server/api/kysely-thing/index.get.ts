export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const { user } = session;
  const userId = user.id;

  const things = await kysely()
    .selectFrom("Thing")
    .selectAll()
    .where("Thing.userId", "=", userId)
    .execute();

  return things || [];
});
