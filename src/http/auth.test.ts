import { describe, expect, it } from "vitest"
import { authorizeActionRequest } from "./auth"

function requestWithHeaders(headers: HeadersInit): Request {
  return new Request("https://example.test", { headers })
}

describe("authorizeActionRequest", () => {
  it("authorizes the GPT Actions bearer header", () => {
    process.env["ACTION_API_KEY"] = "secret"

    const result = authorizeActionRequest(
      requestWithHeaders({ authorization: "Bearer secret" }),
    )

    expect(result.kind).toBe("authorized")
  })

  it("authorizes a plain Authorization API key header", () => {
    process.env["ACTION_API_KEY"] = "secret"

    const result = authorizeActionRequest(requestWithHeaders({ authorization: "secret" }))

    expect(result.kind).toBe("authorized")
  })

  it("authorizes an x-api-key header", () => {
    process.env["ACTION_API_KEY"] = "secret"

    const result = authorizeActionRequest(requestWithHeaders({ "x-api-key": "secret" }))

    expect(result.kind).toBe("authorized")
  })
})
