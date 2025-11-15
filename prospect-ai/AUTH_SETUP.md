# ProspectAI Authentication System

Complete NextAuth.js authentication implementation with Prisma, credentials provider, and form validation.

## Files Created

### 1. Core Authentication Configuration

#### `/src/lib/auth/auth-config.ts`
- NextAuth configuration with Prisma adapter
- Credentials provider setup
- JWT session strategy
- Custom callbacks for session and JWT
- Password verification integration

#### `/src/lib/auth/auth-utils.ts`
- `hashPassword()` - Hash passwords using bcryptjs (12 salt rounds)
- `verifyPassword()` - Verify passwords against hashes
- `getServerSession()` - Wrapper for NextAuth's getServerSession
- `isAuthenticated()` - Check if user is authenticated
- `getCurrentUser()` - Get current user from session

### 2. API Routes

#### `/src/app/api/auth/[...nextauth]/route.ts`
- NextAuth API route handler
- Handles all authentication endpoints (signin, signout, session, etc.)

#### `/src/app/api/auth/register/route.ts`
- User registration endpoint
- Zod validation for input
- Duplicate email checking
- Password hashing
- Returns created user (without password)

### 3. Pages

#### `/src/app/(auth)/login/page.tsx`
- Login page with metadata
- Renders LoginForm component
- Link to registration page

#### `/src/app/(auth)/register/page.tsx`
- Registration page with metadata
- Renders RegisterForm component
- Link to login page

#### `/src/app/(auth)/layout.tsx`
- Centered authentication layout
- Gradient background (blue to indigo)
- White card container with shadow
- No sidebar or navigation

### 4. Components

#### `/src/components/auth/LoginForm.tsx`
- Client-side login form
- React Hook Form with Zod validation
- Email and password fields
- Loading states
- Error handling and display
- Auto-redirect on success

#### `/src/components/auth/RegisterForm.tsx`
- Client-side registration form
- React Hook Form with Zod validation
- Name, email, password, and confirm password fields
- Password strength requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- Password confirmation matching
- Loading states
- Error handling and display
- Auto-login after successful registration

### 5. Database Schema

#### `/prisma/schema.prisma`
- User model with id, name, email, password, timestamps
- Account model for OAuth providers (NextAuth requirement)
- Session model for database sessions
- VerificationToken model for email verification
- Proper relations and indexes

### 6. Type Definitions

#### `/src/types/next-auth.d.ts`
- TypeScript declarations for NextAuth
- Extended Session interface with user id
- Extended User interface
- Extended JWT interface

### 7. Environment Configuration

#### `/.env.example`
- Template for required environment variables
- DATABASE_URL for Prisma
- NEXTAUTH_URL for NextAuth
- NEXTAUTH_SECRET for JWT signing

## Setup Instructions

### 1. Install Dependencies
All required dependencies are already in package.json:
- next-auth
- @auth/prisma-adapter
- @prisma/client
- bcryptjs
- react-hook-form
- @hookform/resolvers
- zod

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and set:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/prospectai"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3. Setup Database
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 4. Run Development Server
```bash
npm run dev
```

Visit:
- Login: http://localhost:3000/login
- Register: http://localhost:3000/register

## Features

### Security
- Passwords hashed with bcryptjs (12 salt rounds)
- JWT-based sessions (30-day expiry)
- CSRF protection (built into NextAuth)
- Secure password requirements enforced

### Validation
- Client-side validation with Zod
- Server-side validation on registration
- Email format validation
- Password strength requirements
- Duplicate email prevention

### User Experience
- Loading states during authentication
- Clear error messages
- Auto-redirect after login/registration
- Form field validation feedback
- Responsive design with Tailwind CSS

### Developer Experience
- Full TypeScript support
- Type-safe session access
- Reusable utility functions
- Clean separation of concerns
- Easy to extend with OAuth providers

## Usage Examples

### Protecting Pages (Server Component)
```typescript
import { getServerSession } from "@/lib/auth/auth-utils";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }
  
  return <div>Welcome {session.user.name}!</div>;
}
```

### Protecting API Routes
```typescript
import { getServerSession } from "@/lib/auth/auth-utils";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Your protected logic here
}
```

### Client-Side Session Access
```typescript
"use client";
import { useSession } from "next-auth/react";

export default function ClientComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;
  
  return <div>Hello {session.user.name}!</div>;
}
```

### Sign Out
```typescript
"use client";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/login" })}>
      Sign Out
    </button>
  );
}
```

## Next Steps

1. **Add OAuth Providers** (Google, GitHub, etc.)
   - Add provider to `auth-config.ts`
   - Configure OAuth app credentials
   - Add provider buttons to login/register forms

2. **Email Verification**
   - Implement email sending service
   - Add verification token generation
   - Create verification page

3. **Password Reset**
   - Create forgot password page
   - Implement reset token generation
   - Add reset password page

4. **Session Management**
   - Add "Remember Me" functionality
   - Implement session refresh
   - Add device management

5. **User Profile**
   - Create profile page
   - Add profile update functionality
   - Implement avatar upload

## Troubleshooting

### "Prisma Client not found"
```bash
npx prisma generate
```

### "Database connection error"
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Verify database exists

### "NEXTAUTH_SECRET is not set"
- Add NEXTAUTH_SECRET to .env
- Generate with: `openssl rand -base64 32`

### "Session not persisting"
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies
- Verify JWT secret is set

## File Structure
```
prospect-ai/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   └── api/
│   │       └── auth/
│   │           ├── [...nextauth]/
│   │           │   └── route.ts
│   │           └── register/
│   │               └── route.ts
│   ├── components/
│   │   └── auth/
│   │       ├── LoginForm.tsx
│   │       └── RegisterForm.tsx
│   ├── lib/
│   │   └── auth/
│   │       ├── auth-config.ts
│   │       └── auth-utils.ts
│   └── types/
│       └── next-auth.d.ts
├── .env.example
└── AUTH_SETUP.md
```
