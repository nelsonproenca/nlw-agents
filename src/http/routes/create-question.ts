import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { z } from "zod/v4";

export const createQuestionRoute: FastifyPluginCallbackZod = (app) => {
  app.post('/rooms/:roomId/question', {
    schema: {
      params: z.object({
          roomId: z.string()
      }),
      body: z.object( {
        question: z.string().min(3),
      })
    }
  }, async (request, reply) => {
    const { roomId } = request.params
    const { question } = request.body
    
    const result =  await db
      .insert(schema.questions)
      .values({roomId, question})
      .returning()

      const insertedRoom = result[0]

      if (!insertedRoom) {
        throw new Error(`Failed to create new question to room ${roomId}.`)
      }

    return reply.status(201).send(JSON.stringify(insertedRoom));
  })
}