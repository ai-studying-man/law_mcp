import type { McpToolResult } from "./client"
import { callKoreanLawMcp } from "./client"

export type BridgeSource = {
  readonly tool: string
  readonly text: string
  readonly isError: boolean
}

function toBridgeSource(tool: string, result: McpToolResult): BridgeSource {
  return {
    tool,
    text: result.content.map((item) => item.text).join("\n\n"),
    isError: result.isError === true,
  }
}

export async function searchLaw(query: string, limit: number): Promise<BridgeSource> {
  const result = await callKoreanLawMcp({
    name: "search_law",
    arguments: { query, display: limit },
  })
  return toBridgeSource("search_law", result)
}

export async function searchAdminRules(query: string, limit: number): Promise<BridgeSource> {
  const result = await callKoreanLawMcp({
    name: "execute_tool",
    arguments: {
      tool_name: "search_admin_rule",
      params: { query, display: limit },
    },
  })
  return toBridgeSource("search_admin_rule", result)
}

export async function searchInterpretations(query: string, limit: number): Promise<BridgeSource> {
  const result = await callKoreanLawMcp({
    name: "search_decisions",
    arguments: { domain: "interpretation", query, display: limit },
  })
  return toBridgeSource("search_decisions.interpretation", result)
}

export async function fullResearch(query: string): Promise<BridgeSource> {
  const result = await callKoreanLawMcp({
    name: "chain_full_research",
    arguments: { query },
  })
  return toBridgeSource("chain_full_research", result)
}

export async function getLawText(input: {
  readonly mst?: string
  readonly lawId?: string
  readonly article?: string
}): Promise<BridgeSource> {
  const result = await callKoreanLawMcp({
    name: "get_law_text",
    arguments: {
      ...(input.mst ? { mst: input.mst } : {}),
      ...(input.lawId ? { lawId: input.lawId } : {}),
      ...(input.article ? { jo: input.article } : {}),
    },
  })
  return toBridgeSource("get_law_text", result)
}

export async function getAdminRuleText(id: string): Promise<BridgeSource> {
  const result = await callKoreanLawMcp({
    name: "execute_tool",
    arguments: {
      tool_name: "get_admin_rule",
      params: { id },
    },
  })
  return toBridgeSource("get_admin_rule", result)
}

export async function getDecisionText(input: {
  readonly domain: string
  readonly id: string
  readonly full?: boolean
}): Promise<BridgeSource> {
  const result = await callKoreanLawMcp({
    name: "get_decision_text",
    arguments: {
      domain: input.domain,
      id: input.id,
      ...(input.full === undefined ? {} : { full: input.full }),
    },
  })
  return toBridgeSource(`get_decision_text.${input.domain}`, result)
}
