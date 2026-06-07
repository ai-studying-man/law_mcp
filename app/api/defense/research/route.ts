import { z } from "zod"
import { isDapaAdminRuleResult } from "@/src/defense/admin-rule-query"
import { evaluateDefenseScope } from "@/src/defense/scope"
import { authorizeActionRequest } from "@/src/http/auth"
import { errorToMessage } from "@/src/http/errors"
import { fullResearch, searchAdminRules } from "@/src/mcp/tools"

export const runtime = "nodejs"

const ResearchBodySchema = z.object({
  question: z.string().min(1),
})

export async function POST(req: Request) {
  const auth = authorizeActionRequest(req)
  if (auth.kind !== "authorized") {
    return Response.json({ error: auth.message }, { status: auth.status })
  }

  try {
    const body = ResearchBodySchema.parse(await req.json())
    const scope = evaluateDefenseScope(body.question)
    if (scope.kind === "blocked") {
      const adminRules = await searchAdminRules(body.question, 5)
      if (isDapaAdminRuleResult(adminRules.text)) {
        return Response.json({
          allowed: true,
          question: body.question,
          message: "방위사업청 행정규칙 검색 결과가 확인되어 허용했습니다.",
          sources: [adminRules],
          retrievedAt: new Date().toISOString(),
        })
      }
      return Response.json({ allowed: false, message: scope.reason })
    }

    const [research, adminRules] = await Promise.all([
      fullResearch(scope.query),
      searchAdminRules(scope.query, 5),
    ])

    return Response.json({
      allowed: true,
      question: scope.query,
      sources: [research, adminRules],
      retrievedAt: new Date().toISOString(),
    })
  } catch (error) {
    return Response.json({ error: errorToMessage(error) }, { status: 500 })
  }
}
