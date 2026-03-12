import { z } from "zod";
import { faker } from "@faker-js/faker";

const thingSchema = z.object({
  name: z.string(),
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const { user } = session;
  const userId = user.id;

  const body = await readValidatedBody(event, (b) => thingSchema.safeParse(b));

  if (!body.success) {
    console.log(body.error);

    throw createError({
      statusCode: 400,
      statusMessage: "Missing dataset information",
    });
  }

  const data = {
    id: faker.string.nanoid(),
    name: body.data.name,
    userId,
    updated: new Date(),
  };

  await kysely().insertInto("Thing").values(data).execute();

  return { message: "Kysely Thing created successfully" };
});
