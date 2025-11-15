import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prospectUpdateSchema } from "@/types/prospect";
import { getProspectById, updateProspect } from "../route";

/**
 * GET /api/prospects/[id]
 * Get a single prospect by ID
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

    const prospectId = params.id;

    // Get the prospect
    const prospect = getProspectById(prospectId);

    if (!prospect) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      prospect,
    });
  } catch (error) {
    console.error("Error fetching prospect:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch prospect",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/prospects/[id]
 * Update a prospect (status, notes, metadata)
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

    const prospectId = params.id;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = prospectUpdateSchema.parse(body);

    // Update the prospect
    const updatedProspect = updateProspect(prospectId, validatedData);

    if (!updatedProspect) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      prospect: updatedProspect,
    });
  } catch (error) {
    console.error("Error updating prospect:", error);

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
        error: "Failed to update prospect",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/prospects/[id]
 * Delete a prospect
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

    const prospectId = params.id;

    // Get the prospect first to verify it exists
    const prospect = getProspectById(prospectId);

    if (!prospect) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 }
      );
    }

    // For MVP with in-memory store, we'll mark as deleted by updating status
    // In production, this would actually delete from database
    const deletedProspect = updateProspect(prospectId, {
      metadata: {
        ...prospect.metadata,
        deleted: true,
        deletedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Prospect deleted successfully",
      prospect: deletedProspect,
    });
  } catch (error) {
    console.error("Error deleting prospect:", error);

    return NextResponse.json(
      {
        error: "Failed to delete prospect",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
