# Envo-Pro - Premium Investment Platform

A modern investment platform built with Next.js, Supabase, and TypeScript, featuring automated daily earnings, referral systems, and a premium user experience.

## Features

- 🎨 **Premium UI/UX** - Modern design with animated hero sections and smooth transitions
- 💰 **Automated Daily Earnings** - Automatic calculation and distribution at midnight
- 📊 **Multiple Investment Plans** - Free, Starter, Advanced, and Pro plans
- 👥 **Referral System** - Earn from user referrals
- 🔒 **Secure Authentication** - Powered by Supabase Auth
- 📱 **Fully Responsive** - Works seamlessly on all devices
- 🌙 **Dark Mode Support** - Beautiful dark and light themes

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Deployment**: Vercel
- **Automation**: Vercel Cron Jobs

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/envo-pro.git
cd envo-pro
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_SECRET=your-secure-cron-secret
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Daily Earnings Automation

The platform automatically calculates and distributes daily earnings at midnight (00:00 UTC). This is handled by:

1. **Vercel Cron Jobs** - Configured in `vercel.json`
2. **API Route** - `/api/daily-earnings` endpoint
3. **Supabase Edge Function** - As a backup (optional)

### Setting Up Automation

1. **For Vercel Deployment**:
   - The cron job is automatically configured via `vercel.json`
   - Set the `CRON_SECRET` environment variable in Vercel dashboard
   - The cron will run daily at midnight UTC

2. **For Supabase Edge Functions** (backup):
   - Deploy the function: `supabase functions deploy daily-earnings`
   - The schedule is configured in `supabase/config.toml`

### Testing Daily Earnings

```bash
# Test locally
node scripts/test-daily-earnings.js

# Test with curl
curl -X POST http://localhost:3000/api/daily-earnings \
  -H "Authorization: Bearer your-cron-secret" \
  -H "Content-Type: application/json"
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── admin/             # Admin panel
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── landing/           # Landing page components
│   ├── ui/                # UI components
│   └── ...
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
└── context/              # React context providers
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

### Important Environment Variables

- `CRON_SECRET` - Required for cron job authentication
- `SUPABASE_SERVICE_ROLE_KEY` - Required for admin operations
- All other Supabase keys

## Plan Details

| Plan | Price (PKR) | Daily Return (PKR) | Validity |
|------|-------------|-------------------|----------|
| Free | 0 | 20 | 365 days |
| Starter | 5,000 | 120 | 30 days |
| Advanced | 10,000 | 260 | 60 days |
| Pro | 20,000 | 560 | 90 days |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
