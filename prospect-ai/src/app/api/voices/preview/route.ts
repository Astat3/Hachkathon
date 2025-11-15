/**
 * API Route: /api/voices/preview
 * POST - Generate a preview audio sample for a voice
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { generatePreview } from '@/lib/voice/voice-service';
import { VoicePreviewRequest } from '@/types/voice';

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body: VoicePreviewRequest = await request.json();
    const { voice_id, text } = body;

    // Validate input
    if (!voice_id) {
      return NextResponse.json(
        { error: 'voice_id is required' },
        { status: 400 }
      );
    }

    // Generate preview
    const audioResponse = await generatePreview(voice_id, text);

    return NextResponse.json({
      success: true,
      audio: audioResponse.audio,
      contentType: audioResponse.contentType,
    });
  } catch (error) {
    console.error('Error in POST /api/voices/preview:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate preview',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
