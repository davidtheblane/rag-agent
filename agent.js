import { createReactAgent, } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { ChatOllama } from "@langchain/ollama";
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools"
import { z } from 'zod'
import { SqlDatabase } from "langchain/sql_db"
import { DataSource } from "typeorm"
// import populateDb from "./populate-db.js"
// // import { db } from "./db.js"
import * as hub from "langchain/hub/node";

// prompt hub
import { pull } from "langchain/hub";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Annotation } from "@langchain/langgraph";

import dotenv from 'dotenv'
dotenv.config()

const InputStateAnnotation = Annotation.Root({ question: "Annotation <string>" });

const StateAnnotation = Annotation.Root({
    question: "Annotation <string>",
    query: "Annotation<string>",
    result: "Annotation <string>",
    answer: "Annotation <string>",
});

const datasource = new DataSource({
    type: "postgres",
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
    host: "localhost",
    entities: [InputStateAnnotation, StateAnnotation],
});

const db = await SqlDatabase.fromDataSourceParams({ appDataSource: datasource, });
// const clients = await db.run("SELECT * FROM clientes LIMIT 10;");
// console.log('clients', clients);

const llm = new ChatOllama({
    model: "llama3.2:1b",
});
// const llm = new ChatGoogleGenerativeAI({
//     model: "gemini-2.0-flash",
//     apiKey: process.env.GOOGLE_API_KEY,
//     temperature: 0
// });

// const queryPromptTemplate = await pull < ChatPromptTemplate > ("langchain-ai/sql-query-system-prompt");
const queryPromptTemplate = await hub.pull("langchain-ai/sql-query-system-prompt", {
    includeModel: true
});
// console.log('queryPromptTemplate', queryPromptTemplate.lc_kwargs.first.promptMessages)
queryPromptTemplate.lc_kwargs.first.promptMessages.forEach((message) => {
    console.log(message.lc_kwargs.prompt.template)
});

try {
    const queryOutput = z.object({
        query: z.string().describe("Syntactically valid SQL query."),
    });

    const structuredLlm = llm.withStructuredOutput(queryOutput);

    const writeQuery = async ({ state }) => {
        const promptValue = await queryPromptTemplate.invoke({
            dialect: db.appDataSourceOptions.type,
            top_k: 10,
            table_info: await db.getTableInfo(),
            input: state,
        });

        console.log('promptValue', promptValue.content)

        const result = await structuredLlm.invoke({
            toChatMessages: true,
            messages: [new HumanMessage(promptValue)],
            configurable: { thread_id: 1 }
        });
        console.log({ result })
        return { query: result.query };
    };

    await writeQuery({ state: "How many Employees are there?" });
} catch (error) {
    console.log('error', error)
}

// const weatherTool = tool(async ({ query }) => {
//     console.log('query', query)
//     return 'The weather in Tokyo is sunny';
// }, {
//     name: 'weather',
//     description: 'Get the weather in a given location.',
//     schema: z.object({
//         query: z.string().describe('The query to use in search')
//     })
// })



// const checkpointSaver = new MemorySaver();

// export const agent = createReactAgent({
//     llm,
//     tools: [],
//     checkpointSaver,
// })