import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { campaignUpdateSchema } from "@/types/campaign";

/**
 * GET /api/campaigns/[id]
 * Get a specific campaign by ID
 */
export async function GET(
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

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch campaign",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/campaigns/[id]
 * Update a specific campaign
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated user session
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify campaign exists and belongs to user
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        userId: session.user.email || "",
      },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = campaignUpdateSchema.parse(body);

    // If scriptId is being updated, verify it exists and belongs to user
    if (validatedData.scriptId) {
      const script = await prisma.script.findFirst({
        where: {
          id: validatedData.scriptId,
          userId: session.user.email || "",
        },
      });

      if (!script) {
        return NextResponse.json(
          { error: "Script not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Update campaign
    const campaign = await prisma.campaign.update({
      where: {
        id: params.id,
      },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error("Error updating campaign:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to update campaign",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/campaigns/[id]
 * Delete a specific campaign
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated user session
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify campaign exists and belongs to user
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id: params.id,
        userId: session.user.email || "",
      },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Don't allow deletion of active campaigns
    if (existingCampaign.status === "active") {
      return NextResponse.json(
        { error: "Cannot delete an active campaign. Please pause it first." },
        { status: 400 }
      );
    }

    // Delete campaign
    await prisma.campaign.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting campaign:", error);

    return NextResponse.json(
      {
        error: "Failed to delete campaign",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
