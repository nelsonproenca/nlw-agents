import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import z from "zod/v4";
import { desc, eq } from "drizzle-orm";

export const getRoomQuestionsRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/rooms/:roomId/questions', 
    { schema: {
        params: z.object({
          roomId: z.string()
        })
      }
    }, 
    async (request) => {
      const { roomId } = request.params

      console.log("roomId:", roomId)

      const results = db
        .select({
          id: schema.questions.id,
          question: schema.questions.question,
          answer: schema.questions.answer,
          createAt: schema.questions.createAt,
        })
        .from(schema.questions)
        .where(eq(schema.questions.roomId, roomId))        
        .orderBy(desc(schema.questions.createAt))

      return results;
    })
}