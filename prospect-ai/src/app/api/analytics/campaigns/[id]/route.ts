import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { CallData } from '@/lib/analytics/calculator';

/**
 * GET /api/analytics/campaigns/[id]
 * Fetch analytics data for a specific campaign
 * Query params:
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const campaignId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // TODO: Replace with actual database queries
    // This is mock data for demonstration purposes
    const mockCalls = generateMockCampaignCallData(campaignId, 30);

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

    // Calculate campaign-specific metrics
    const totalCalls = filteredCalls.length;
    const answeredCalls = filteredCalls.filter(c => c.outcome === 'answered').length;
    const convertedCalls = filteredCalls.filter(c => c.converted).length;
    const totalDuration = filteredCalls.reduce((sum, c) => sum + c.duration, 0);

    const metrics = {
      totalCalls,
      answerRate: totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0,
      conversionRate: totalCalls > 0 ? (convertedCalls / totalCalls) * 100 : 0,
      avgDuration: totalCalls > 0 ? totalDuration / totalCalls : 0,
      totalDuration,
    };

    return NextResponse.json({
      success: true,
      data: {
        campaignId,
        campaignName: filteredCalls[0]?.campaignName || 'Unknown Campaign',
        metrics,
        calls: filteredCalls,
      },
    });
  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign analytics data' },
      { status: 500 }
    );
  }
}

/**
 * Generate mock call data for a specific campaign
 * TODO: Replace with actual database queries
 */
function generateMockCampaignCallData(campaignId: string, days: number = 30): CallData[] {
  const calls: CallData[] = [];
  const outcomes: CallData['outcome'][] = ['answered', 'voicemail', 'busy', 'no-answer', 'failed'];
  
  const campaignNames: Record<string, string> = {
    'camp-1': 'Q4 Sales Campaign',
    'camp-2': 'Product Launch Outreach',
    'camp-3': 'Customer Follow-up',
    'camp-4': 'Lead Nurturing',
  };

  const campaignName = campaignNames[campaignId] || 'Unknown Campaign';

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

    // Generate 1-5 calls per day for this campaign
    const callsPerDay = Math.floor(Math.random() * 5) + 1;

    for (let j = 0; j < callsPerDay; j++) {
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
        id: `call-${campaignId}-${i}-${j}`,
        campaignId,
        campaignName,
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
