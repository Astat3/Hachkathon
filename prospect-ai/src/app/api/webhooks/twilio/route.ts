/**
 * API Route: Twilio Webhook Handler
 * POST /api/webhooks/twilio
 * 
 * Handles status updates from Twilio for calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCallService } from '@/lib/calls/call-service';
import { CallStatusUpdate } from '@/types/call';

export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio
    const formData = await request.formData();
    
    // Convert form data to object
    const data: any = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    console.log('Twilio webhook received:', data);

    // Extract relevant fields
    const statusUpdate: CallStatusUpdate = {
      CallSid: data.CallSid,
      CallStatus: data.CallStatus,
      CallDuration: data.CallDuration,
      RecordingUrl: data.RecordingUrl,
      RecordingSid: data.RecordingSid,
      AnsweredBy: data.AnsweredBy,
      ErrorCode: data.ErrorCode,
      ErrorMessage: data.ErrorMessage,
      ...data,
    };

    // Update call status in database
    const callService = getCallService();
    const updatedCall = await callService.updateCallStatus(statusUpdate);

    if (!updatedCall) {
      console.warn('Call not found for webhook update:', statusUpdate.CallSid);
      // Return 200 anyway to prevent Twilio from retrying
      return NextResponse.json({ received: true });
    }

    console.log('Call status updated:', {
      callId: updatedCall.id,
      status: updatedCall.status,
      duration: updatedCall.duration,
    });

    // Return success response
    return NextResponse.json({ 
      received: true,
      callId: updatedCall.id,
      status: updatedCall.status,
    });
  } catch (error) {
    console.error('Error in Twilio webhook handler:', error);
    
    // Return 200 to prevent Twilio from retrying
    // Log the error for investigation
    return NextResponse.json(
      { 
        received: true,
        error: 'Internal error processing webhook',
      },
      { status: 200 }
    );
  }
}

// Allow POST requests without CSRF protection for webhooks
export const dynamic = 'force-dynamic';
