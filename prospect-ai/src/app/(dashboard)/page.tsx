import { 
  Users, 
  TrendingUp, 
  Phone, 
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function DashboardPage() {
  // Mock data - replace with real data from your API
  const stats = [
    {
      name: 'Total Prospects',
      value: '2,543',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'blue',
    },
    {
      name: 'Active Campaigns',
      value: '8',
      change: '+2',
      trend: 'up',
      icon: Target,
      color: 'purple',
    },
    {
      name: 'Calls Made',
      value: '1,234',
      change: '+18.2%',
      trend: 'up',
      icon: Phone,
      color: 'green',
    },
    {
      name: 'Conversion Rate',
      value: '24.8%',
      change: '-2.4%',
      trend: 'down',
      icon: TrendingUp,
      color: 'orange',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'New prospect added',
      prospect: 'John Doe - Acme Corp',
      time: '5 minutes ago',
    },
    {
      id: 2,
      action: 'Campaign completed',
      prospect: 'Q4 Outreach Campaign',
      time: '1 hour ago',
    },
    {
      id: 3,
      action: 'Call scheduled',
      prospect: 'Jane Smith - Tech Solutions',
      time: '2 hours ago',
    },
    {
      id: 4,
      action: 'Script updated',
      prospect: 'Cold Call Script v2',
      time: '3 hours ago',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your prospecting today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            purple: 'bg-purple-100 text-purple-600',
            green: 'bg-green-100 text-green-600',
            orange: 'bg-orange-100 text-orange-600',
          }[stat.color];

          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${colorClasses}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm text-gray-600 mt-1">{stat.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.prospect}
                  </p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                Add New Prospect
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Start onboarding a new prospect
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </button>

        <button className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                Create Campaign
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Launch a new outreach campaign
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </button>

        <button className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                View Analytics
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Check your performance metrics
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </button>
      </div>
    </div>
  );
}
