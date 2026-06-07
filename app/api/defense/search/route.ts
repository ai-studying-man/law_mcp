import { z } from "zod"
import { isDapaAdminRuleResult } from "@/src/defense/admin-rule-query"
import { evaluateDefenseScope } from "@/src/defense/scope"
import { authorizeActionRequest } from "@/src/http/auth"
import { errorToMessage } from "@/src/http/errors"
import { searchAdminRules, searchInterpretations, searchLaw } from "@/src/mcp/tools"

export const runtime = "nodejs"

const SearchParamsSchema = z.object({
  query: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(10).default(5),
})

export async function GET(req: Request) {
  const auth = authorizeActionRequest(req)
  if (auth.kind !== "authorized") {
    return Response.json({ error: auth.message }, { status: auth.status })
  }

  try {
    const parsed = SearchParamsSchema.parse(Object.fromEntries(new URL(req.url).searchParams))
    const scope = evaluateDefenseScope(parsed.query)
    if (scope.kind === "blocked") {
      const adminRules = await searchAdminRules(parsed.query, parsed.limit)
      if (isDapaAdminRuleResult(adminRules.text)) {
        return Response.json({
          allowed: true,
          query: parsed.query,
          message: "방위사업청 행정규칙 검색 결과가 확인되어 허용했습니다.",
          sources: [adminRules],
          retrievedAt: new Date().toISOString(),
        })
      }
      return Response.json({ allowed: false, message: scope.reason })
    }

    const [laws, adminRules, interpretations] = await Promise.all([
      searchLaw(scope.query, parsed.limit),
      searchAdminRules(scope.query, parsed.limit),
      searchInterpretations(scope.query, parsed.limit),
    ])

    return Response.json({
      allowed: true,
      query: scope.query,
      sources: [laws, adminRules, interpretations],
      retrievedAt: new Date().toISOString(),
    })
  } catch (error) {
    return Response.json({ error: errorToMessage(error) }, { status: 500 })
  }
}
