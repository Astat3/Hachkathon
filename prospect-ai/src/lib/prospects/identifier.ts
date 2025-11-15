/**
 * Prospect identification service
 * For MVP, uses mock data generator to create realistic prospects
 * In production, this would integrate with real data sources
 */

import { generateMockProspects } from "./mock-data-generator";
import type { 
  TargetMarketCriteria, 
  ProspectIdentificationInput,
  Prospect 
} from "@/types/prospect";

export interface ProspectIdentificationResult {
  prospects: Array<Omit<Prospect, "id" | "createdAt" | "updatedAt">>;
  count: number;
  criteria: TargetMarketCriteria;
  generatedAt: Date;
}

/**
 * Identifies prospects based on target market criteria
 * For MVP, generates mock data. In production, would query real databases/APIs
 */
export async function identifyProspects(
  input: ProspectIdentificationInput
): Promise<ProspectIdentificationResult> {
  const { campaignId, targetMarket, count } = input;

  // Validate count
  const prospectCount = Math.min(Math.max(count || 50, 10), 200);

  // Generate mock prospects based on criteria
  const prospects = generateMockProspects(
    campaignId,
    prospectCount,
    targetMarket
  );

  return {
    prospects,
    count: prospects.length,
    criteria: targetMarket,
    generatedAt: new Date(),
  };
}

/**
 * Validates target market criteria
 */
export function validateTargetMarketCriteria(
  criteria: TargetMarketCriteria
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if at least one filter is provided
  const hasFilters =
    (criteria.industries && criteria.industries.length > 0) ||
    (criteria.companySizes && criteria.companySizes.length > 0) ||
    (criteria.locations && criteria.locations.length > 0) ||
    (criteria.keywords && criteria.keywords.length > 0);

  if (!hasFilters) {
    errors.push("At least one target market criterion must be specified");
  }

  // Validate industries
  if (criteria.industries && criteria.industries.length > 10) {
    errors.push("Maximum 10 industries can be selected");
  }

  // Validate locations
  if (criteria.locations && criteria.locations.length > 20) {
    errors.push("Maximum 20 locations can be selected");
  }

  // Validate company sizes
  if (criteria.companySizes && criteria.companySizes.length > 5) {
    errors.push("Maximum 5 company sizes can be selected");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Estimates the number of prospects that can be identified
 * For MVP, returns a range based on criteria specificity
 */
export function estimateProspectCount(
  criteria: TargetMarketCriteria
): { min: number; max: number; recommended: number } {
  let specificity = 0;

  if (criteria.industries && criteria.industries.length > 0) {
    specificity += criteria.industries.length;
  }

  if (criteria.locations && criteria.locations.length > 0) {
    specificity += criteria.locations.length;
  }

  if (criteria.companySizes && criteria.companySizes.length > 0) {
    specificity += criteria.companySizes.length;
  }

  // More specific criteria = more prospects available
  const baseCount = 50;
  const multiplier = Math.max(1, specificity);

  return {
    min: baseCount,
    max: 200,
    recommended: Math.min(baseCount * multiplier, 100),
  };
}

/**
 * Filters prospects based on search query
 */
export function filterProspects(
  prospects: Prospect[],
  searchQuery: string
): Prospect[] {
  if (!searchQuery || searchQuery.trim() === "") {
    return prospects;
  }

  const query = searchQuery.toLowerCase().trim();

  return prospects.filter((prospect) => {
    return (
      prospect.companyName.toLowerCase().includes(query) ||
      prospect.contactName.toLowerCase().includes(query) ||
      prospect.industry.toLowerCase().includes(query) ||
      prospect.location.toLowerCase().includes(query) ||
      prospect.contactRole.toLowerCase().includes(query) ||
      (prospect.email && prospect.email.toLowerCase().includes(query)) ||
      prospect.phoneNumber.includes(query)
    );
  });
}

/**
 * Sorts prospects by various criteria
 */
export function sortProspects(
  prospects: Prospect[],
  sortBy: "name" | "company" | "industry" | "location" | "status" | "date",
  order: "asc" | "desc" = "asc"
): Prospect[] {
  const sorted = [...prospects].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.contactName.localeCompare(b.contactName);
        break;
      case "company":
        comparison = a.companyName.localeCompare(b.companyName);
        break;
      case "industry":
        comparison = a.industry.localeCompare(b.industry);
        break;
      case "location":
        comparison = a.location.localeCompare(b.location);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "date":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return order === "asc" ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Groups prospects by a specific field
 */
export function groupProspects(
  prospects: Prospect[],
  groupBy: "industry" | "location" | "status" | "companySize"
): Record<string, Prospect[]> {
  const groups: Record<string, Prospect[]> = {};

  for (const prospect of prospects) {
    const key = prospect[groupBy];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(prospect);
  }

  return groups;
}

/**
 * Calculates prospect statistics
 */
export function calculateProspectStats(prospects: Prospect[]) {
  const stats = {
    total: prospects.length,
    byStatus: {} as Record<string, number>,
    byIndustry: {} as Record<string, number>,
    byLocation: {} as Record<string, number>,
    byCompanySize: {} as Record<string, number>,
  };

  for (const prospect of prospects) {
    // Count by status
    stats.byStatus[prospect.status] = (stats.byStatus[prospect.status] || 0) + 1;

    // Count by industry
    stats.byIndustry[prospect.industry] = (stats.byIndustry[prospect.industry] || 0) + 1;

    // Count by location
    stats.byLocation[prospect.location] = (stats.byLocation[prospect.location] || 0) + 1;

    // Count by company size
    stats.byCompanySize[prospect.companySize] = (stats.byCompanySize[prospect.companySize] || 0) + 1;
  }

  return stats;
}
