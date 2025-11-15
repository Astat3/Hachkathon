/**
 * CallTable Component
 * Displays a table of calls with sorting and filtering
 */

'use client';

import { Call } from '@/types/call';
import { Phone, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface CallTableProps {
  calls: (Call & {
    prospect?: {
      firstName: string;
      lastName: string;
      company?: string;
      phone: string;
    };
  })[];
  loading?: boolean;
}

export default function CallTable({ calls, loading }: CallTableProps) {
  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium inline-flex items-center space-x-1';
    
    switch (status) {
      case 'completed':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <CheckCircle className="h-3 w-3" />
            <span>Completed</span>
          </span>
        );
      case 'failed':
      case 'canceled':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <XCircle className="h-3 w-3" />
            <span>{status === 'failed' ? 'Failed' : 'Canceled'}</span>
          </span>
        );
      case 'busy':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <AlertCircle className="h-3 w-3" />
            <span>Busy</span>
          </span>
        );
      case 'no-answer':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <AlertCircle className="h-3 w-3" />
            <span>No Answer</span>
          </span>
        );
      case 'in-progress':
      case 'ringing':
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            <Phone className="h-3 w-3 animate-pulse" />
            <span>{status === 'ringing' ? 'Ringing' : 'In Progress'}</span>
          </span>
        );
      case 'queued':
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            <Clock className="h-3 w-3" />
            <span>Queued</span>
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            <span>{status}</span>
          </span>
        );
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading calls...</p>
        </div>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center">
          <Phone className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No calls yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start placing calls to see them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Prospect
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Phone
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Duration
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Answered By
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Started At
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Cost
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {calls.map((call) => (
              <tr key={call.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {call.prospect
                          ? `${call.prospect.firstName} ${call.prospect.lastName}`
                          : 'Unknown'}
                      </div>
                      {call.prospect?.company && (
                        <div className="text-sm text-gray-500">
                          {call.prospect.company}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{call.toNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(call.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDuration(call.duration)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {call.answeredBy === 'human' ? (
                      <span className="text-green-600 font-medium">Human</span>
                    ) : call.answeredBy?.startsWith('machine') ? (
                      <span className="text-yellow-600">Machine</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(call.startedAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {call.cost ? `$${Math.abs(parseFloat(call.cost)).toFixed(4)}` : '-'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
