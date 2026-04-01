require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
})
 
async function main(query) {
  const completion = await openai.chat.completions.create({
    model: "mistralai/devstral-2-123b-instruct-2512",
    messages: [{"role":"user","content":query}],
    temperature: 0.15,
    top_p: 0.95,
    max_tokens: 8192,
    stream: true
  })
   
  for await (const chunk of completion) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '')
  }
  
}

main("hye how are you");