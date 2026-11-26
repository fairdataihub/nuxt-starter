import { z } from "zod";
import { nanoid } from "nanoid";

const thingSchema = z.object({
  name: z.string().trim().min(1).max(255),
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
      statusMessage: "Invalid thing details",
    });
  }

  const data = {
    id: nanoid(),
    name: body.data.name,
    userId,
    updated: new Date(),
  };

  await kysely().insertInto("Thing").values(data).execute();

  return { message: "Kysely Thing created successfully" };
});
