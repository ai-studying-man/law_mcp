import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const runtime = "nodejs"

export async function GET() {
  const schema = await readFile(join(process.cwd(), "openapi.yaml"), "utf8")
  return new Response(schema, {
    headers: {
      "content-type": "application/yaml; charset=utf-8",
    },
  })
}
