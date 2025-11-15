/**
 * API Route: /api/campaigns/[id]/synthesize
 * POST - Synthesize full script for a campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-config';
import { generateAudio, estimateAudioDuration } from '@/lib/voice/voice-service';
import { SynthesizeScriptRequest } from '@/types/voice';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const campaignId = params.id;

    // Parse request body
    const body: SynthesizeScriptRequest = await request.json();
    const { script, voice_id } = body;

    // Validate input
    if (!script || script.trim().length === 0) {
      return NextResponse.json(
        { error: 'script is required' },
        { status: 400 }
      );
    }

    if (!voice_id) {
      return NextResponse.json(
        { error: 'voice_id is required' },
        { status: 400 }
      );
    }

    // Estimate duration
    const estimatedDuration = estimateAudioDuration(script);

    // Generate audio
    const audioResponse = await generateAudio(script, voice_id);

    // For MVP, return base64 audio
    // In production, you would upload to S3 or similar storage
    // and return a URL instead

    // TODO: Save audio reference to database with campaign
    // await prisma.campaign.update({
    //   where: { id: campaignId },
    //   data: {
    //     voiceId: voice_id,
    //     audioUrl: audioUrl, // or store base64 temporarily
    //     audioDuration: estimatedDuration,
    //   },
    // });

    return NextResponse.json({
      success: true,
      audio_base64: audioResponse.audio,
      contentType: audioResponse.contentType,
      duration: estimatedDuration,
      campaign_id: campaignId,
      message: 'Audio synthesized successfully',
    });
  } catch (error) {
    console.error(`Error in POST /api/campaigns/${params.id}/synthesize:`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to synthesize script',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
