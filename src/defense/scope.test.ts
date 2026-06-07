import { describe, expect, it } from "vitest"
import { evaluateDefenseScope } from "./scope"

describe("evaluateDefenseScope", () => {
  it("allows a defense acquisition query when it contains a defense keyword", () => {
    const result = evaluateDefenseScope("방위사업관리규정 제12조")

    expect(result.kind).toBe("allowed")
  })

  it("blocks a generic legal query when it has no defense keyword", () => {
    const result = evaluateDefenseScope("민법 제750조")

    expect(result.kind).toBe("blocked")
  })
})
