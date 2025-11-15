import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { CallData } from '@/lib/analytics/calculator';

/**
 * GET /api/analytics
 * Fetch analytics data for the authenticated user
 * Query params:
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 * - campaignId: Filter by specific campaign (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const campaignId = searchParams.get('campaignId');

    // TODO: Replace with actual database queries
    // This is mock data for demonstration purposes
    const mockCalls: CallData[] = generateMockCallData(30);

    // Filter by date range if provided
    let filteredCalls = mockCalls;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredCalls = filteredCalls.filter(call => {
        const callDate = new Date(call.timestamp);
        return callDate >= start && callDate <= end;
      });
    }

    // Filter by campaign if provided
    if (campaignId) {
      filteredCalls = filteredCalls.filter(call => call.campaignId === campaignId);
    }

    return NextResponse.json({
      success: true,
      data: {
        calls: filteredCalls,
        totalCount: filteredCalls.length,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

/**
 * Generate mock call data for demonstration
 * TODO: Replace with actual database queries
 */
function generateMockCallData(days: number = 30): CallData[] {
  const calls: CallData[] = [];
  const outcomes: CallData['outcome'][] = ['answered', 'voicemail', 'busy', 'no-answer', 'failed'];
  const campaigns = [
    { id: 'camp-1', name: 'Q4 Sales Campaign' },
    { id: 'camp-2', name: 'Product Launch Outreach' },
    { id: 'camp-3', name: 'Customer Follow-up' },
    { id: 'camp-4', name: 'Lead Nurturing' },
  ];
  const prospects = [
    { name: 'John Smith', phone: '+1-555-0101' },
    { name: 'Sarah Johnson', phone: '+1-555-0102' },
    { name: 'Michael Brown', phone: '+1-555-0103' },
    { name: 'Emily Davis', phone: '+1-555-0104' },
    { name: 'David Wilson', phone: '+1-555-0105' },
    { name: 'Jennifer Martinez', phone: '+1-555-0106' },
    { name: 'Robert Anderson', phone: '+1-555-0107' },
    { name: 'Lisa Taylor', phone: '+1-555-0108' },
    { name: 'James Thomas', phone: '+1-555-0109' },
    { name: 'Mary Garcia', phone: '+1-555-0110' },
  ];

  const now = new Date();

  // Generate calls for the past N days
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Generate 2-8 calls per day
    const callsPerDay = Math.floor(Math.random() * 7) + 2;

    for (let j = 0; j < callsPerDay; j++) {
      const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];
      const prospect = prospects[Math.floor(Math.random() * prospects.length)];
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      
      // Set random time during business hours (9 AM - 5 PM)
      const hour = Math.floor(Math.random() * 8) + 9;
      const minute = Math.floor(Math.random() * 60);
      date.setHours(hour, minute, 0, 0);

      // Duration: 0-300 seconds, with answered calls typically longer
      const duration = outcome === 'answered' 
        ? Math.floor(Math.random() * 240) + 60 
        : Math.floor(Math.random() * 30);

      // Conversion rate: ~20% of answered calls
      const converted = outcome === 'answered' && Math.random() < 0.2;

      calls.push({
        id: `call-${i}-${j}`,
        campaignId: campaign.id,
        campaignName: campaign.name,
        prospectName: prospect.name,
        prospectPhone: prospect.phone,
        outcome,
        duration,
        timestamp: new Date(date),
        converted,
        notes: converted ? 'Interested in product demo' : undefined,
      });
    }
  }

  // Sort by timestamp descending (newest first)
  return calls.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
