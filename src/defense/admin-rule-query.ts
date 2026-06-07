export function normalizeDapaAdminRuleQuery(rawQuery: string): string {
  const withoutRevisionSuffix = rawQuery.split("_")[0] ?? rawQuery
  return withoutRevisionSuffix
    .replace(/^\[[^\]]+\]\s*/, "")
    .replace(/\s*\(시행일:[^)]+\)\s*$/, "")
    .trim()
}

export function isDapaAdminRuleResult(text: string): boolean {
  return text.includes("소관부처: 방위사업청")
}
