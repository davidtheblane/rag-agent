// import { ChatAnthropic } from "@langchain/anthropic";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOllama } from "@langchain/ollama";
// from langchain_community.chat_models import ChatOllama
import { z } from 'zod'

import { tool } from "@langchain/core/tools"

const weatherTool = tool(async ({ query }) => {
    console.log('query', query)
    return 'The weather is sunny'
}, {
    name: 'weather',
    description: 'Get the weather in a given location.',
    schema: z.object({
        query: z.string().describe('The location to get the weather for.')
    })
})

// import { tool } from "@langchain/core/tools";
// import { z } from "zod";

// Define the model
const chat = new ChatOllama({
    model: "llama3.2:1b",
});

// const chat = new ChatOllama({ model: "llama3.2:1b" });

// const agent = createReactAgent({
//     model: model,
//     tools: []
// })

const result = (await chat.invoke([
    [
        "system",
        "Voce é um engenheiro de dados especialista em desenvolvimento, IA e Devops",
    ],
    ["human", "O que é aTOTVS?"],
])).content;

result;

console.log(result);
