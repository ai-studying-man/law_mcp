import { describe, expect, it } from "vitest"
import { isDapaAdminRuleResult, normalizeDapaAdminRuleQuery } from "./admin-rule-query"

describe("normalizeDapaAdminRuleQuery", () => {
  it("removes DAPA revision suffixes from administrative rule titles", () => {
    const result = normalizeDapaAdminRuleQuery("방위사업청과 그 소속기관 위임전결 규정_신구조문대조표")

    expect(result).toBe("방위사업청과 그 소속기관 위임전결 규정")
  })

  it("removes bracketed lifecycle labels from DAPA titles", () => {
    const result = normalizeDapaAdminRuleQuery("[폐지] 자율기구 설치 및 운영에 관한 규정_폐지령")

    expect(result).toBe("자율기구 설치 및 운영에 관한 규정")
  })
})

describe("isDapaAdminRuleResult", () => {
  it("recognizes Korean Law MCP results owned by DAPA", () => {
    const result = isDapaAdminRuleResult("구분: 훈령\n소관부처: 방위사업청")

    expect(result).toBe(true)
  })
})
