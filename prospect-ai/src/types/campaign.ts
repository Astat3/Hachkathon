import { z } from "zod";

// Campaign status enum
export const CampaignStatus = {
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
} as const;

export type CampaignStatusType = (typeof CampaignStatus)[keyof typeof CampaignStatus];

// Time window schema
export const timeWindowSchema = z.object({
  start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
});

export type TimeWindow = z.infer<typeof timeWindowSchema>;

// Campaign creation schema
export const campaignCreateSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  scriptId: z.string().min(1, "Script is required"),
  voiceId: z.string().min(1, "Voice is required"),
  dailyLimit: z.number().min(1, "Daily limit must be at least 1").max(1000, "Daily limit cannot exceed 1000"),
  timeWindows: z.array(timeWindowSchema).min(1, "At least one time window is required"),
  activeDays: z.array(z.number().min(0).max(6)).min(1, "At least one active day is required"),
  maxAttempts: z.number().min(1, "Max attempts must be at least 1").max(10, "Max attempts cannot exceed 10"),
  status: z.enum(["draft", "active", "paused", "completed"]).default("draft"),
});

export type CampaignCreateInput = z.infer<typeof campaignCreateSchema>;

// Campaign update schema
export const campaignUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  scriptId: z.string().min(1).optional(),
  voiceId: z.string().min(1).optional(),
  dailyLimit: z.number().min(1).max(1000).optional(),
  timeWindows: z.array(timeWindowSchema).optional(),
  activeDays: z.array(z.number().min(0).max(6)).optional(),
  maxAttempts: z.number().min(1).max(10).optional(),
  status: z.enum(["draft", "active", "paused", "completed"]).optional(),
});

export type CampaignUpdateInput = z.infer<typeof campaignUpdateSchema>;

// Campaign response type
export interface Campaign {
  id: string;
  userId: string;
  name: string;
  scriptId: string;
  voiceId: string;
  dailyLimit: number;
  timeWindows: TimeWindow[];
  activeDays: number[];
  maxAttempts: number;
  status: CampaignStatusType;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  createdAt: Date;
  updatedAt: Date;
  launchedAt?: Date | null;
  completedAt?: Date | null;
}

// Campaign with relations
export interface CampaignWithRelations extends Campaign {
  script?: {
    id: string;
    companyName: string;
    content: string;
  };
  voice?: {
    voice_id: string;
    name: string;
  };
}

// Campaign statistics
export interface CampaignStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  pendingCalls: number;
  successRate: number;
  averageCallDuration: number;
  callsToday: number;
}

// Day names for display
export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Status badge variants
export const STATUS_VARIANTS: Record<CampaignStatusType, "default" | "success" | "warning" | "secondary"> = {
  draft: "secondary",
  active: "success",
  paused: "warning",
  completed: "default",
};
