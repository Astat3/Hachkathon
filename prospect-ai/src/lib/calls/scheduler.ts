/**
 * Call Scheduler
 * Manages call scheduling with time windows, daily limits, and retries
 */

import { prisma } from '@/lib/prisma';
import { getCallService } from './call-service';
import {
  CallWindowConfig,
  RetryConfig,
  ScheduleCallRequest,
  ScheduleCallResponse,
  CallStatus,
} from '@/types/call';

export class CallScheduler {
  private callService = getCallService();

  /**
   * Check if current time is within call window
   */
  isWithinCallWindow(config: CallWindowConfig): boolean {
    try {
      const now = new Date();
      
      // Parse time strings (HH:mm format)
      const [startHour, startMinute] = config.startTime.split(':').map(Number);
      const [endHour, endMinute] = config.endTime.split(':').map(Number);

      // Create date objects for comparison
      const startTime = new Date(now);
      startTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(now);
      endTime.setHours(endHour, endMinute, 0, 0);

      // Check if current time is within window
      return now >= startTime && now <= endTime;
    } catch (error) {
      console.error('Error checking call window:', error);
      return false;
    }
  }

  /**
   * Check if daily call limit has been reached
   */
  async hasReachedDailyLimit(campaignId: string, dailyLimit: number): Promise<boolean> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const callsToday = await prisma.call.count({
        where: {
          campaignId,
          createdAt: {
            gte: today,
          },
        },
      });

