import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Prospect, ProspectFilters } from "@/types/prospect";
import { filterProspects, sortProspects, calculateProspectStats } from "@/lib/prospects/identifier";

// In-memory store for MVP (in production, this would be a database)
// This is a simple Map to store prospects by campaign ID
const prospectsStore = new Map<string, Prospect[]>();

/**
 * Helper to get or initialize prospects for a campaign
 */
function getProspectsForCampaign(campaignId: string): Prospect[] {
  if (!prospectsStore.has(campaignId)) {
    prospectsStore.set(campaignId, []);
  }
  return prospectsStore.get(campaignId)!;
}

/**
 * Helper to add prospects to a campaign
 */
export function addProspectsToCampaign(
  campaignId: string,
  prospects: Array<Omit<Prospect, "id" | "createdAt" | "updatedAt">>
): Prospect[] {
  const existingProspects = getProspectsForCampaign(campaignId);
  
  const newProspects: Prospect[] = prospects.map((prospect, index) => ({
    ...prospect,
    id: `prospect_${campaignId}_${Date.now()}_${index}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  prospectsStore.set(campaignId, [...existingProspects, ...newProspects]);
  return newProspects;
}

/**
 * Helper to update a prospect
 */
export function updateProspect(
  prospectId: string,
  updates: Partial<Prospect>
): Prospect | null {
  for (const [campaignId, prospects] of prospectsStore.entries()) {
    const index = prospects.findIndex((p) => p.id === prospectId);
    if (index !== -1) {
      const updatedProspect = {
        ...prospects[index],
        ...updates,
        updatedAt: new Date(),
      };
      prospects[index] = updatedProspect;
      prospectsStore.set(campaignId, prospects);
      return updatedProspect;
    }
  }
  return null;
}

/**
 * Helper to get a single prospect
 */
export function getProspectById(prospectId: string): Prospect | null {
  for (const prospects of prospectsStore.values()) {
    const prospect = prospects.find((p) => p.id === prospectId);
    if (prospect) {
      return prospect;
    }
  }
  return null;
}

/**
 * GET /api/prospects?campaignId=xxx&status=xxx&industry=xxx&location=xxx&search=xxx
 * Get all prospects for a campaign with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get("campaignId");
    const status = searchParams.get("status");
    const industry = searchParams.get("industry");
    const location = searchParams.get("location");
    const companySize = searchParams.get("companySize");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") as any;
    const sortOrder = searchParams.get("sortOrder") as "asc" | "desc";
    const includeStats = searchParams.get("includeStats") === "true";

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Get prospects for the campaign
    let prospects = getProspectsForCampaign(campaignId);

    // Apply filters
    if (status) {
      const statuses = status.split(",");
      prospects = prospects.filter((p) => statuses.includes(p.status));
    }

    if (industry) {
      const industries = industry.split(",");
      prospects = prospects.filter((p) => industries.includes(p.industry));
    }

    if (location) {
      const locations = location.split(",");
      prospects = prospects.filter((p) => locations.includes(p.location));
    }

    if (companySize) {
      const sizes = companySize.split(",");
      prospects = prospects.filter((p) => sizes.includes(p.companySize));
    }

    // Apply search
    if (search) {
      prospects = filterProspects(prospects, search);
    }

    // Apply sorting
    if (sortBy) {
      prospects = sortProspects(prospects, sortBy, sortOrder || "asc");
    }

    // Calculate stats if requested
    const stats = includeStats ? calculateProspectStats(prospects) : undefined;

    return NextResponse.json({
      success: true,
      prospects,
      count: prospects.length,
      stats,
    });
  } catch (error) {
    console.error("Error fetching prospects:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch prospects",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/prospects
 * Create prospects for a campaign (used after identification)
 */
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { campaignId, prospects } = body;

    if (!campaignId || !prospects || !Array.isArray(prospects)) {
      return NextResponse.json(
        { error: "Campaign ID and prospects array are required" },
        { status: 400 }
      );
    }

    // Add prospects to the campaign
    const newProspects = addProspectsToCampaign(campaignId, prospects);

    return NextResponse.json(
      {
        success: true,
        prospects: newProspects,
        count: newProspects.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating prospects:", error);

    return NextResponse.json(
      {
        error: "Failed to create prospects",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
