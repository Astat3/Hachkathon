/**
 * Call types for Twilio integration
 */

export type CallStatus =
  | 'queued'
  | 'ringing'
  | 'in-progress'
  | 'completed'
  | 'failed'
  | 'busy'
  | 'no-answer'
  | 'canceled';

export type AnsweredBy =
  | 'human'
  | 'machine_start'
  | 'machine_end_beep'
  | 'machine_end_silence'
  | 'machine_end_other'
  | 'fax'
  | 'unknown';

export interface Call {
  id: string;
  campaignId: string;
  prospectId: string;
  twilioCallSid?: string;
  fromNumber: string;
  toNumber: string;
  status: CallStatus;
  direction: string;
  duration?: number;
  recordingUrl?: string;
  recordingSid?: string;
  cost?: string;
  errorCode?: string;
  errorMessage?: string;
  answeredBy?: AnsweredBy;
  startedAt?: Date;
  endedAt?: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaceCallRequest {
  campaignId: string;
  prospectId: string;
  fromNumber?: string; // Optional, will use default from env if not provided
  audioUrl?: string; // URL to audio file to play
  record?: boolean; // Whether to record the call
}

export interface PlaceCallResponse {
  success: boolean;
  call?: Call;
  message?: string;
  error?: string;
}

export interface CallStatusUpdate {
  CallSid: string;
  CallStatus: CallStatus;
  CallDuration?: string;
  RecordingUrl?: string;
  RecordingSid?: string;
  AnsweredBy?: AnsweredBy;
  ErrorCode?: string;
  ErrorMessage?: string;
  [key: string]: any;
}

export interface GetCallsRequest {
  campaignId?: string;
  prospectId?: string;
  status?: CallStatus;
  limit?: number;
  offset?: number;
}

export interface GetCallsResponse {
  calls: Call[];
  total: number;
  limit: number;
  offset: number;
}

export interface CallStats {
  total: number;
  completed: number;
  failed: number;
  busy: number;
  noAnswer: number;
  inProgress: number;
  queued: number;
  averageDuration?: number;
  totalCost?: number;
  answeredByHuman?: number;
  answeredByMachine?: number;
}

export interface ScheduleCallRequest {
  campaignId: string;
  prospectId: string;
  scheduledFor?: Date; // Optional, will schedule immediately if not provided
}

export interface ScheduleCallResponse {
  success: boolean;
  scheduledCall?: {
    id: string;
    scheduledFor: Date;
  };
  message?: string;
  error?: string;
}

export interface CallWindowConfig {
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timezone: string;
  dailyLimit: number;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // in minutes
  retryStatuses: CallStatus[];
}
