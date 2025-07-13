import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schema/index.ts";
import { z } from "zod/v4";
import { and, eq, sql } from "drizzle-orm";
import { generateAnswer, generateEmbeddings } from "../../services/gemini.ts";

export const createQuestionRoute: FastifyPluginCallbackZod = (app) => {
  app.post('/rooms/:roomId/questions', {
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
    
    const embeddings = await generateEmbeddings(question)

    const embeddingsAsString = `[${embeddings.join(',')}]`    

    const chuncks = await db
      .select({
        id:schema.audioChunks.id,
        transcription:schema.audioChunks.transcription,
        similarity: sql<number>`1 - (${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector)`  
      })
      .from(schema.audioChunks)
      .where(
        and(
          eq(schema.audioChunks.roomId, roomId),
          sql`1 - (${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector) > 0.7`
        )
      )
      .orderBy(sql`${schema.audioChunks.embeddings} <=> ${embeddingsAsString}::vector`)
      .limit(3)
    
    let answer: string | null = null
    
    if (chuncks.length > 0) {
      const transcriptions = chuncks.map(chunck => chunck.transcription)

      answer = await generateAnswer(question, transcriptions)

    }

    const result =  await db
      .insert(schema.questions)
      .values({roomId, question, answer})
      .returning()

      const insertedRow = result[0]

      if (!insertedRow) {
        throw new Error(`Failed to create new question to room ${roomId}.`)
      }

    return reply.status(201).send({
      questionId: insertedRow.id,
      answer
    });
  })
}