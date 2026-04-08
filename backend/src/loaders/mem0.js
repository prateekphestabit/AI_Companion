const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StreamableHTTPClientTransport } = require('@modelcontextprotocol/sdk/client/streamableHttp.js');
const logger = require('../utils/logger');

//==========================  MCP Client connection 
const client = new Client(
  { name: 'agent', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

const transport = new StreamableHTTPClientTransport(
  new URL(process.env.MEM0_MCP_URL),
  { requestInit: { headers: { Authorization: `Bearer ${process.env.MEM0_API_KEY}` } } }
);

async function connectMCP() {
  try {
    await client.connect(transport);
    logger.info('MCP client connected');
  } catch (err) {
    logger.error('MCP client failed to connect:', err);
    process.exit(1);
  }
}


//========================== mcp function calling
async function callMcpTool(toolName, args) {
  const result = await client.callTool({ name: toolName, arguments: args });
  return result.content[0].text;
}


module.exports = {
    connectMCP,
    callMcpTool
}