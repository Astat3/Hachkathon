import { z } from "zod";

// Script status enum
export const ScriptStatus = {
  DRAFT: "draft",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type ScriptStatusType = (typeof ScriptStatus)[keyof typeof ScriptStatus];

// Script generation input schema
export const scriptGenerationInputSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().optional(),
  description: z.string().optional(),
  targetMarket: z.string().optional(),
  knowledgeSource: z.string().optional(),
});

export type ScriptGenerationInput = z.infer<typeof scriptGenerationInputSchema>;

// Script creation schema
export const scriptCreateSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().optional(),
  description: z.string().optional(),
  targetMarket: z.string().optional(),
  knowledgeSource: z.string().optional(),
  content: z.string().min(1, "Script content is required"),
  status: z.enum(["draft", "approved", "rejected"]).default("draft"),
  metadata: z.record(z.any()).optional(),
});

export type ScriptCreateInput = z.infer<typeof scriptCreateSchema>;

// Script update schema
export const scriptUpdateSchema = z.object({
  companyName: z.string().min(1).optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
  targetMarket: z.string().optional(),
  knowledgeSource: z.string().optional(),
  content: z.string().min(1).optional(),
  status: z.enum(["draft", "approved", "rejected"]).optional(),
  metadata: z.record(z.any()).optional(),
});

export type ScriptUpdateInput = z.infer<typeof scriptUpdateSchema>;

// Script response type
export interface Script {
  id: string;
  userId: string;
  companyName: string;
  industry: string | null;
  description: string | null;
  targetMarket: string | null;
  knowledgeSource: string | null;
  content: string;
  status: string;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

// Script generation result
export interface ScriptGenerationResult {
  content: string;
  metadata: {
    model: string;
    temperature: number;
    tokensUsed?: number;
    generatedAt: string;
  };
}

// Error types
export class ScriptGenerationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = "ScriptGenerationError";
  }
}
