import { createReactAgent, } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { ChatOllama } from "@langchain/ollama";
import { tool } from "@langchain/core/tools"
// import { JsonOutputParser } from "@langchain/core/output_parsers"
import { z } from 'zod'


const weatherTool = tool(async ({ query }) => {
    console.log('query', query)
    // implement the weather tool by fetching api
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

const agent = createReactAgent({
    llm,
    tools: [weatherTool],
    checkpointSaver,
})

// const parser = new JsonOutputParser(llm)

const result = await agent.invoke({
    "messages": [{
        "role": "user",
        "content": "What is the weather in Tokyo?"
    }]
}, { configurable: { thread_id: "thread-1" } });

// const followp = await agent.invoke({
//     "messages": [{
//         "role": "user",
//         "content": "What city is that for?"
//     }]
// }, { configurable: { thread_id: "thread-1" } });

// const parsed = await parser(result);

console.log(result.messages.at(-1)?.content);
// console.log('followup', followp.messages.at(-1)?.content);

