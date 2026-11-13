import { z } from "zod"

export const metaSchema = z.object({ page: z.number().int().nonnegative().optional(), limit: z.number().int().positive().optional(), total: z.number().int().nonnegative().optional() }).optional()
export const apiErrorSchema = z.object({ code: z.string(), message: z.string(), fieldErrors: z.record(z.string(), z.array(z.string())).optional() })
export const apiEnvelopeSchema = <T extends z.ZodType>(data: T) => z.object({ success: z.boolean(), data, error: apiErrorSchema.nullable().optional(), meta: metaSchema })
export type ApiError = z.infer<typeof apiErrorSchema>
export type ApiMeta = z.infer<typeof metaSchema>
export type ApiEnvelope<T> = { success: boolean; data: T; error?: ApiError | null; meta?: ApiMeta }

export class ApiRequestError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string, public readonly fieldErrors?: Record<string, string[]>) { super(message); this.name = "ApiRequestError" }
}
