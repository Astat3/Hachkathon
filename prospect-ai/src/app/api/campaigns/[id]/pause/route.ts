import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/campaigns/[id]/pause
 * Pause an active campaign
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated user session
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the campaign
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        userId: session.user.email || "",
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Check if campaign can be paused
    if (campaign.status !== "active") {
      return NextResponse.json(
        { error: "Only active campaigns can be paused" },
        { status: 400 }
      );
    }

    // Update campaign status to paused
    const updatedCampaign = await prisma.campaign.update({
      where: {
        id: params.id,
      },
      data: {
        status: "paused",
      },
    });

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
      message: "Campaign paused successfully",
    });
  } catch (error) {
    console.error("Error pausing campaign:", error);

    return NextResponse.json(
      {
        error: "Failed to pause campaign",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
