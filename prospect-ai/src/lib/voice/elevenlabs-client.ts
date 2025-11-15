/**
 * ElevenLabs API Client
 * Handles direct communication with ElevenLabs API v1
 */

import { Voice, VoiceSettings } from '@/types/voice';

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

export class ElevenLabsClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required');
    }
  }

  /**
   * Fetch all available voices from ElevenLabs
   */
  async getVoices(): Promise<Voice[]> {
    try {
      const response = await fetch(`${ELEVENLABS_API_BASE}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `ElevenLabs API error: ${response.status} - ${errorData.detail || response.statusText}`
        );
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching voices from ElevenLabs:', error);
      throw error;
    }
  }

  /**
   * Generate audio from text using a specific voice
   */
  async textToSpeech(
    text: string,
    voiceId: string,
    settings?: VoiceSettings
  ): Promise<ArrayBuffer> {
    try {
      const defaultSettings: VoiceSettings = {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0,
        use_speaker_boost: true,
      };

      const voiceSettings = settings || defaultSettings;

      const response = await fetch(
        `${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: voiceSettings,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `ElevenLabs TTS error: ${response.status} - ${errorData.detail || response.statusText}`
        );
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error generating audio with ElevenLabs:', error);
      throw error;
    }
  }

  /**
   * Get details for a specific voice
   */
  async getVoice(voiceId: string): Promise<Voice> {
    try {
      const response = await fetch(`${ELEVENLABS_API_BASE}/voices/${voiceId}`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `ElevenLabs API error: ${response.status} - ${errorData.detail || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching voice details from ElevenLabs:', error);
      throw error;
    }
  }

  /**
   * Get user subscription info (useful for checking quota)
   */
  async getUserInfo(): Promise<any> {
    try {
      const response = await fetch(`${ELEVENLABS_API_BASE}/user`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `ElevenLabs API error: ${response.status} - ${errorData.detail || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user info from ElevenLabs:', error);
      throw error;
    }
  }
}

// Singleton instance
let elevenLabsClient: ElevenLabsClient | null = null;

export function getElevenLabsClient(): ElevenLabsClient {
  if (!elevenLabsClient) {
    elevenLabsClient = new ElevenLabsClient();
  }
  return elevenLabsClient;
}
