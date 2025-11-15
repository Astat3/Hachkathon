/**
 * API Route: Place Call
 * POST /api/calls/place
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getCallScheduler } from '@/lib/calls/scheduler';
import { z } from 'zod';

const placeCallSchema = z.object({
  campaignId: z.string(),
  prospectId: z.string(),
  scheduledFor: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = placeCallSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { campaignId, prospectId, scheduledFor } = validation.data;

    // Use scheduler to place call (respects time windows and limits)
    const scheduler = getCallScheduler();
    const result = await scheduler.scheduleCall({
      campaignId,
      prospectId,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      call: result.scheduledCall,
      message: result.message,
    });
  } catch (error) {
    console.error('Error in place call API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
