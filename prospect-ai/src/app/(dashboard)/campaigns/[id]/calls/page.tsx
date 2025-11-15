/**
 * Campaign Calls Page
 * Displays all calls for a specific campaign with stats and filters
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CallTable from '@/components/calls/CallTable';
import { Call, CallStats } from '@/types/call';
import {
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface CallWithProspect extends Call {
  prospect?: {
    firstName: string;
    lastName: string;
    company?: string;
    phone: string;
  };
}

export default function CampaignCallsPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [calls, setCalls] = useState<CallWithProspect[]>([]);
  const [stats, setStats] = useState<CallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalls();
    fetchStats();
  }, [campaignId]);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/calls?campaignId=${campaignId}&limit=100`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch calls');
      }

      const data = await response.json();
      setCalls(data.calls || []);
    } catch (err) {
      console.error('Error fetching calls:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch calls');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/stats`);
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: any;
    label: string;
    value: string | number;
    color: string;
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Calls</h1>
          <p className="mt-2 text-gray-600">
            View and manage all calls for this campaign
          </p>
        </div>
        <button
          onClick={fetchCalls}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Phone}
            label="Total Calls"
            value={stats.total}
            color="bg-blue-600"
          />
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={stats.completed}
            color="bg-green-600"
          />
          <StatCard
            icon={XCircle}
            label="Failed"
            value={stats.failed + stats.busy + stats.noAnswer}
            color="bg-red-600"
          />
          <StatCard
            icon={DollarSign}
            label="Total Cost"
            value={stats.totalCost ? `$${stats.totalCost.toFixed(2)}` : '$0.00'}
            color="bg-purple-600"
          />
        </div>
      )}

      {/* Additional Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <p className="text-sm text-gray-600">Average Duration</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {stats.averageDuration
                ? `${Math.floor(stats.averageDuration / 60)}:${(stats.averageDuration % 60)
                    .toString()
                    .padStart(2, '0')}`
                : 'N/A'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <p className="text-sm text-gray-600">Human Answers</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {stats.answeredByHuman || 0}
              <span className="text-sm text-gray-500 ml-2">
                ({stats.total > 0
                  ? Math.round(((stats.answeredByHuman || 0) / stats.total) * 100)
                  : 0}
                %)
              </span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-2">
              <AlertCircle className="h-5 w-5 text-gray-600" />
              <p className="text-sm text-gray-600">Machine Answers</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {stats.answeredByMachine || 0}
              <span className="text-sm text-gray-500 ml-2">
                ({stats.total > 0
                  ? Math.round(((stats.answeredByMachine || 0) / stats.total) * 100)
                  : 0}
                %)
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Calls Table */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Call History</h2>
        <CallTable calls={calls} loading={loading} />
      </div>
    </div>
  );
}
