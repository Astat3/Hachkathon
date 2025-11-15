/**
 * Analytics calculation utilities
 * Provides functions for calculating various analytics metrics
 */

export interface CallData {
  id: string;
  campaignId: string;
  campaignName: string;
  prospectName: string;
  prospectPhone: string;
  outcome: 'answered' | 'voicemail' | 'busy' | 'no-answer' | 'failed';
  duration: number; // in seconds
  timestamp: Date;
  converted: boolean;
  notes?: string;
}

export interface AnalyticsStats {
  totalCalls: number;
  answerRate: number;
  avgDuration: number;
  conversionRate: number;
}

export interface OutcomeDistribution {
  answered: number;
  voicemail: number;
  busy: number;
  noAnswer: number;
  failed: number;
}

export interface TimeSeriesData {
  date: string;
  calls: number;
  answered: number;
  converted: number;
}

export interface CampaignStats {
  campaignId: string;
  campaignName: string;
  totalCalls: number;
  answerRate: number;
  conversionRate: number;
  avgDuration: number;
}

/**
 * Calculate overall analytics statistics
 */
export function calculateStats(calls: CallData[]): AnalyticsStats {
  if (calls.length === 0) {
    return {
      totalCalls: 0,
      answerRate: 0,
      avgDuration: 0,
      conversionRate: 0,
    };
  }

  const totalCalls = calls.length;
  const answeredCalls = calls.filter(c => c.outcome === 'answered').length;
  const convertedCalls = calls.filter(c => c.converted).length;
  const totalDuration = calls.reduce((sum, c) => sum + c.duration, 0);

  return {
    totalCalls,
    answerRate: (answeredCalls / totalCalls) * 100,
    avgDuration: totalDuration / totalCalls,
    conversionRate: (convertedCalls / totalCalls) * 100,
  };
}

/**
 * Calculate outcome distribution
 */
export function calculateOutcomeDistribution(calls: CallData[]): OutcomeDistribution {
  const distribution: OutcomeDistribution = {
    answered: 0,
    voicemail: 0,
    busy: 0,
    noAnswer: 0,
    failed: 0,
  };

  calls.forEach(call => {
    switch (call.outcome) {
      case 'answered':
        distribution.answered++;
        break;
      case 'voicemail':
        distribution.voicemail++;
        break;
      case 'busy':
        distribution.busy++;
        break;
      case 'no-answer':
        distribution.noAnswer++;
        break;
      case 'failed':
        distribution.failed++;
        break;
    }
  });

  return distribution;
}

/**
 * Generate time series data for charts
 */
export function generateTimeSeriesData(
  calls: CallData[],
  days: number = 7
): TimeSeriesData[] {
  const now = new Date();
  const data: TimeSeriesData[] = [];

  // Generate data for each day
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayCalls = calls.filter(call => {
      const callDate = new Date(call.timestamp);
      return callDate >= date && callDate < nextDate;
    });

    data.push({
      date: date.toISOString().split('T')[0],
      calls: dayCalls.length,
      answered: dayCalls.filter(c => c.outcome === 'answered').length,
      converted: dayCalls.filter(c => c.converted).length,
    });
  }

  return data;
}

/**
 * Calculate campaign comparison statistics
 */
export function calculateCampaignStats(calls: CallData[]): CampaignStats[] {
  const campaignMap = new Map<string, CallData[]>();

  // Group calls by campaign
  calls.forEach(call => {
    if (!campaignMap.has(call.campaignId)) {
      campaignMap.set(call.campaignId, []);
    }
    campaignMap.get(call.campaignId)!.push(call);
  });

  // Calculate stats for each campaign
  const stats: CampaignStats[] = [];
  campaignMap.forEach((campaignCalls, campaignId) => {
    const totalCalls = campaignCalls.length;
    const answeredCalls = campaignCalls.filter(c => c.outcome === 'answered').length;
    const convertedCalls = campaignCalls.filter(c => c.converted).length;
    const totalDuration = campaignCalls.reduce((sum, c) => sum + c.duration, 0);

    stats.push({
      campaignId,
      campaignName: campaignCalls[0].campaignName,
      totalCalls,
      answerRate: totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0,
      conversionRate: totalCalls > 0 ? (convertedCalls / totalCalls) * 100 : 0,
      avgDuration: totalCalls > 0 ? totalDuration / totalCalls : 0,
    });
  });

  return stats.sort((a, b) => b.totalCalls - a.totalCalls);
}

/**
 * Format duration in seconds to human-readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Format percentage with specified decimal places
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Export calls data to CSV format
 */
export function exportToCSV(calls: CallData[]): string {
  const headers = [
    'Date',
    'Campaign',
    'Prospect Name',
    'Phone',
    'Outcome',
    'Duration',
    'Converted',
    'Notes'
  ];

  const rows = calls.map(call => [
    new Date(call.timestamp).toLocaleString(),
    call.campaignName,
    call.prospectName,
    call.prospectPhone,
    call.outcome,
    formatDuration(call.duration),
    call.converted ? 'Yes' : 'No',
    call.notes || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string = 'analytics-export.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Filter calls by date range
 */
export function filterCallsByDateRange(
  calls: CallData[],
  startDate: Date,
  endDate: Date
): CallData[] {
  return calls.filter(call => {
    const callDate = new Date(call.timestamp);
    return callDate >= startDate && callDate <= endDate;
  });
}

/**
 * Filter calls by campaign
 */
export function filterCallsByCampaign(
  calls: CallData[],
  campaignId: string
): CallData[] {
  return calls.filter(call => call.campaignId === campaignId);
}

/**
 * Filter calls by outcome
 */
export function filterCallsByOutcome(
  calls: CallData[],
  outcome: CallData['outcome']
): CallData[] {
  return calls.filter(call => call.outcome === outcome);
}
