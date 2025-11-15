/**
 * Call Service
 * High-level service for managing calls with database integration
 */

import { prisma } from '@/lib/prisma';
import { getTwilioClient, TwilioCallParams } from './twilio-client';
import {
  Call,
  CallStatus,
  PlaceCallRequest,
  PlaceCallResponse,
  GetCallsRequest,
  GetCallsResponse,
  CallStats,
  CallStatusUpdate,
} from '@/types/call';

export class CallService {
  private twilioClient = getTwilioClient();

  /**
   * Place a call to a prospect
   */
  async placeCall(request: PlaceCallRequest): Promise<PlaceCallResponse> {
    try {
      // Fetch campaign and prospect details
      const campaign = await prisma.campaign.findUnique({
        where: { id: request.campaignId },
        include: { script: true },
      });

      if (!campaign) {
        return {
          success: false,
          error: 'Campaign not found',
        };
      }

      const prospect = await prisma.prospect.findUnique({
        where: { id: request.prospectId },
      });

      if (!prospect) {
        return {
          success: false,
          error: 'Prospect not found',
        };
      }

      // Determine phone numbers
      const fromNumber = request.fromNumber || this.twilioClient.getDefaultPhoneNumber();
      const toNumber = prospect.phone;

      if (!fromNumber) {
        return {
          success: false,
          error: 'No from phone number configured',
        };
      }

      // Get audio URL (from campaign or request)
      const audioUrl = request.audioUrl || campaign.audioUrl;

      if (!audioUrl) {
        return {
          success: false,
          error: 'No audio URL available for this campaign',
        };
      }

      // Create call record in database
      const call = await prisma.call.create({
        data: {
          campaignId: request.campaignId,
          prospectId: request.prospectId,
          fromNumber,
          toNumber,
          status: 'queued',
          direction: 'outbound-api',
        },
      });

      // Prepare Twilio call parameters
      const callParams: TwilioCallParams = {
        To: toNumber,
        From: fromNumber,
        Url: undefined, // We'll use inline TwiML
        Twiml: this.twilioClient.generatePlayAudioTwiML(audioUrl),
        StatusCallback: `${process.env.NEXTAUTH_URL}/api/webhooks/twilio`,
        StatusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        StatusCallbackMethod: 'POST',
        MachineDetection: 'DetectMessageEnd',
        MachineDetectionTimeout: 30,
        Record: request.record || false,
        RecordingStatusCallback: request.record
          ? `${process.env.NEXTAUTH_URL}/api/webhooks/twilio/recording`
          : undefined,
        RecordingStatusCallbackMethod: 'POST',
        Timeout: 60,
      };

      // Place call with Twilio
      const twilioResponse = await this.twilioClient.placeCall(callParams);

      // Update call record with Twilio SID
      const updatedCall = await prisma.call.update({
        where: { id: call.id },
        data: {
          twilioCallSid: twilioResponse.sid,
          status: twilioResponse.status,
          startedAt: new Date(),
        },
      });

      return {
        success: true,
        call: this.mapPrismaCallToCall(updatedCall),
        message: this.twilioClient.isSimulationMode()
          ? 'Call simulated successfully (Twilio not configured)'
          : 'Call placed successfully',
      };
    } catch (error) {
      console.error('Error placing call:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to place call',
      };
    }
  }

  /**
   * Get call status from Twilio and update database
   */
  async getCallStatus(callId: string): Promise<Call | null> {
    try {
      const call = await prisma.call.findUnique({
        where: { id: callId },
      });

      if (!call) {
        return null;
      }

      // If call has Twilio SID, fetch latest status
      if (call.twilioCallSid && !this.twilioClient.isSimulationMode()) {
        const twilioResponse = await this.twilioClient.getCallStatus(call.twilioCallSid);

        // Update call record
        const updatedCall = await prisma.call.update({
          where: { id: callId },
          data: {
            status: twilioResponse.status,
            duration: twilioResponse.duration ? parseInt(twilioResponse.duration) : undefined,
            cost: twilioResponse.price || undefined,
            endedAt: twilioResponse.status === 'completed' ? new Date() : undefined,
          },
        });

        return this.mapPrismaCallToCall(updatedCall);
      }

      return this.mapPrismaCallToCall(call);
    } catch (error) {
      console.error('Error getting call status:', error);
      throw error;
    }
  }

  /**
   * Get calls with filters
   */
  async getCalls(request: GetCallsRequest): Promise<GetCallsResponse> {
    try {
      const where: any = {};

      if (request.campaignId) {
        where.campaignId = request.campaignId;
      }

      if (request.prospectId) {
        where.prospectId = request.prospectId;
      }

      if (request.status) {
        where.status = request.status;
      }

      const limit = request.limit || 50;
      const offset = request.offset || 0;

      const [calls, total] = await Promise.all([
        prisma.call.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
          include: {
            prospect: true,
            campaign: true,
          },
        }),
        prisma.call.count({ where }),
      ]);

