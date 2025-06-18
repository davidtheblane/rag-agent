import { createReactAgent, } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
// import { ChatOllama } from "@langchain/ollama";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools"
import { z } from 'zod'
import { SqlDatabase } from "langchain/sql_db"
import { DataSource } from "typeorm"
// import populateDb from "./populate-db.js"
// // import { db } from "./db.js"
// import * as hub from "langchain/hub/node";
import { QuerySqlTool } from "langchain/tools/sql";

// prompt hub
import { pull } from "langchain/hub";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Annotation, StateGraph } from "@langchain/langgraph";

import dotenv from 'dotenv'
dotenv.config()

export async function agent({ inputs }) {
  
try {

  const datasource = new DataSource({
    type: "postgres",
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
    host: "localhost",
  });

  const db = await SqlDatabase.fromDataSourceParams({
    appDataSource: datasource,
  });

  // await db.run("SELECT * FROM clientes LIMIT 10;");

  const InputStateAnnotation = Annotation.Root({ question: Annotation<string>, });

  const StateAnnotation = Annotation.Root({
    question: Annotation <string>,
    query: Annotation <string>,
    result: Annotation <string>,
    answer: Annotation <string>,
  });

  // const llm = new ChatOllama({
  //     model: "llama3.2:1b",
  // });

  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0
  });

  const queryPromptTemplate = await pull < ChatPromptTemplate > (
    "langchain-ai/sql-query-system-prompt"
  );

  const queryOutput = z.object({
      query: z.string().describe("Syntactically valid SQL query."),
  });

  const structuredLlm = llm.withStructuredOutput(queryOutput);

  const writeQuery = async (state: typeof InputStateAnnotation.State) => {
      const promptValue = await queryPromptTemplate.invoke({
          dialect: db.appDataSourceOptions.type,
          top_k: 10,
          table_info: await db.getTableInfo(),
          input: state.question,
      });

      const result = await structuredLlm.invoke(promptValue);
      console.log('writeQueryResult', result);
      return { query: result.query };
  };

  // await writeQuery({ question: "How many Employees are there?" });

  const executeQuery = async (state: typeof StateAnnotation.State) => {
      const executeQueryTool = new QuerySqlTool(db);
      return { result: await executeQueryTool.invoke(state.query) };
  };

  // await executeQuery({ question: "", query: "SELECT count(*) AS EmployeeCount FROM clientes LIMIT 10", result: "", answer: "", });

  const generateAnswer = async (state: typeof StateAnnotation.State) => {
  const promptValue =
    "Given the following user question, corresponding SQL query, " +
    "and SQL result, answer the user question.\n\n" +
    `Question: ${state.question}\n` +
    `SQL Query: ${state.query}\n` +
    `SQL Result: ${state.result}\n`;
    console.log('promptValue', promptValue);
  const response = await llm.invoke(promptValue);
  return { answer: response.content };
};

const graphBuilder = new StateGraph({
  stateSchema: StateAnnotation,
})
  .addNode("writeQuery", writeQuery)
  .addNode("executeQuery", executeQuery)
  .addNode("generateAnswer", generateAnswer)
  .addEdge("__start__", "writeQuery")
  .addEdge("writeQuery", "executeQuery")
  .addEdge("executeQuery", "generateAnswer")
  .addEdge("generateAnswer", "__end__");

  // const graph = graphBuilder.compile();

  // TODO IMPLEMENT THIS PARAMETER
  // let inputs = { question: "How many clientes are there?" };

  // console.log(inputs);
  // console.log("\n====\n");
  // for await (const step of await graph.stream(inputs, {
  //   streamMode: "updates",
  // })) {
  //   console.log(step);
  //   console.log("\n====\n");
  // }

  // WITH CONTEXT
const checkpointer = new MemorySaver();
const graphWithInterrupt = graphBuilder.compile({
  checkpointer: checkpointer,
  interruptBefore: [],
});

// Now that we're using persistence, we need to specify a thread ID
// so that we can continue the run after review.
const threadConfig = {
  configurable: { thread_id: "1" },
  streamMode: "updates" as const,
};

console.log(inputs);
console.log("\n====\n");
for await (const step of await graphWithInterrupt.stream(inputs, threadConfig)) {
  console.log(step);
  console.log("\n====\n");
}

// // Will log when the graph is interrupted, after `executeQuery`.
// console.log("---GRAPH INTERRUPTED---");

// for await (const step of await graphWithInterrupt.stream(null, threadConfig)) {
//   console.log(step);
//   console.log("\n====\n");
// }

} catch (error) {
  console.log('error', error)
}
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
