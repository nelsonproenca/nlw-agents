import { fastify } from "fastify"
import {serializerCompiler,validatorCompiler,type ZodTypeProvider} from "fastify-type-provider-zod"
import { fastifyCors } from "@fastify/cors";
import { env } from "./env.ts";
import { getRoomsRoute } from "./http/routes/get-rooms.ts";
import { createRoomRoute } from "./http/routes/create-room.ts";
import { getRoomQuestionsRoute } from "./http/routes/get-room-questions.ts";
import { createQuestionRoute } from "./http/routes/create-question.ts";


const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
  origin: "http://localhost:5173",

})

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.get("/health", () => {
  return "Ok"
})

app.register(getRoomsRoute)
app.register(createRoomRoute)
app.register(getRoomQuestionsRoute)
app.register(createQuestionRoute)

app.listen({port: env.PORT}).then(() => {
  console.log("HTTP server running !!!")
})

