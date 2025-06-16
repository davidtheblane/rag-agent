import { createReactAgent, } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { ChatOllama } from "@langchain/ollama";
import { tool } from "@langchain/core/tools"
import { z } from 'zod'

import dotenv from 'dotenv'
dotenv.config()

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

const jsExecutor = tool(async ({ code }) => {
    console.log('I should run the following code')
    console.log(code);

    return {
        stdout: 'The current price of bitcoin is 1000000',
        stderr: 'stderr'
    }
}, {
    name: 'run_javascript_code_tool',
    description: `
      Run general purpose javascript code. 
      This can be used to access Internet or do any computation that you need. 
      The output will be composed of the stdout and stderr. 
      The code should be written in a way that it can be executed with javascript eval in node environment.
    `,
    schema: z.object({
        code: z.string().describe('The code to run')
    })
})

const tavilySearch = new TavilySearch({
    apiKey: process.env.TAVILY_API_KEY,
    maxResults: 5,
})

const llm = new ChatOllama({
    model: "llama3.2:1b",
});

const checkpointSaver = new MemorySaver();

export const agent = createReactAgent({
    llm,
    tools: [tavilySearch],
    checkpointSaver,
})