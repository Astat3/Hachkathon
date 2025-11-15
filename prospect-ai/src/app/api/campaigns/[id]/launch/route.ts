import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/campaigns/[id]/launch
 * Launch or resume a campaign
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

    // Check if campaign can be launched
    if (campaign.status === "active") {
      return NextResponse.json(
        { error: "Campaign is already active" },
        { status: 400 }
      );
    }

    if (campaign.status === "completed") {
      return NextResponse.json(
        { error: "Cannot launch a completed campaign" },
        { status: 400 }
      );
    }

    // Verify script exists
    const script = await prisma.script.findUnique({
      where: {
        id: campaign.scriptId,
      },
    });

    if (!script) {
      return NextResponse.json(
        { error: "Campaign script not found. Please update the campaign." },
        { status: 400 }
      );
    }

    // Update campaign status to active
    const updatedCampaign = await prisma.campaign.update({
      where: {
        id: params.id,
      },
      data: {
        status: "active",
        launchedAt: campaign.launchedAt || new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
      message: "Campaign launched successfully",
    });
  } catch (error) {
    console.error("Error launching campaign:", error);

    return NextResponse.json(
      {
        error: "Failed to launch campaign",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
