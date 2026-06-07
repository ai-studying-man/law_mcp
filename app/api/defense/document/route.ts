import { z } from "zod"
import { authorizeActionRequest } from "@/src/http/auth"
import { errorToMessage } from "@/src/http/errors"
import { getAdminRuleText, getDecisionText, getLawText } from "@/src/mcp/tools"

export const runtime = "nodejs"

const DocumentBodySchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("law"),
    mst: z.string().optional(),
    lawId: z.string().optional(),
    article: z.string().optional(),
  }),
  z.object({
    kind: z.literal("admin_rule"),
    id: z.string().min(1),
  }),
  z.object({
    kind: z.literal("decision"),
    domain: z.string().min(1),
    id: z.string().min(1),
    full: z.boolean().optional(),
  }),
])

export async function POST(req: Request) {
  const auth = authorizeActionRequest(req)
  if (auth.kind !== "authorized") {
    return Response.json({ error: auth.message }, { status: auth.status })
  }

  try {
    const body = DocumentBodySchema.parse(await req.json())
    switch (body.kind) {
      case "law":
        if (!body.mst && !body.lawId) {
          return Response.json({ error: "mst 또는 lawId가 필요합니다." }, { status: 400 })
        }
        const lawInput = {
          ...(body.mst ? { mst: body.mst } : {}),
          ...(body.lawId ? { lawId: body.lawId } : {}),
          ...(body.article ? { article: body.article } : {}),
        }
        return Response.json({
          allowed: true,
          document: await getLawText(lawInput),
          retrievedAt: new Date().toISOString(),
        })
      case "admin_rule":
        return Response.json({
          allowed: true,
          document: await getAdminRuleText(body.id),
          retrievedAt: new Date().toISOString(),
        })
      case "decision":
        const decisionInput = {
          domain: body.domain,
          id: body.id,
          ...(body.full === undefined ? {} : { full: body.full }),
        }
        return Response.json({
          allowed: true,
          document: await getDecisionText(decisionInput),
          retrievedAt: new Date().toISOString(),
        })
    }
  } catch (error) {
    return Response.json({ error: errorToMessage(error) }, { status: 500 })
  }
}
