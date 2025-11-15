import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { campaignCreateSchema } from "@/types/campaign";

/**
 * POST /api/campaigns
 * Create a new campaign
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
    const validatedData = campaignCreateSchema.parse(body);

    // Verify script exists and belongs to user
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

    // Create campaign in database
    const campaign = await prisma.campaign.create({
      data: {
        userId: session.user.email || "",
        name: validatedData.name,
        scriptId: validatedData.scriptId,
        voiceId: validatedData.voiceId,
        dailyLimit: validatedData.dailyLimit,
        timeWindows: validatedData.timeWindows,
        activeDays: validatedData.activeDays,
        maxAttempts: validatedData.maxAttempts,
        status: validatedData.status || "draft",
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        campaign,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating campaign:", error);

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
        error: "Failed to create campaign",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/campaigns
 * Get all campaigns for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all campaigns for the user
    const campaigns = await prisma.campaign.findMany({
      where: {
        userId: session.user.email || "",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      campaigns,
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch campaigns",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