      return {
        calls: calls.map(this.mapPrismaCallToCall),
        total,
        limit,
        offset,
      };
    } catch (error) {
      console.error('Error getting calls:', error);
      throw error;
    }
  }

  /**
   * Get call statistics for a campaign
   */
  async getCallStats(campaignId: string): Promise<CallStats> {
    try {
      const calls = await prisma.call.findMany({
        where: { campaignId },
      });

      const stats: CallStats = {
        total: calls.length,
        completed: 0,
        failed: 0,
        busy: 0,
        noAnswer: 0,
        inProgress: 0,
        queued: 0,
        answeredByHuman: 0,
        answeredByMachine: 0,
      };

      let totalDuration = 0;
      let totalCost = 0;
      let durationCount = 0;

      calls.forEach((call) => {
        // Count by status
        switch (call.status) {
          case 'completed':
            stats.completed++;
            break;
          case 'failed':
            stats.failed++;
            break;
          case 'busy':
            stats.busy++;
            break;
          case 'no-answer':
            stats.noAnswer++;
            break;
          case 'in-progress':
            stats.inProgress++;
            break;
          case 'queued':
            stats.queued++;
            break;
        }

        // Count by answered by
        if (call.answeredBy === 'human') {
          stats.answeredByHuman++;
        } else if (call.answeredBy?.startsWith('machine')) {
          stats.answeredByMachine++;
        }

        // Sum duration and cost
        if (call.duration) {
          totalDuration += call.duration;
          durationCount++;
        }

        if (call.cost) {
          totalCost += Math.abs(parseFloat(call.cost));
        }
      });

      if (durationCount > 0) {
        stats.averageDuration = Math.round(totalDuration / durationCount);
      }

      if (totalCost > 0) {
        stats.totalCost = parseFloat(totalCost.toFixed(4));
      }

      return stats;
    } catch (error) {
      console.error('Error getting call stats:', error);
      throw error;
    }
  }

  /**
   * Update call status from webhook
   */
  async updateCallStatus(update: CallStatusUpdate): Promise<Call | null> {
    try {
      const call = await prisma.call.findUnique({
        where: { twilioCallSid: update.CallSid },
      });

      if (!call) {
        console.warn('Call not found for Twilio SID:', update.CallSid);
        return null;
      }

      const updateData: any = {
        status: update.CallStatus,
        updatedAt: new Date(),
      };

      if (update.CallDuration) {
        updateData.duration = parseInt(update.CallDuration);
      }

      if (update.RecordingUrl) {
        updateData.recordingUrl = update.RecordingUrl;
      }

      if (update.RecordingSid) {
        updateData.recordingSid = update.RecordingSid;
      }

      if (update.AnsweredBy) {
        updateData.answeredBy = update.AnsweredBy;
      }

      if (update.ErrorCode) {
        updateData.errorCode = update.ErrorCode;
      }

      if (update.ErrorMessage) {
        updateData.errorMessage = update.ErrorMessage;
      }

      // Set endedAt for terminal states
      if (['completed', 'failed', 'busy', 'no-answer', 'canceled'].includes(update.CallStatus)) {
        updateData.endedAt = new Date();
      }

      const updatedCall = await prisma.call.update({
        where: { id: call.id },
        data: updateData,
      });

      // Update prospect status based on call outcome
      if (update.CallStatus === 'completed' && update.AnsweredBy === 'human') {
        await prisma.prospect.update({
          where: { id: call.prospectId },
          data: { status: 'contacted' },
        });
      }

      return this.mapPrismaCallToCall(updatedCall);
    } catch (error) {
      console.error('Error updating call status:', error);
      throw error;
    }
  }

  /**
   * Cancel a call
   */
  async cancelCall(callId: string): Promise<Call | null> {
    try {
      const call = await prisma.call.findUnique({
        where: { id: callId },
      });

      if (!call) {
        return null;
      }

      // If call is in progress and has Twilio SID, cancel it
      if (
        call.twilioCallSid &&
        ['queued', 'ringing', 'in-progress'].includes(call.status) &&
        !this.twilioClient.isSimulationMode()
      ) {
        await this.twilioClient.updateCall(call.twilioCallSid, { Status: 'canceled' });
      }

      // Update database
      const updatedCall = await prisma.call.update({
        where: { id: callId },
        data: {
          status: 'canceled',
          endedAt: new Date(),
        },
      });

      return this.mapPrismaCallToCall(updatedCall);
    } catch (error) {
      console.error('Error canceling call:', error);
      throw error;
    }
  }

  /**
   * Map Prisma call to Call type
   */
  private mapPrismaCallToCall(prismaCall: any): Call {
    return {
      id: prismaCall.id,
      campaignId: prismaCall.campaignId,
      prospectId: prismaCall.prospectId,
      twilioCallSid: prismaCall.twilioCallSid || undefined,
      fromNumber: prismaCall.fromNumber,
      toNumber: prismaCall.toNumber,
      status: prismaCall.status as CallStatus,
      direction: prismaCall.direction,
      duration: prismaCall.duration || undefined,
      recordingUrl: prismaCall.recordingUrl || undefined,
      recordingSid: prismaCall.recordingSid || undefined,
      cost: prismaCall.cost || undefined,
      errorCode: prismaCall.errorCode || undefined,
      errorMessage: prismaCall.errorMessage || undefined,
      answeredBy: prismaCall.answeredBy || undefined,
      startedAt: prismaCall.startedAt || undefined,
      endedAt: prismaCall.endedAt || undefined,
      metadata: prismaCall.metadata || undefined,
      createdAt: prismaCall.createdAt,
      updatedAt: prismaCall.updatedAt,
    };
  }
}

// Singleton instance
let callService: CallService | null = null;

export function getCallService(): CallService {
  if (!callService) {
    callService = new CallService();
  }
  return callService;
}
