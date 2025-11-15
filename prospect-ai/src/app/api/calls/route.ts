/**
 * API Route: Get Calls
 * GET /api/calls?campaignId=xxx&prospectId=xxx&status=xxx&limit=50&offset=0
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getCallService } from '@/lib/calls/call-service';
import { CallStatus } from '@/types/call';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaignId') || undefined;
    const prospectId = searchParams.get('prospectId') || undefined;
    const status = searchParams.get('status') as CallStatus | undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get calls
    const callService = getCallService();
    const result = await callService.getCalls({
      campaignId,
      prospectId,
      status,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in get calls API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
