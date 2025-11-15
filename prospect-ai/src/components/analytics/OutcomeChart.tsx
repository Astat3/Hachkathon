'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { OutcomeDistribution } from '@/lib/analytics/calculator';

interface OutcomeChartProps {
  distribution: OutcomeDistribution;
  isLoading?: boolean;
}

const COLORS = {
  answered: '#10b981',
  voicemail: '#6b7280',
  busy: '#f59e0b',
  noAnswer: '#ef4444',
  failed: '#dc2626',
};

const LABELS = {
  answered: 'Answered',
  voicemail: 'Voicemail',
  busy: 'Busy',
  noAnswer: 'No Answer',
  failed: 'Failed',
};

export function OutcomeChart({ distribution, isLoading = false }: OutcomeChartProps) {
  const data = [
    { name: LABELS.answered, value: distribution.answered, color: COLORS.answered },
    { name: LABELS.voicemail, value: distribution.voicemail, color: COLORS.voicemail },
    { name: LABELS.busy, value: distribution.busy, color: COLORS.busy },
    { name: LABELS.noAnswer, value: distribution.noAnswer, color: COLORS.noAnswer },
    { name: LABELS.failed, value: distribution.failed, color: COLORS.failed },
  ].filter(item => item.value > 0);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Call Outcomes</CardTitle>
          <CardDescription>Distribution of call results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Call Outcomes</CardTitle>
          <CardDescription>Distribution of call results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">No data available</p>
              <p className="mt-1 text-sm text-gray-500">
                Start making calls to see outcome distribution
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / total) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Outcomes</CardTitle>
        <CardDescription>Distribution of call results</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
              }}
              formatter={(value: number) => {
                const percent = ((value / total) * 100).toFixed(1);
                return [`${value} (${percent}%)`, 'Calls'];
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value, entry: any) => {
                const percent = ((entry.payload.value / total) * 100).toFixed(1);
                return `${value}: ${entry.payload.value} (${percent}%)`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
