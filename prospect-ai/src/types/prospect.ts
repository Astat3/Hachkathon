import { z } from "zod";

// Prospect status enum
export const ProspectStatus = {
  PENDING: "pending",
  CONTACTED: "contacted",
  INTERESTED: "interested",
  NOT_INTERESTED: "not-interested",
  CONVERTED: "converted",
} as const;

export type ProspectStatusType = (typeof ProspectStatus)[keyof typeof ProspectStatus];

// Company size enum
export const CompanySize = {
  STARTUP: "1-10",
  SMALL: "11-50",
  MEDIUM: "51-200",
  LARGE: "201-1000",
  ENTERPRISE: "1000+",
} as const;

export type CompanySizeType = (typeof CompanySize)[keyof typeof CompanySize];

// Prospect schema for validation
export const prospectSchema = z.object({
  id: z.string().optional(),
  campaignId: z.string(),
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  contactRole: z.string().min(1, "Contact role is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email").optional(),
  industry: z.string().min(1, "Industry is required"),
  companySize: z.string(),
  location: z.string().min(1, "Location is required"),
  status: z.enum(["pending", "contacted", "interested", "not-interested", "converted"]).default("pending"),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type ProspectInput = z.infer<typeof prospectSchema>;

// Prospect update schema
export const prospectUpdateSchema = z.object({
  status: z.enum(["pending", "contacted", "interested", "not-interested", "converted"]).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type ProspectUpdateInput = z.infer<typeof prospectUpdateSchema>;

// Prospect response type
export interface Prospect {
  id: string;
  campaignId: string;
  companyName: string;
  contactName: string;
  contactRole: string;
  phoneNumber: string;
  email?: string | null;
  industry: string;
  companySize: string;
  location: string;
  status: ProspectStatusType;
  notes?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

// Target market criteria for prospect identification
export interface TargetMarketCriteria {
  industries?: string[];
  companySizes?: CompanySizeType[];
  locations?: string[];
  keywords?: string[];
  excludeKeywords?: string[];
}

// Prospect identification input
export const prospectIdentificationSchema = z.object({
  campaignId: z.string().min(1, "Campaign ID is required"),
  targetMarket: z.object({
    industries: z.array(z.string()).optional(),
    companySizes: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional(),
    excludeKeywords: z.array(z.string()).optional(),
  }),
  count: z.number().min(10).max(200).default(50),
});

export type ProspectIdentificationInput = z.infer<typeof prospectIdentificationSchema>;

// Prospect filters for querying
export interface ProspectFilters {
  campaignId?: string;
  status?: ProspectStatusType | ProspectStatusType[];
  industry?: string | string[];
  location?: string | string[];
  companySize?: CompanySizeType | CompanySizeType[];
  search?: string;
}

// Prospect statistics
export interface ProspectStats {
  total: number;
  byStatus: Record<ProspectStatusType, number>;
  byIndustry: Record<string, number>;
  byLocation: Record<string, number>;
}
