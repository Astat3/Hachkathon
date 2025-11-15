# Twilio Call Placement Integration

## Overview
This document describes the Twilio call placement integration for ProspectAI. The integration allows users to place automated calls to prospects, track call status, and manage campaigns with scheduling and limits.

## Features Implemented

### 1. Core Call Services

#### Twilio Client (`src/lib/calls/twilio-client.ts`)
- Direct communication with Twilio API
- Call placement with TwiML support
- Call status retrieval and updates
- Machine detection (answering machine vs. human)
- Call recording support
- **Simulation mode** for development without Twilio credentials
- TwiML generation for audio playback

#### Call Service (`src/lib/calls/call-service.ts`)
- High-level call management with database integration
- Place calls to prospects
- Track call status and outcomes
- Get call statistics for campaigns
- Update call status from webhooks
- Cancel in-progress calls
- Integration with Campaign and Prospect models

#### Call Scheduler (`src/lib/calls/scheduler.ts`)
- Respect call time windows (e.g., 9 AM - 5 PM)
- Enforce daily call limits
- Schedule calls for campaigns
- Retry failed calls with configurable retry logic
- Get next available call time
- Schedule summary with remaining capacity

### 2. Database Models

#### Campaign Model
```prisma
model Campaign {
  id              String    @id @default(cuid())
  userId          String
  name            String
  scriptId        String?
  voiceId         String?
  audioUrl        String?
  audioDuration   Int?
  status          String    @default("draft")
  dailyCallLimit  Int       @default(50)
  callWindowStart String    @default("09:00")
  callWindowEnd   String    @default("17:00")
  timezone        String    @default("America/New_York")
  metadata        Json?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

#### Prospect Model
```prisma
model Prospect {
  id          String   @id @default(cuid())
  campaignId  String
  firstName   String
  lastName    String
  email       String?
  phone       String
  company     String?
  title       String?
  status      String   @default("pending")
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### Call Model
```prisma
model Call {
  id              String    @id @default(cuid())
  campaignId      String
  prospectId      String
  twilioCallSid   String?   @unique
  fromNumber      String
  toNumber        String
  status          String    @default("queued")
  direction       String    @default("outbound-api")
  duration        Int?
  recordingUrl    String?
  recordingSid    String?
  cost            String?
  errorCode       String?
  errorMessage    String?
  answeredBy      String?
  startedAt       DateTime?
  endedAt         DateTime?
  metadata        Json?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### 3. API Endpoints

#### POST `/api/calls/place`
Place a call to a prospect
- Request body: `{ campaignId, prospectId, scheduledFor? }`
- Respects time windows and daily limits
- Returns call details or error

#### GET `/api/calls`
Get calls with filters
- Query params: `campaignId`, `prospectId`, `status`, `limit`, `offset`
- Returns paginated list of calls

#### GET `/api/calls/[id]`
Get single call details
- Fetches latest status from Twilio if available
- Returns call details

#### POST `/api/webhooks/twilio`
Webhook handler for Twilio status updates
- Receives call status updates from Twilio
- Updates database with call outcomes
- Updates prospect status based on call results

#### GET `/api/campaigns/[id]/stats`
Get call statistics for a campaign
- Returns total calls, completed, failed, costs, etc.
- Includes human vs. machine answer rates

### 4. UI Components

#### CallCard (`src/components/calls/CallCard.tsx`)
- Displays individual call with full details
- Status badges with icons
- Duration, cost, and timestamp display
- Error message display
- Audio player for recordings
- Prospect information

#### CallTable (`src/components/calls/CallTable.tsx`)
- Table view of multiple calls
- Status badges with color coding
- Sortable columns
- Loading and empty states
- Responsive design

#### Campaign Calls Page (`src/app/(dashboard)/campaigns/[id]/calls/page.tsx`)
- View all calls for a campaign
- Statistics dashboard with key metrics
- Call history table
- Refresh functionality
- Real-time status updates

### 5. Type Definitions (`src/types/call.ts`)
- `Call` - Call record with all fields
- `CallStatus` - Call status enum
- `AnsweredBy` - Who answered the call
- `PlaceCallRequest/Response` - API request/response types
- `CallStats` - Campaign statistics
- `CallWindowConfig` - Time window configuration
- `RetryConfig` - Retry configuration

## Setup Instructions

### 1. Install Dependencies
No additional packages needed - uses existing dependencies.

### 2. Configure Environment Variables
Add to `.env`:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_PHONE_NUMBER="+15551234567"

# Application URL (for webhooks)
NEXTAUTH_URL="http://localhost:3000"
```

Get your Twilio credentials from: https://console.twilio.com/

### 3. Update Database Schema
Run Prisma migrations:

```bash
npx prisma migrate dev --name add_calls
npx prisma generate
```

### 4. Configure Twilio Webhooks
In your Twilio console, configure the following webhook URLs:

**Status Callback URL:**
```
https://your-domain.com/api/webhooks/twilio
```

**Recording Status Callback URL:**
```
https://your-domain.com/api/webhooks/twilio/recording
```

For local development, use ngrok:
```bash
ngrok http 3000
# Use the ngrok URL for webhooks
```

## Usage

### For End Users

#### 1. Create a Campaign
- Set up campaign with script and voice
- Configure call window (e.g., 9 AM - 5 PM)
- Set daily call limit
- Add prospects to campaign

#### 2. Place Calls
- Navigate to campaign calls page
- Click "Place Call" for individual prospects
- Or schedule bulk calls for all prospects
- Monitor call status in real-time

#### 3. View Call History
- See all calls with status
- Filter by status, date, prospect
- View call recordings
- Track costs and duration

### For Developers

#### Place a Call
```typescript
import { getCallScheduler } from '@/lib/calls/scheduler';

const scheduler = getCallScheduler();
const result = await scheduler.scheduleCall({
  campaignId: 'campaign_id',
  prospectId: 'prospect_id',
});

if (result.success) {
  console.log('Call placed:', result.scheduledCall);
} else {
  console.error('Error:', result.error);
}
```

#### Get Call Statistics
```typescript
import { getCallService } from '@/lib/calls/call-service';

const callService = getCallService();
const stats = await callService.getCallStats('campaign_id');

console.log('Total calls:', stats.total);
console.log('Completed:', stats.completed);
console.log('Average duration:', stats.averageDuration);
```

#### Schedule Campaign Calls
```typescript
import { getCallScheduler } from '@/lib/calls/scheduler';

const scheduler = getCallScheduler();
const result = await scheduler.scheduleCampaignCalls(
  'campaign_id',
  10 // max calls to place
);

console.log('Scheduled:', result.scheduled);
console.log('Failed:', result.failed);
```

## Call Flow

1. **Call Placement**
   - User initiates call via API or UI
   - Scheduler checks time window and daily limit
   - Call service creates database record
   - Twilio API is called with TwiML
   - Call SID is stored in database

2. **Call Progress**
   - Twilio sends status updates via webhook
   - Webhook handler updates database
   - Status changes: queued → ringing → in-progress → completed
   - Machine detection determines if human or voicemail

3. **Call Completion**
   - Final status update received
   - Duration and cost recorded
   - Recording URL saved (if enabled)
   - Prospect status updated

## Call Statuses

- **queued** - Call is queued for placement
- **ringing** - Phone is ringing
- **in-progress** - Call is active
- **completed** - Call completed successfully
- **failed** - Call failed to connect
- **busy** - Line was busy
- **no-answer** - No one answered
- **canceled** - Call was canceled

## Simulation Mode

When Twilio credentials are not configured, the system runs in **simulation mode**:

- Calls are "placed" but not actually made
- Random statuses are generated for testing
- No actual costs incurred
- Perfect for development and testing

To enable simulation mode, simply don't set Twilio environment variables.

## Cost Tracking

- Each call records the Twilio cost
- Campaign stats show total cost
- Costs are displayed in USD
- Typical cost: $0.01-0.02 per minute

## Machine Detection

The integration uses Twilio's machine detection to identify:
- **human** - A person answered
- **machine_start** - Answering machine detected at start
- **machine_end_beep** - Detected beep
- **machine_end_silence** - Detected silence
- **machine_end_other** - Other machine detection

This helps optimize campaigns by:
- Leaving voicemails only when appropriate
- Tracking human answer rates
- Scheduling retries for voicemail answers

## Time Windows and Limits

### Call Windows
- Configure start and end times (e.g., 9:00 AM - 5:00 PM)
- Specify timezone
- Calls outside window are rejected
- Scheduler calculates next available time

### Daily Limits
- Set maximum calls per day per campaign
- Prevents over-calling
- Tracks calls across all prospects
- Resets at midnight in campaign timezone

## Retry Logic

Configure retry behavior:
```typescript
const retryConfig = {
  maxRetries: 3,
  retryDelay: 60, // minutes
  retryStatuses: ['failed', 'no-answer', 'busy'],
};

const result = await scheduler.retryFailedCalls(campaignId, retryConfig);
```

## Error Handling

All services include comprehensive error handling:
- Twilio API errors are caught and logged
- Database errors are handled gracefully
- User-friendly error messages
- Webhook failures don't crash the system

## Testing

### Manual Testing
1. Set up Twilio credentials in `.env`
2. Start development server: `npm run dev`
3. Create a campaign with prospects
4. Place test calls
5. Monitor webhook updates

### Simulation Testing
1. Remove Twilio credentials from `.env`
2. System automatically enters simulation mode
3. Test all features without making real calls
4. Perfect for development

### API Testing
```bash
# Place a call
curl -X POST http://localhost:3000/api/calls/place \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"campaignId": "xxx", "prospectId": "yyy"}'

# Get calls
curl -X GET "http://localhost:3000/api/calls?campaignId=xxx" \
  -H "Cookie: your-session-cookie"

# Get call stats
curl -X GET http://localhost:3000/api/campaigns/xxx/stats \
  -H "Cookie: your-session-cookie"
```

## Troubleshooting

### "Twilio credentials not configured"
- Ensure all three Twilio env vars are set
- Restart development server after adding credentials
- Check for typos in variable names

### Calls not being placed
- Verify time window settings
- Check daily limit hasn't been reached
- Ensure campaign status is "active"
- Check Twilio account balance

### Webhooks not working
- Verify webhook URL is publicly accessible
- Use ngrok for local development
- Check Twilio webhook logs in console
- Ensure NEXTAUTH_URL is set correctly

### No audio playing
- Verify audioUrl is set on campaign
- Check ElevenLabs integration is working
- Ensure audio file is publicly accessible
- Test TwiML generation

## Future Enhancements

### Planned Features
- Voice interaction with AI responses
- Call transcription
- Sentiment analysis
- A/B testing different scripts
- Advanced scheduling (specific dates/times)
- Call queue management
- Real-time call monitoring dashboard
- SMS follow-up after calls
- Integration with CRM systems

### Database Optimizations
- Add indexes for common queries
- Archive old calls
- Aggregate statistics tables
- Call recording storage optimization

## Resources

- [Twilio API Documentation](https://www.twilio.com/docs/voice/api)
- [TwiML Documentation](https://www.twilio.com/docs/voice/twiml)
- [Twilio Webhooks](https://www.twilio.com/docs/usage/webhooks)
- [Machine Detection](https://www.twilio.com/docs/voice/answering-machine-detection)
- [Twilio Pricing](https://www.twilio.com/voice/pricing)

## Files Created

### Core Services
- `/src/lib/calls/twilio-client.ts` - Twilio API client
- `/src/lib/calls/call-service.ts` - Call service layer
- `/src/lib/calls/scheduler.ts` - Call scheduler

### API Routes
- `/src/app/api/calls/place/route.ts` - Place call endpoint
- `/src/app/api/calls/route.ts` - Get calls endpoint
- `/src/app/api/calls/[id]/route.ts` - Get single call endpoint
- `/src/app/api/webhooks/twilio/route.ts` - Webhook handler
- `/src/app/api/campaigns/[id]/stats/route.ts` - Campaign stats endpoint

### UI Components
- `/src/components/calls/CallCard.tsx` - Call card component
- `/src/components/calls/CallTable.tsx` - Call table component
- `/src/app/(dashboard)/campaigns/[id]/calls/page.tsx` - Campaign calls page

### Types
- `/src/types/call.ts` - TypeScript type definitions

### Database
- `/prisma/schema.prisma` - Updated with Campaign, Prospect, and Call models

### Documentation
- `/TWILIO_INTEGRATION.md` - This file

## License
Part of ProspectAI - All rights reserved
