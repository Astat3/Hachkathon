/**
 * Twilio API Client
 * Handles direct communication with Twilio API for call placement
 */

import { CallStatus } from '@/types/call';

const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01';

export interface TwilioCallParams {
  To: string;
  From: string;
  Url?: string; // TwiML URL
  Twiml?: string; // Inline TwiML
  StatusCallback?: string;
  StatusCallbackEvent?: string[];
  StatusCallbackMethod?: 'GET' | 'POST';
  MachineDetection?: 'Enable' | 'DetectMessageEnd';
  MachineDetectionTimeout?: number;
  Record?: boolean;
  RecordingStatusCallback?: string;
  RecordingStatusCallbackMethod?: 'GET' | 'POST';
  Timeout?: number;
}

export interface TwilioCallResponse {
  sid: string;
  status: CallStatus;
  to: string;
  from: string;
  direction: string;
  date_created: string;
  date_updated: string;
  duration?: string;
  price?: string;
  price_unit?: string;
  uri: string;
  [key: string]: any;
}

export class TwilioClient {
  private accountSid: string;
  private authToken: string;
  private phoneNumber: string;
  private isSimulated: boolean;

  constructor(
    accountSid?: string,
    authToken?: string,
    phoneNumber?: string
  ) {
    this.accountSid = accountSid || process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = authToken || process.env.TWILIO_AUTH_TOKEN || '';
    this.phoneNumber = phoneNumber || process.env.TWILIO_PHONE_NUMBER || '';

    // If credentials are not available, enable simulation mode
    this.isSimulated = !this.accountSid || !this.authToken || !this.phoneNumber;

    if (this.isSimulated) {
      console.warn('Twilio credentials not configured. Running in simulation mode.');
    }
  }

  /**
   * Check if client is in simulation mode
   */
  isSimulationMode(): boolean {
    return this.isSimulated;
  }

  /**
   * Get the default phone number
   */
  getDefaultPhoneNumber(): string {
    return this.phoneNumber;
  }

  /**
   * Place a call using Twilio API
   */
  async placeCall(params: TwilioCallParams): Promise<TwilioCallResponse> {
    // Simulation mode
    if (this.isSimulated) {
      return this.simulateCall(params);
    }

    try {
      const url = `${TWILIO_API_BASE}/Accounts/${this.accountSid}/Calls.json`;
      
      // Create form data
      const formData = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => formData.append(key, v));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Twilio API error: ${response.status} - ${errorData.message || response.statusText}`
        );
      }

      const data = await response.json();
      return this.normalizeTwilioResponse(data);
    } catch (error) {
      console.error('Error placing call with Twilio:', error);
      throw error;
    }
  }

  /**
   * Get call status from Twilio
   */
  async getCallStatus(callSid: string): Promise<TwilioCallResponse> {
    // Simulation mode
    if (this.isSimulated) {
      return this.simulateCallStatus(callSid);
    }

    try {
      const url = `${TWILIO_API_BASE}/Accounts/${this.accountSid}/Calls/${callSid}.json`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64'),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Twilio API error: ${response.status} - ${errorData.message || response.statusText}`
        );
      }

      const data = await response.json();
      return this.normalizeTwilioResponse(data);
    } catch (error) {
      console.error('Error fetching call status from Twilio:', error);
      throw error;
    }
  }

  /**
   * Update a call (e.g., to cancel or modify)
   */
  async updateCall(
    callSid: string,
    updates: { Status?: 'canceled' | 'completed'; Url?: string; Method?: 'GET' | 'POST' }
  ): Promise<TwilioCallResponse> {
    // Simulation mode
    if (this.isSimulated) {
      return this.simulateCallStatus(callSid, updates.Status as CallStatus);
    }

    try {
      const url = `${TWILIO_API_BASE}/Accounts/${this.accountSid}/Calls/${callSid}.json`;
      
      const formData = new URLSearchParams();
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Twilio API error: ${response.status} - ${errorData.message || response.statusText}`
        );
      }

      const data = await response.json();
      return this.normalizeTwilioResponse(data);
    } catch (error) {
      console.error('Error updating call with Twilio:', error);
      throw error;
    }
  }

  /**
   * Generate TwiML for playing audio
   */
  generatePlayAudioTwiML(audioUrl: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${audioUrl}</Play>
</Response>`;
  }

  /**
   * Generate TwiML for saying text
   */
  generateSayTextTwiML(text: string, voice: string = 'alice', language: string = 'en-US'): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}" language="${language}">${text}</Say>
</Response>`;
  }

  /**
   * Normalize Twilio API response
   */
  private normalizeTwilioResponse(data: any): TwilioCallResponse {
    return {
      sid: data.sid,
      status: data.status as CallStatus,
      to: data.to,
      from: data.from,
      direction: data.direction,
      date_created: data.date_created,
      date_updated: data.date_updated,
      duration: data.duration,
      price: data.price,
      price_unit: data.price_unit,
      uri: data.uri,
      ...data,
    };
  }

  /**
   * Simulate a call for testing without Twilio credentials
   */
  private simulateCall(params: TwilioCallParams): TwilioCallResponse {
    const callSid = `CA${this.generateRandomId()}`;
    const now = new Date().toISOString();

    console.log('[SIMULATED CALL] Placing call:', {
      to: params.To,
      from: params.From,
      callSid,
    });

    return {
      sid: callSid,
      status: 'queued',
      to: params.To,
      from: params.From,
      direction: 'outbound-api',
      date_created: now,
      date_updated: now,
      uri: `/2010-04-01/Accounts/SIMULATED/Calls/${callSid}.json`,
    };
  }

  /**
   * Simulate call status for testing
   */
  private simulateCallStatus(callSid: string, status?: CallStatus): TwilioCallResponse {
    const now = new Date().toISOString();
    
    // Randomly determine status if not provided
    const simulatedStatus = status || this.getRandomCallStatus();

    console.log('[SIMULATED CALL] Call status:', {
      callSid,
      status: simulatedStatus,
    });

    return {
      sid: callSid,
      status: simulatedStatus,
      to: '+15555555555',
      from: '+15555551234',
      direction: 'outbound-api',
      date_created: now,
      date_updated: now,
      duration: simulatedStatus === 'completed' ? '45' : undefined,
      price: simulatedStatus === 'completed' ? '-0.0200' : undefined,
      price_unit: 'USD',
      uri: `/2010-04-01/Accounts/SIMULATED/Calls/${callSid}.json`,
    };
  }

  /**
   * Generate random ID for simulation
   */
  private generateRandomId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Get random call status for simulation
   */
  private getRandomCallStatus(): CallStatus {
    const statuses: CallStatus[] = ['completed', 'busy', 'no-answer', 'failed'];
    const weights = [0.7, 0.1, 0.15, 0.05]; // 70% completed, 10% busy, 15% no-answer, 5% failed
    
    const random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < statuses.length; i++) {
      sum += weights[i];
      if (random < sum) {
        return statuses[i];
      }
    }
    
    return 'completed';
  }
}

// Singleton instance
let twilioClient: TwilioClient | null = null;

export function getTwilioClient(): TwilioClient {
  if (!twilioClient) {
    twilioClient = new TwilioClient();
  }
  return twilioClient;
}
