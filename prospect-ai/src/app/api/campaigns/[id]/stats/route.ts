/**
 * API Route: Get Campaign Stats
 * GET /api/campaigns/[id]/stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getCallService } from '@/lib/calls/call-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const campaignId = params.id;

    // Get call stats
    const callService = getCallService();
    const stats = await callService.getCallStats(campaignId);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error in get campaign stats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
