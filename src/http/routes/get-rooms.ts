import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { count, eq } from "drizzle-orm";

export const getRoomsRoute: FastifyPluginCallbackZod = (app) => {
  app.get('/rooms', () => {
    const results = db
      .select({
        id: schema.rooms.id,
        name: schema.rooms.name,
        createAt: schema.rooms.createAt,
        questionsCount: count(schema.questions.id),
      })      
      .from(schema.rooms)
      .leftJoin(schema.questions, eq(schema.questions.roomId, schema.rooms.id))
      .groupBy(schema.rooms.id, schema.rooms.name)
      .orderBy(schema.rooms.createAt)

    return results;
  })
}