import { z } from "zod"
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
