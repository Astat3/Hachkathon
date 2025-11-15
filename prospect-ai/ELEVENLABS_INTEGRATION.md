# ElevenLabs Voice Synthesis Integration

## Overview
This document describes the ElevenLabs voice synthesis integration for ProspectAI. The integration allows users to select AI voices and generate audio for their calling campaigns.

## Features Implemented

### 1. Core Voice Services
- **ElevenLabs API Client** (`src/lib/voice/elevenlabs-client.ts`)
  - Direct communication with ElevenLabs API v1
  - Voice listing and retrieval
  - Text-to-speech synthesis
  - User info and quota checking
  - Comprehensive error handling

- **Voice Service Layer** (`src/lib/voice/voice-service.ts`)
  - High-level voice operations
  - Audio generation with customizable settings
  - Preview generation with optimized settings
  - Audio duration estimation
  - Voice settings validation

### 2. API Endpoints

#### GET `/api/voices`
- Fetches all available voices from ElevenLabs
- Requires authentication
- Returns sorted list of voices with metadata

#### POST `/api/voices/preview`
- Generates preview audio for a specific voice
- Request body: `{ voice_id: string, text?: string }`
- Returns base64-encoded audio

#### POST `/api/campaigns/[id]/synthesize`
- Synthesizes full script for a campaign
- Request body: `{ script: string, voice_id: string }`
- Returns base64-encoded audio with duration estimate
- TODO: Save audio to storage and update campaign record

### 3. UI Components

#### VoiceCard (`src/components/voice-selector/VoiceCard.tsx`)
- Displays individual voice option
- Shows voice attributes (gender, accent, age, use case)
- Preview button with loading state
- Selection indicator
- Hover effects and responsive design

#### VoicePreview (`src/components/voice-selector/VoicePreview.tsx`)
- Audio player with controls
- Play/pause functionality
- Mute/unmute toggle
- Progress bar with time display
- Loading and error states

#### Voices Page (`src/app/(dashboard)/voices/page.tsx`)
- Main voice selection interface
- Search functionality
- Gender and accent filters
- Grid layout with responsive design
- Preview generation and playback
- Voice selection with save functionality
- Empty states and error handling

### 4. Type Definitions (`src/types/voice.ts`)
- `Voice` - Voice metadata from ElevenLabs
- `VoiceSettings` - Audio generation settings
- `GenerateAudioRequest/Response` - Audio generation types
- `VoicePreviewRequest` - Preview request type
- `SynthesizeScriptRequest/Response` - Script synthesis types

## Setup Instructions

### 1. Install Dependencies
All required dependencies are already in package.json. No additional packages needed.

### 2. Configure Environment Variables
Add your ElevenLabs API key to `.env`:

```bash
ELEVENLABS_API_KEY="your_api_key_here"
```

Get your API key from: https://elevenlabs.io/app/settings/api-keys

### 3. Navigation
The Voices page has been added to the sidebar navigation automatically.

## Usage

### For End Users
1. Navigate to the "Voices" page from the sidebar
2. Browse available voices or use filters to narrow down options
3. Click "Preview Voice" to hear a sample
4. Click on a voice card to select it
5. Click "Save Selection" to apply the voice to your campaign

### For Developers

#### Fetching Voices
```typescript
import { getVoices } from '@/lib/voice/voice-service';

const voices = await getVoices();
```

#### Generating Audio
```typescript
import { generateAudio } from '@/lib/voice/voice-service';

const result = await generateAudio(
  "Your script text here",
  "voice_id_here",
  {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0,
    use_speaker_boost: true,
  }
);

// result.audio contains base64-encoded MP3
// result.contentType is 'audio/mpeg'
```

#### Generating Preview
```typescript
import { generatePreview } from '@/lib/voice/voice-service';

const result = await generatePreview("voice_id_here", "Optional custom text");
```

## API Reference

### Voice Settings
```typescript
interface VoiceSettings {
  stability: number;          // 0-1, voice consistency
  similarity_boost: number;   // 0-1, voice similarity to original
  style?: number;             // 0-1, style exaggeration
  use_speaker_boost?: boolean; // Enhance clarity
}
```

### Default Settings
- **Stability**: 0.5 (balanced)
- **Similarity Boost**: 0.75 (high similarity)
- **Style**: 0 (neutral)
- **Speaker Boost**: true (enabled)

## Error Handling

All API endpoints and services include comprehensive error handling:
- Authentication checks
- API key validation
- Input validation
- ElevenLabs API error propagation
- User-friendly error messages

## Future Enhancements

### Storage Integration
Currently, audio is returned as base64. For production:
1. Upload generated audio to S3 or similar storage
2. Store audio URL in database with campaign
3. Return URL instead of base64 for better performance

### Database Schema Updates
Add to Campaign model:
```prisma
model Campaign {
  // ... existing fields
  voiceId       String?
  audioUrl      String?
  audioDuration Int?      // in seconds
}
```

### Additional Features
- Custom voice cloning
- Voice settings customization UI
- Batch audio generation
- Audio caching
- Usage quota tracking
- Voice favorites/bookmarks
- A/B testing different voices

## Testing

### Manual Testing
1. Ensure ELEVENLABS_API_KEY is set in .env
2. Start the development server: `npm run dev`
3. Navigate to http://localhost:3000/voices
4. Test voice browsing, filtering, and preview generation

### API Testing
```bash
# Get voices
curl -X GET http://localhost:3000/api/voices \
  -H "Cookie: your-session-cookie"

# Generate preview
curl -X POST http://localhost:3000/api/voices/preview \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"voice_id": "21m00Tcm4TlvDq8ikWAM"}'

# Synthesize script
curl -X POST http://localhost:3000/api/campaigns/123/synthesize \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"script": "Hello world", "voice_id": "21m00Tcm4TlvDq8ikWAM"}'
```

## Troubleshooting

### "ElevenLabs API key not configured"
- Ensure ELEVENLABS_API_KEY is set in .env
- Restart the development server after adding the key

### "Failed to fetch voices"
- Check your API key is valid
- Verify you have an active ElevenLabs subscription
- Check network connectivity
- Review server logs for detailed error messages

### Audio not playing
- Check browser console for errors
- Verify base64 audio data is valid
- Ensure browser supports audio/mpeg format
- Try a different browser

## Resources

- [ElevenLabs API Documentation](https://elevenlabs.io/docs/api-reference)
- [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)
- [ElevenLabs Pricing](https://elevenlabs.io/pricing)

## Files Created

### Core Services
- `/src/lib/voice/elevenlabs-client.ts` - ElevenLabs API client
- `/src/lib/voice/voice-service.ts` - Voice service layer

### API Routes
- `/src/app/api/voices/route.ts` - Get voices endpoint
- `/src/app/api/voices/preview/route.ts` - Preview generation endpoint
- `/src/app/api/campaigns/[id]/synthesize/route.ts` - Script synthesis endpoint

### UI Components
- `/src/components/voice-selector/VoiceCard.tsx` - Voice card component
- `/src/components/voice-selector/VoicePreview.tsx` - Audio player component
- `/src/app/(dashboard)/voices/page.tsx` - Voice selection page

### Types
- `/src/types/voice.ts` - TypeScript type definitions

### Documentation
- `/ELEVENLABS_INTEGRATION.md` - This file

### Modified Files
- `/src/components/dashboard/Sidebar.tsx` - Added Voices navigation link

## License
Part of ProspectAI - All rights reserved
