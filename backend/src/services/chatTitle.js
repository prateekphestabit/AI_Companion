const OpenAI = require('openai');
const logger = require('../utils/logger');

const openai = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
})
 
async function getTopic(messages) {
  console.log("getTopic service called");
  try {
    const completion = await openai.chat.completions.create({
      model: "nvidia/nemotron-3.5-lightning-30b-a3b",
      messages: messages,
      temperature: 1,
      top_p: 0.95,
      max_tokens: 16384,
      reasoning_budget: 16384,
      stream: false,
      chat_template_kwargs: {"thinking":false},
    })
    const generated = completion.choices[0].message.content;
    return generated;
  } catch (error) {
    logger.error("Error creating completion in getTopic:", error);
    return "New Conversation";
  }
}

module.exports = { getTopic };