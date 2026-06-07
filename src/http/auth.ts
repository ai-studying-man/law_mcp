export type AuthResult =
  | { readonly kind: "authorized" }
  | { readonly kind: "unauthorized"; readonly status: 401; readonly message: string }
  | { readonly kind: "misconfigured"; readonly status: 500; readonly message: string }

export function authorizeActionRequest(req: Request): AuthResult {
  const expected = process.env["ACTION_API_KEY"]
  if (!expected) {
    return {
      kind: "misconfigured",
      status: 500,
      message: "ACTION_API_KEY is not configured.",
    }
  }

  const authorization = req.headers.get("authorization")
  const apiKey = req.headers.get("x-api-key") ?? req.headers.get("api-key")
  const authorized =
    authorization === `Bearer ${expected}` ||
    authorization === expected ||
    apiKey === expected

  if (!authorized) {
    return { kind: "unauthorized", status: 401, message: "Unauthorized" }
  }

  return { kind: "authorized" }
}
