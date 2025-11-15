/**
 * API Route: /api/voices
 * GET - Fetch all available voices from ElevenLabs
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { getVoices } from '@/lib/voice/voice-service';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if ElevenLabs API key is configured
    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    // Fetch voices
    const voices = await getVoices();

    return NextResponse.json({
      success: true,
      voices,
      count: voices.length,
    });
  } catch (error) {
    console.error('Error in GET /api/voices:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch voices',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
