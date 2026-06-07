export const runtime = "nodejs"

export function GET() {
  return Response.json({
    name: "dapa-law-mcp",
    status: "ok",
    mcpUrlConfigured: Boolean(process.env["MCP_URL"]),
    lawOcConfigured: Boolean(process.env["LAW_OC"]),
    actionAuthConfigured: Boolean(process.env["ACTION_API_KEY"]),
    timestamp: new Date().toISOString(),
  })
}