      return callsToday >= dailyLimit;
    } catch (error) {
      console.error('Error checking daily limit:', error);
      return true; // Fail safe - assume limit reached on error
    }
  }

  /**
   * Get remaining calls for today
   */
  async getRemainingCallsToday(campaignId: string, dailyLimit: number): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const callsToday = await prisma.call.count({
        where: {
          campaignId,
          createdAt: {
            gte: today,
          },
        },
      });

      return Math.max(0, dailyLimit - callsToday);
    } catch (error) {
      console.error('Error getting remaining calls:', error);
      return 0;
    }
  }

  /**
   * Schedule a call for a prospect
   */
  async scheduleCall(request: ScheduleCallRequest): Promise<ScheduleCallResponse> {
    try {
      // Fetch campaign configuration
      const campaign = await prisma.campaign.findUnique({
        where: { id: request.campaignId },
      });

      if (!campaign) {
        return {
          success: false,
          error: 'Campaign not found',
        };
      }

      // Check if campaign is active
      if (campaign.status !== 'active') {
        return {
          success: false,
          error: 'Campaign is not active',
        };
      }

      // Create call window config
      const callWindowConfig: CallWindowConfig = {
        startTime: campaign.callWindowStart,
        endTime: campaign.callWindowEnd,
        timezone: campaign.timezone,
        dailyLimit: campaign.dailyCallLimit,
      };

      // Check if within call window
      if (!this.isWithinCallWindow(callWindowConfig)) {
        return {
          success: false,
          error: `Calls can only be placed between ${campaign.callWindowStart} and ${campaign.callWindowEnd}`,
        };
      }

      // Check daily limit
      const hasReachedLimit = await this.hasReachedDailyLimit(
        request.campaignId,
        campaign.dailyCallLimit
      );

      if (hasReachedLimit) {
        return {
          success: false,
          error: 'Daily call limit reached',
        };
      }

      // Place the call immediately
      const result = await this.callService.placeCall({
        campaignId: request.campaignId,
        prospectId: request.prospectId,
      });

      if (!result.success || !result.call) {
        return {
          success: false,
          error: result.error || 'Failed to place call',
        };
      }

      return {
        success: true,
        scheduledCall: {
          id: result.call.id,
          scheduledFor: result.call.createdAt,
        },
        message: result.message,
      };
    } catch (error) {
      console.error('Error scheduling call:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to schedule call',
      };
    }
  }

  /**
   * Schedule calls for all pending prospects in a campaign
   */
  async scheduleCampaignCalls(campaignId: string, maxCalls?: number): Promise<{
    success: boolean;
    scheduled: number;
    failed: number;
    errors: string[];
  }> {
    try {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          prospects: {
            where: {
              status: 'pending',
            },
          },
        },
      });

      if (!campaign) {
        return {
          success: false,
          scheduled: 0,
          failed: 0,
          errors: ['Campaign not found'],
        };
      }

      // Get remaining calls for today
      const remaining = await this.getRemainingCallsToday(
        campaignId,
        campaign.dailyCallLimit
      );

      // Determine how many calls to place
      const callsToPlace = Math.min(
        remaining,
        maxCalls || remaining,
        campaign.prospects.length
      );

      const results = {
        success: true,
        scheduled: 0,
        failed: 0,
        errors: [] as string[],
      };

      // Schedule calls for prospects
      for (let i = 0; i < callsToPlace; i++) {
        const prospect = campaign.prospects[i];

        const result = await this.scheduleCall({
          campaignId,
          prospectId: prospect.id,
        });

        if (result.success) {
          results.scheduled++;
        } else {
          results.failed++;
          results.errors.push(`${prospect.firstName} ${prospect.lastName}: ${result.error}`);
        }

        // Add small delay between calls to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      return results;
    } catch (error) {
      console.error('Error scheduling campaign calls:', error);
      return {
        success: false,
        scheduled: 0,
        failed: 0,
        errors: [error instanceof Error ? error.message : 'Failed to schedule campaign calls'],
      };
    }
  }

  /**
   * Retry failed calls based on retry configuration
   */
  async retryFailedCalls(campaignId: string, retryConfig: RetryConfig): Promise<{
    success: boolean;
    retried: number;
    failed: number;
    errors: string[];
  }> {
    try {
      // Find calls that need retry
      const failedCalls = await prisma.call.findMany({
        where: {
          campaignId,
          status: {
            in: retryConfig.retryStatuses,
          },
          createdAt: {
            lte: new Date(Date.now() - retryConfig.retryDelay * 60 * 1000),
          },
        },
        include: {
          prospect: true,
        },
      });

      const results = {
        success: true,
        retried: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const call of failedCalls) {
        // Check if max retries reached
        const previousAttempts = await prisma.call.count({
          where: {
            prospectId: call.prospectId,
            campaignId,
          },
        });

        if (previousAttempts >= retryConfig.maxRetries) {
          continue;
        }

        // Schedule retry
        const result = await this.scheduleCall({
          campaignId,
          prospectId: call.prospectId,
        });

        if (result.success) {
          results.retried++;
        } else {
          results.failed++;
          results.errors.push(
            `${call.prospect.firstName} ${call.prospect.lastName}: ${result.error}`
          );
        }

        // Add delay between retries
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      return results;
    } catch (error) {
      console.error('Error retrying failed calls:', error);
      return {
        success: false,
        retried: 0,
        failed: 0,
        errors: [error instanceof Error ? error.message : 'Failed to retry calls'],
      };
    }
  }

  /**
   * Get next available call time for a campaign
   */
  async getNextAvailableCallTime(campaignId: string): Promise<Date | null> {
    try {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
      });

      if (!campaign) {
        return null;
      }

      const callWindowConfig: CallWindowConfig = {
        startTime: campaign.callWindowStart,
        endTime: campaign.callWindowEnd,
        timezone: campaign.timezone,
        dailyLimit: campaign.dailyCallLimit,
      };

      const now = new Date();

      // If within call window and under daily limit, return now
      if (this.isWithinCallWindow(callWindowConfig)) {
        const hasReachedLimit = await this.hasReachedDailyLimit(
          campaignId,
          campaign.dailyCallLimit
        );

        if (!hasReachedLimit) {
          return now;
        }
      }

      // Calculate next available time
      const [startHour, startMinute] = campaign.callWindowStart.split(':').map(Number);
      const nextDay = new Date(now);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(startHour, startMinute, 0, 0);

      return nextDay;
    } catch (error) {
      console.error('Error getting next available call time:', error);
      return null;
    }
  }

  /**
   * Get campaign call schedule summary
   */
  async getScheduleSummary(campaignId: string): Promise<{
    callWindow: string;
    dailyLimit: number;
    callsToday: number;
    remaining: number;
    nextAvailableTime: Date | null;
    isWithinWindow: boolean;
  } | null> {
    try {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
      });

      if (!campaign) {
        return null;
      }

      const callWindowConfig: CallWindowConfig = {
        startTime: campaign.callWindowStart,
        endTime: campaign.callWindowEnd,
        timezone: campaign.timezone,
        dailyLimit: campaign.dailyCallLimit,
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const callsToday = await prisma.call.count({
        where: {
          campaignId,
          createdAt: {
            gte: today,
          },
        },
      });

      const remaining = Math.max(0, campaign.dailyCallLimit - callsToday);
      const isWithinWindow = this.isWithinCallWindow(callWindowConfig);
      const nextAvailableTime = await this.getNextAvailableCallTime(campaignId);

      return {
        callWindow: `${campaign.callWindowStart} - ${campaign.callWindowEnd} ${campaign.timezone}`,
        dailyLimit: campaign.dailyCallLimit,
        callsToday,
        remaining,
        nextAvailableTime,
        isWithinWindow,
      };
    } catch (error) {
      console.error('Error getting schedule summary:', error);
      return null;
    }
  }
}

// Singleton instance
let callScheduler: CallScheduler | null = null;

export function getCallScheduler(): CallScheduler {
  if (!callScheduler) {
    callScheduler = new CallScheduler();
  }
  return callScheduler;
}
