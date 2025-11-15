# ProspectAI - Automated Telephone Prospecting Platform

> **🎉 Status: FULLY IMPLEMENTED - Ready for Hackathon Demo**

ProspectAI is a complete web platform that automates telephone prospecting using AI-powered voice calls with personalized scripts. Built for the hackathon, this MVP includes all core features from onboarding to analytics.

---

## 🌟 Features

### ✅ Implemented Features

1. **User Authentication**
   - Email/password registration and login
   - Secure session management with NextAuth.js
   - Protected routes and API endpoints

2. **Company Onboarding (4-Step Wizard)**
   - Company information collection
   - Target market definition
   - Knowledge source input (PDF upload, URL scraping, or text prompt)
   - Review and confirmation

3. **AI Script Generation**
   - OpenAI GPT-4 integration
   - Generates personalized prospecting scripts
   - Based on company data, target market, and knowledge source
   - 60-90 second professional scripts

4. **Script Editor & Approval**
   - Edit generated scripts
   - Real-time character count
   - **Mandatory approval workflow** before proceeding
   - Version tracking

5. **Voice Selection (ElevenLabs)**
   - Browse 25+ professional voices
   - Listen to voice samples
   - Generate preview with your script
   - Select voice for campaigns

6. **Campaign Management**
   - Create and configure campaigns
   - Set daily call limits
   - Define time windows
   - Choose active days
   - Launch/pause/resume campaigns

7. **Prospect Identification**
   - AI-powered prospect generation (mock data for MVP)
   - 50-200 prospects per campaign
   - Filtered by target market criteria
   - Status tracking (pending, contacted, interested, converted)

8. **Call Placement (Twilio)**
   - Automated call placement
   - Play synthesized audio
   - Track call status and outcomes
   - Call recordings (optional)
   - Simulation mode for testing

9. **Analytics Dashboard**
   - Overview statistics
   - Call performance charts
   - Campaign comparison
   - Call history table
   - CSV export

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **AI:** OpenAI GPT-4
- **Voice:** ElevenLabs API
- **Calls:** Twilio API
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Deployment:** Vercel-ready

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- API keys (OpenAI, ElevenLabs, Twilio)

### Installation

```bash
# Clone the repository
cd /Users/adamgallot/Hachkathon/prospect-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Set up database
npx prisma migrate dev --name init
npx prisma generate

# Start development server
npm run dev
```

Open http://localhost:3000 to see the application.

---

## 📖 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions
- **[BLACKBOX.md](./BLACKBOX.md)** - Full project context and architecture
- **[ELEVENLABS_INTEGRATION.md](./ELEVENLABS_INTEGRATION.md)** - Voice synthesis details
- **[TWILIO_INTEGRATION.md](./TWILIO_INTEGRATION.md)** - Call placement details

---

## 🎯 User Flow

1. **Register/Login** → Create account
2. **Onboarding** → Provide company info and target market
3. **Generate Script** → AI creates personalized script
4. **Edit & Approve** → Review and approve script
5. **Select Voice** → Choose voice for calls
6. **Create Campaign** → Configure campaign parameters
7. **Identify Prospects** → Generate prospect list
8. **Launch Campaign** → Start automated calls
9. **Monitor & Analyze** → Track performance

---

## 📁 Project Structure

```
prospect-ai/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/          # Auth pages
│   │   ├── (dashboard)/     # Dashboard pages
│   │   └── api/             # API routes
│   ├── components/          # React components
│   ├── lib/                 # Utilities and services
│   └── types/               # TypeScript types
├── prisma/
│   └── schema.prisma        # Database schema
├── .env.example             # Environment template
└── package.json             # Dependencies
```

---

## 🔑 Environment Variables

Required environment variables:

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl"
OPENAI_API_KEY="sk-..."
ELEVENLABS_API_KEY="..."
TWILIO_ACCOUNT_SID="..."      # Optional (has simulation mode)
TWILIO_AUTH_TOKEN="..."       # Optional
TWILIO_PHONE_NUMBER="+1..."   # Optional
```

---

## 🧪 Testing

### Manual Testing

Follow the user flow in SETUP_GUIDE.md to test all features.

### Automated Testing

```bash
npm run type-check    # TypeScript type checking
npm run lint          # ESLint
npm run build         # Production build test
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Database Hosting

- Supabase (PostgreSQL)
- Neon (PostgreSQL)
- Railway (PostgreSQL)

---

## 📊 Database Schema

### Main Models

- **User** - User accounts
- **Company** - Company profiles
- **Campaign** - Prospecting campaigns
- **Script** - Generated scripts
- **Prospect** - Identified prospects
- **Call** - Call records
- **Session** - Auth sessions

See `prisma/schema.prisma` for complete schema.

---

## 🎨 UI Components

### Reusable Components

- Button, Input, Label, Card, Badge
- Select, Textarea, Dialog, Checkbox
- Progress, Table, Charts

All components are fully typed and accessible.

---

## 🔐 Security

- Password hashing with bcryptjs
- JWT-based sessions
- Protected API routes
- Input validation with Zod
- SQL injection prevention (Prisma)
- CSRF protection (NextAuth)

---

## 📈 Performance

- Server-side rendering (SSR)
- Static generation where possible
- Optimized images
- Code splitting
- Lazy loading

---

## 🤝 Contributing

This is a hackathon project. For questions or suggestions, please refer to the documentation.

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- OpenAI for GPT-4 API
- ElevenLabs for voice synthesis
- Twilio for call placement
- All open-source contributors

---

## 📞 Support

For issues or questions:
1. Check SETUP_GUIDE.md
2. Review BLACKBOX.md
3. Check code comments
4. Review API documentation

---

**Built with ❤️ for the Hackathon**

**Status:** ✅ Production-ready MVP
**Last Updated:** November 14, 2025
