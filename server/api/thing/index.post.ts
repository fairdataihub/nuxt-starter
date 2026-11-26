import { z } from "zod";

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

  await prisma.thing.create({
    data: {
      name: body.data.name,
      userId,
    },
  });

  return { message: "Thing created successfully" };
});
