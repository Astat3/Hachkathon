# ProspectAI - Complete Setup Guide

## 🎉 Project Status: FULLY IMPLEMENTED

All core features have been implemented and are ready for testing!

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **PostgreSQL** database (local or hosted)
- **API Keys** for:
  - OpenAI (for script generation)
  - ElevenLabs (for voice synthesis)
  - Twilio (for call placement) - optional for MVP

---

## 🚀 Quick Start (5 Steps)

### Step 1: Install Dependencies

```bash
cd /Users/adamgallot/Hachkathon/prospect-ai
npm install
```

### Step 2: Configure Environment Variables

Create `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
# Database (required)
DATABASE_URL="postgresql://user:password@localhost:5432/prospectai"

# Authentication (required)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"

# AI Services (required - choose one)
OPENAI_API_KEY="sk-..."

# Voice Synthesis (required)
ELEVENLABS_API_KEY="..."

# Call Placement (optional for MVP - has simulation mode)
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1234567890"
```

### Step 3: Set Up Database

```bash
# Initialize Prisma and create database
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### Step 4: Start Development Server

```bash
npm run dev
```

### Step 5: Access the Application

Open your browser and navigate to:
- **Homepage:** http://localhost:3000
- **Login:** http://localhost:3000/login
- **Register:** http://localhost:3000/register

---

## 🎯 Complete User Flow

### 1. **User Registration & Login**
- Navigate to `/register`
- Create account with email and password
- Login at `/login`

### 2. **Company Onboarding** (4 Steps)
- Navigate to `/onboarding`
- **Step 1:** Enter company information
- **Step 2:** Define target market
- **Step 3:** Provide knowledge source (PDF/URL/Text)
- **Step 4:** Review and submit

### 3. **AI Script Generation**
- Navigate to `/scripts`
- Click "Generate New Script"
- AI generates prospecting script based on your company data
- Review generated script

### 4. **Script Editing & Approval**
- Click on a script to edit
- Modify script content as needed
- **MANDATORY:** Check approval box and approve script
- Cannot proceed without approval

### 5. **Voice Selection**
- Navigate to `/voices`
- Browse available ElevenLabs voices
- Listen to voice samples
- Generate preview with your script
- Select preferred voice

### 6. **Campaign Creation**
- Navigate to `/campaigns`
- Click "Create New Campaign"
- Configure campaign:
  - Name
  - Select approved script
  - Select voice
  - Set daily call limit
  - Define time windows
  - Choose active days
  - Set max attempts per prospect

### 7. **Prospect Identification**
- Open campaign detail page
- Navigate to "Prospects" tab
- Click "Identify Prospects"
- System generates 50-200 mock prospects based on target market

### 8. **Launch Campaign**
- Return to campaign detail page
- Click "Launch Campaign"
- Campaign status changes to "Active"
- Calls will be placed according to schedule

### 9. **Monitor Calls**
- Navigate to "Calls" tab in campaign
- View call history and status
- Listen to call recordings (if enabled)
- Track call outcomes

### 10. **View Analytics**
- Navigate to `/analytics`
- View overall statistics
- Analyze call performance
- Compare campaigns
- Export data to CSV

---

## 📁 Project Structure

```
prospect-ai/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── (auth)/           # Authentication pages
│   │   ├── (dashboard)/      # Protected dashboard pages
│   │   └── api/              # API routes
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI components
│   │   ├── auth/            # Auth components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── onboarding/      # Onboarding components
│   │   ├── scripts/         # Script components
│   │   ├── voice-selector/  # Voice components
│   │   ├── campaigns/       # Campaign components
│   │   ├── prospects/       # Prospect components
│   │   ├── calls/           # Call components
│   │   └── analytics/       # Analytics components
│   ├── lib/
│   │   ├── auth/            # Authentication utilities
│   │   ├── ai/              # AI integration (OpenAI)
│   │   ├── voice/           # Voice synthesis (ElevenLabs)
│   │   ├── calls/           # Call placement (Twilio)
│   │   ├── prospects/       # Prospect identification
│   │   └── analytics/       # Analytics calculations
│   └── types/               # TypeScript type definitions
├── .env                      # Environment variables (not in git)
├── .env.example             # Environment template
├── package.json             # Dependencies
└── README.md                # Project overview
```

---

## 🔑 API Keys Setup

### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Add to `.env` as `OPENAI_API_KEY`

### ElevenLabs API Key
1. Go to https://elevenlabs.io/
2. Sign up for account
3. Navigate to Profile → API Keys
4. Copy API key
5. Add to `.env` as `ELEVENLABS_API_KEY`

### Twilio Credentials (Optional)
1. Go to https://www.twilio.com/
2. Sign up for account (free trial available)
3. Get Account SID and Auth Token from console
4. Purchase a phone number
5. Add credentials to `.env`

**Note:** Twilio integration has simulation mode, so you can test without credentials.

---

## 🧪 Testing the Application

### Manual Testing Checklist

- [ ] User can register and login
- [ ] User can complete onboarding (all 4 steps)
- [ ] PDF upload extracts text correctly
- [ ] URL scraping works
- [ ] Text input is saved
- [ ] AI generates script based on company data
- [ ] User can edit script
- [ ] Script approval workflow works (mandatory checkbox)
- [ ] Voice selection page loads voices
- [ ] Voice preview generates audio
- [ ] Campaign can be created
- [ ] Campaign configuration is saved
- [ ] Prospects are generated based on target market
- [ ] Campaign can be launched
- [ ] Calls are logged (simulated or real)
- [ ] Analytics dashboard displays data
- [ ] CSV export works

### Running Tests

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production (checks for errors)
npm run build
```

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres

# Reset database
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate
```

### API Key Issues
```bash
# Verify environment variables are loaded
node -e "console.log(process.env.OPENAI_API_KEY)"

# Restart dev server after changing .env
npm run dev
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

## 📚 Additional Documentation

- **BLACKBOX.md** - Complete project context and architecture
- **ELEVENLABS_INTEGRATION.md** - ElevenLabs integration details
- **TWILIO_INTEGRATION.md** - Twilio integration details
- **AUTH_SETUP.md** - Authentication system details

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Database Hosting

Recommended options:
- **Supabase** (PostgreSQL) - Free tier available
- **Neon** (PostgreSQL) - Free tier available
- **Railway** (PostgreSQL) - Free tier available

Update `DATABASE_URL` in Vercel environment variables.

---

## 🎉 You're Ready!

The ProspectAI platform is fully implemented and ready for testing. Follow the user flow above to test all features.

For questions or issues, refer to the documentation files or check the code comments.

**Happy prospecting! 📞**
