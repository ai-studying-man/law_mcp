import { z } from "zod"

export function errorToMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => issue.message).join("; ")
  }
  if (error instanceof Error) {
    return error.message
  }
  return "Unknown error"
}
