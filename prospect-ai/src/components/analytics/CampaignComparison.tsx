'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CampaignStats } from '@/lib/analytics/calculator';

interface CampaignComparisonProps {
  campaigns: CampaignStats[];
  isLoading?: boolean;
}

export function CampaignComparison({ campaigns, isLoading = false }: CampaignComparisonProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Comparison</CardTitle>
          <CardDescription>Compare performance across campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Comparison</CardTitle>
          <CardDescription>Compare performance across campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">No campaigns available</p>
              <p className="mt-1 text-sm text-gray-500">
                Create campaigns to see comparison data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the chart
  const chartData = campaigns.slice(0, 5).map(campaign => ({
    name: campaign.campaignName.length > 20 
      ? campaign.campaignName.substring(0, 20) + '...' 
      : campaign.campaignName,
    fullName: campaign.campaignName,
    calls: campaign.totalCalls,
    answerRate: Number(campaign.answerRate.toFixed(1)),
    conversionRate: Number(campaign.conversionRate.toFixed(1)),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Comparison</CardTitle>
        <CardDescription>
          Compare performance across your top {chartData.length} campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{ 
                value: 'Percentage (%)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 12, fill: '#6b7280' }
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
              }}
              labelFormatter={(value, payload) => {
                if (payload && payload[0]) {
                  return payload[0].payload.fullName;
                }
                return value;
              }}
              formatter={(value: number, name: string) => {
                if (name === 'calls') {
                  return [value, 'Total Calls'];
                }
                return [`${value}%`, name === 'answerRate' ? 'Answer Rate' : 'Conversion Rate'];
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
              formatter={(value) => {
                if (value === 'calls') return 'Total Calls';
                if (value === 'answerRate') return 'Answer Rate (%)';
                if (value === 'conversionRate') return 'Conversion Rate (%)';
                return value;
              }}
            />
            <Bar
              dataKey="answerRate"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              name="answerRate"
            />
            <Bar
              dataKey="conversionRate"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              name="conversionRate"
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Campaign details table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="pb-2 text-left font-medium text-gray-600">Campaign</th>
                <th className="pb-2 text-right font-medium text-gray-600">Calls</th>
                <th className="pb-2 text-right font-medium text-gray-600">Answer Rate</th>
                <th className="pb-2 text-right font-medium text-gray-600">Conversion</th>
                <th className="pb-2 text-right font-medium text-gray-600">Avg Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.slice(0, 5).map((campaign) => (
                <tr key={campaign.campaignId} className="hover:bg-gray-50">
                  <td className="py-2 text-gray-900">{campaign.campaignName}</td>
                  <td className="py-2 text-right text-gray-900">{campaign.totalCalls}</td>
                  <td className="py-2 text-right text-gray-900">
                    {campaign.answerRate.toFixed(1)}%
                  </td>
                  <td className="py-2 text-right text-gray-900">
                    {campaign.conversionRate.toFixed(1)}%
                  </td>
                  <td className="py-2 text-right text-gray-900">
                    {Math.round(campaign.avgDuration)}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
