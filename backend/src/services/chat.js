const OpenAI = require('openai');
const logger = require('../utils/logger');

const openai = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
})
 
async function getTopic(messages) {
  try {
    const completion = await openai.chat.completions.create({
      model: "mistralai/devstral-2-123b-instruct-2512",
      messages: messages,
      temperature: 0.15,
      top_p: 0.95,
      max_tokens: 8192,
      stream: false
    })
    const generated = completion.choices[0].message.content;
    return generated;
  } catch (error) {
    logger.error("Error creating completion:", error);
  }
}

module.exports = { getTopic };