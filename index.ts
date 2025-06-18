import express from 'express';
import cors from 'cors';
import { agent } from './agent.ts';
import { HumanMessage } from "@langchain/core/messages";

const app = express();
const port = 3001;  

app.use(express.json())
app.use(cors({ origin: '*' }))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/generate', async (req: any, res: any) => {
    const { prompt } = req.body
      // TODO ADJUST THIS PARAMETER = inputs = {question: "string"}
    const response = await agent({ inputs: { question: prompt } })

    console.log('generateResponse', response)

    return res.json(response)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})