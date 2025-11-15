import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prospectIdentificationSchema } from "@/types/prospect";
import { identifyProspects, validateTargetMarketCriteria } from "@/lib/prospects/identifier";

/**
 * POST /api/prospects/identify
 * Identify prospects for a campaign based on target market criteria
 */
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = prospectIdentificationSchema.parse(body);

    // Validate target market criteria
    const validation = validateTargetMarketCriteria(validatedData.targetMarket);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Invalid target market criteria",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Identify prospects (generates mock data for MVP)
    const result = await identifyProspects(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error identifying prospects:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to identify prospects",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
