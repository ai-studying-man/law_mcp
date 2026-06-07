import ky from "ky"
import { z } from "zod"

const EnvSchema = z.object({
  LAW_OC: z.string().min(1),
  MCP_URL: z.string().url().default("https://korean-law-mcp.fly.dev/mcp"),
})

const TextContentSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
})

const ToolResultSchema = z.object({
  content: z.array(TextContentSchema),
  isError: z.boolean().optional(),
})

const RpcSuccessSchema = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.number(),
  result: ToolResultSchema,
})

const RpcErrorSchema = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.number().nullable(),
  error: z.object({
    code: z.number(),
    message: z.string(),
  }),
})

const RpcResponseSchema = z.union([RpcSuccessSchema, RpcErrorSchema])

export type McpToolResult = z.infer<typeof ToolResultSchema>

type ToolCall = {
  readonly name: string
  readonly arguments: Record<string, unknown>
}

export async function callKoreanLawMcp(call: ToolCall): Promise<McpToolResult> {
  const env = EnvSchema.parse({
    LAW_OC: process.env["LAW_OC"],
    MCP_URL: process.env["MCP_URL"],
  })

  const url = new URL(env.MCP_URL)
  url.searchParams.set("oc", env.LAW_OC)

  const rawResponse = await ky
    .post(url, {
      headers: {
        accept: "application/json, text/event-stream",
      },
      json: {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: call.name,
          arguments: call.arguments,
        },
      },
      timeout: 60_000,
    })
    .json<unknown>()

  const response = RpcResponseSchema.parse(rawResponse)
  if ("error" in response) {
    return {
      content: [{ type: "text", text: `[MCP_ERROR] ${response.error.message}` }],
      isError: true,
    }
  }

  return response.result
}
