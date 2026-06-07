export const DEFENSE_KEYWORDS = [
  "방위사업",
  "방위사업청",
  "방위산업",
  "방산",
  "국방조달",
  "국방획득",
  "무기체계",
  "군수품",
  "방산물자",
  "방산업체",
  "절충교역",
  "국방연구개발",
  "방위사업관리규정",
  "국방계약",
] as const

export const DEFENSE_SEED_QUERIES = [
  "방위사업법",
  "방위사업법 시행령",
  "방위사업법 시행규칙",
  "방위사업관리규정",
] as const

export type ScopeDecision =
  | {
      readonly kind: "allowed"
      readonly query: string
      readonly expandedQueries: readonly string[]
    }
  | {
      readonly kind: "blocked"
      readonly reason: string
    }

export function evaluateDefenseScope(rawQuery: string): ScopeDecision {
  const query = rawQuery.trim()
  if (query.length === 0) {
    return { kind: "blocked", reason: "검색어가 비어 있습니다." }
  }

  const matched = DEFENSE_KEYWORDS.some((keyword) => query.includes(keyword))
  if (!matched) {
    return {
      kind: "blocked",
      reason: "이 GPT는 방위사업 관련 법령과 규정 조회만 지원합니다.",
    }
  }

  const expandedQueries = [...DEFENSE_SEED_QUERIES, query]
  return { kind: "allowed", query, expandedQueries }
}
