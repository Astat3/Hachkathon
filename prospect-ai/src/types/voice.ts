/**
 * Voice types for ElevenLabs integration
 */

export interface Voice {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
  labels?: {
    accent?: string;
    age?: string;
    gender?: string;
    use_case?: string;
    [key: string]: string | undefined;
  };
  preview_url?: string;
  available_for_tiers?: string[];
  settings?: VoiceSettings;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface GenerateAudioRequest {
  text: string;
  voice_id: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
}

export interface GenerateAudioResponse {
  audio: string; // base64 encoded audio
  contentType: string;
}

export interface VoicePreviewRequest {
  voice_id: string;
  text: string;
}

export interface SynthesizeScriptRequest {
  script: string;
  voice_id: string;
  campaign_id: string;
}

export interface SynthesizeScriptResponse {
  audio_url?: string;
  audio_base64?: string;
  duration?: number;
  success: boolean;
  message?: string;
}
