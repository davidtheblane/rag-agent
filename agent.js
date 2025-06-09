import { createReactAgent, } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { ChatOllama } from "@langchain/ollama";
import { tool } from "@langchain/core/tools"
import { z } from 'zod'


const weatherTool = tool(async ({ query }) => {
    console.log('query', query)
    return 'The weather in Tokyo is sunny';
}, {
    name: 'weather',
    description: 'Get the weather in a given location.',
    schema: z.object({
        query: z.string().describe('The query to use in search')
    })
})

const llm = new ChatOllama({
    model: "llama3.2:1b",
});

const checkpointSaver = new MemorySaver();

export const agent = createReactAgent({
    llm,
    tools: [weatherTool],
    checkpointSaver,
})