/**
 * CallCard Component
 * Displays a single call with status, duration, and details
 */

'use client';

import { Call } from '@/types/call';
import { Phone, Clock, DollarSign, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface CallCardProps {
  call: Call & {
    prospect?: {
      firstName: string;
      lastName: string;
      company?: string;
    };
  };
}

export default function CallCard({ call }: CallCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'busy':
      case 'no-answer':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
      case 'ringing':
        return 'bg-blue-100 text-blue-800';
      case 'queued':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
      case 'canceled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'busy':
      case 'no-answer':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'in-progress':
      case 'ringing':
        return <Phone className="h-5 w-5 text-blue-600 animate-pulse" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon(call.status)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {call.prospect
                ? `${call.prospect.firstName} ${call.prospect.lastName}`
                : call.toNumber}
            </h3>
            {call.prospect?.company && (
              <p className="text-sm text-gray-600">{call.prospect.company}</p>
            )}
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
            call.status
          )}`}
        >
          {call.status.replace('-', ' ').toUpperCase()}
        </span>
      </div>

      {/* Call Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Phone Number</p>
          <p className="text-sm font-medium text-gray-900">{call.toNumber}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Duration</p>
          <p className="text-sm font-medium text-gray-900">
            {formatDuration(call.duration)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Started At</p>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(call.startedAt)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Cost</p>
          <p className="text-sm font-medium text-gray-900">
            {call.cost ? `$${Math.abs(parseFloat(call.cost)).toFixed(4)}` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Answered By */}
      {call.answeredBy && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Answered By</p>
          <p className="text-sm font-medium text-gray-900">
            {call.answeredBy === 'human' ? 'Human' : 'Voicemail/Machine'}
          </p>
        </div>
      )}

      {/* Error Message */}
      {call.errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-red-800">Error</p>
              <p className="text-xs text-red-700">{call.errorMessage}</p>
              {call.errorCode && (
                <p className="text-xs text-red-600 mt-1">Code: {call.errorCode}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recording */}
      {call.recordingUrl && (
        <div className="mt-4">
          <audio controls className="w-full">
            <source src={call.recordingUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Call ID: {call.id.substring(0, 8)}...</span>
          {call.twilioCallSid && (
            <span>Twilio SID: {call.twilioCallSid.substring(0, 10)}...</span>
          )}
        </div>
      </div>
    </div>
  );
}
