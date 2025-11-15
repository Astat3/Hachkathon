/**
 * Voice Service
 * High-level service for voice operations
 */

import { getElevenLabsClient } from './elevenlabs-client';
import { Voice, VoiceSettings, GenerateAudioResponse } from '@/types/voice';

/**
 * Get all available voices
 */
export async function getVoices(): Promise<Voice[]> {
  try {
    const client = getElevenLabsClient();
    const voices = await client.getVoices();
    
    // Sort voices by name for better UX
    return voices.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error in getVoices service:', error);
    throw new Error('Failed to fetch voices');
  }
}

/**
 * Generate audio from text
 */
export async function generateAudio(
  text: string,
  voiceId: string,
  settings?: VoiceSettings
): Promise<GenerateAudioResponse> {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('Text is required for audio generation');
    }

    if (!voiceId) {
      throw new Error('Voice ID is required for audio generation');
    }

    const client = getElevenLabsClient();
    const audioBuffer = await client.textToSpeech(text, voiceId, settings);
    
    // Convert ArrayBuffer to base64
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    
    return {
      audio: base64Audio,
      contentType: 'audio/mpeg',
    };
  } catch (error) {
    console.error('Error in generateAudio service:', error);
    throw new Error('Failed to generate audio');
  }
}

/**
 * Generate a preview audio sample
 * Uses a shorter text snippet for quick previews
 */
export async function generatePreview(
  voiceId: string,
  text?: string
): Promise<GenerateAudioResponse> {
  try {
    // Default preview text if none provided
    const previewText = text || 
      "Hello! I'm calling to discuss an exciting opportunity that could benefit your business. " +
      "I'd love to share some details with you.";

    // Use optimized settings for previews
    const previewSettings: VoiceSettings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0,
      use_speaker_boost: true,
    };

    return await generateAudio(previewText, voiceId, previewSettings);
  } catch (error) {
    console.error('Error in generatePreview service:', error);
    throw new Error('Failed to generate preview');
  }
}

/**
 * Get a specific voice by ID
 */
export async function getVoiceById(voiceId: string): Promise<Voice> {
  try {
    const client = getElevenLabsClient();
    return await client.getVoice(voiceId);
  } catch (error) {
    console.error('Error in getVoiceById service:', error);
    throw new Error('Failed to fetch voice details');
  }
}

/**
 * Validate voice settings
 */
export function validateVoiceSettings(settings: Partial<VoiceSettings>): VoiceSettings {
  return {
    stability: Math.max(0, Math.min(1, settings.stability ?? 0.5)),
    similarity_boost: Math.max(0, Math.min(1, settings.similarity_boost ?? 0.75)),
    style: Math.max(0, Math.min(1, settings.style ?? 0)),
    use_speaker_boost: settings.use_speaker_boost ?? true,
  };
}

/**
 * Estimate audio duration based on text length
 * Rough estimate: ~150 words per minute
 */
export function estimateAudioDuration(text: string): number {
  const words = text.trim().split(/\s+/).length;
  const minutes = words / 150;
  return Math.ceil(minutes * 60); // Return seconds
}
