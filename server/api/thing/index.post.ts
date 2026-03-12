import { z } from "zod";

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

  await prisma.thing.create({
    data: {
      name: body.data.name,
      userId,
    },
  });

  return { message: "Thing created successfully" };
});
