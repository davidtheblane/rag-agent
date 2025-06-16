import express from 'express';
import cors from 'cors';
import { agent } from './agent.js'
import { HumanMessage } from "@langchain/core/messages";

const app = express();
const port = 3001;

app.use(express.json())
app.use(cors({ origin: '*' }))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/generate', async (req, res) => {
    const { prompt, thread_id } = req.body
    console.log('prompt', prompt)
    const response = await agent.invoke({
        messages: [new HumanMessage(prompt)],
    },
        { configurable: { thread_id } })

    console.log('response', response.messages.at(-1)?.content)

    return res.json(response.messages.at(-1)?.content)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})