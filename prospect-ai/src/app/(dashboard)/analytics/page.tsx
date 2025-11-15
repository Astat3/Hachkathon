'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { StatsCard } from '@/components/analytics/StatsCard';
import { CallHistoryTable } from '@/components/analytics/CallHistoryTable';
import { PerformanceChart } from '@/components/analytics/PerformanceChart';
import { OutcomeChart } from '@/components/analytics/OutcomeChart';
import { CampaignComparison } from '@/components/analytics/CampaignComparison';
import {
  CallData,
  calculateStats,
  calculateOutcomeDistribution,
  generateTimeSeriesData,
  calculateCampaignStats,
  formatDuration,
  formatPercentage,
  exportToCSV,
  downloadCSV,
} from '@/lib/analytics/calculator';
import { Phone, CheckCircle, Clock, TrendingUp, Download, RefreshCw } from 'lucide-react';

export default function AnalyticsPage() {
  const [calls, setCalls] = useState<CallData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30');
  const [isExporting, setIsExporting] = useState(false);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const response = await fetch(
        `/api/analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result = await response.json();
      setCalls(result.data.calls);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  // Calculate metrics
  const stats = calculateStats(calls);
  const outcomeDistribution = calculateOutcomeDistribution(calls);
  const timeSeriesData = generateTimeSeriesData(calls, parseInt(dateRange));
  const campaignStats = calculateCampaignStats(calls);

  // Handle export to CSV
  const handleExport = () => {
    setIsExporting(true);
    try {
      const csvContent = exportToCSV(calls);
      const filename = `analytics-${dateRange}days-${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">
            Track your performance and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchAnalytics}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || calls.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex items-center gap-3">
        <label htmlFor="date-range" className="text-sm font-medium text-gray-700">
          Date Range:
        </label>
        <Select
          id="date-range"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as '7' | '30' | '90')}
          className="w-40"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Calls"
          value={stats.totalCalls}
          icon={Phone}
          description="in selected period"
        />
        <StatsCard
          title="Answer Rate"
          value={formatPercentage(stats.answerRate)}
          icon={CheckCircle}
          description="calls answered"
        />
        <StatsCard
          title="Avg Duration"
          value={formatDuration(stats.avgDuration)}
          icon={Clock}
          description="per call"
        />
        <StatsCard
          title="Conversion Rate"
          value={formatPercentage(stats.conversionRate)}
          icon={TrendingUp}
          description="calls converted"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PerformanceChart data={timeSeriesData} isLoading={isLoading} />
        <OutcomeChart distribution={outcomeDistribution} isLoading={isLoading} />
      </div>

      {/* Campaign Comparison */}
      <CampaignComparison campaigns={campaignStats} isLoading={isLoading} />

      {/* Call History Table */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Call History</h2>
        <CallHistoryTable calls={calls} isLoading={isLoading} />
      </div>
    </div>
  );
}
