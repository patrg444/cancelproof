# CancelMem

A subscription cancellation tracking and proof management application. Track your subscriptions, manage cancel-by deadlines, and maintain proof of cancellation attempts to prevent unwanted charges.

**Live at: [cancelmem.com](https://cancelmem.com)**

## Features

- **Subscription Tracking**: Add and manage all your recurring subscriptions
- **Cancel-By Deadlines**: Configure cancellation rules (1-day, 3-day, 7-day before renewal, etc.)
- **Proof Management**: Upload screenshots, emails, and confirmation numbers as cancellation proof
- **Action Dashboard**: See urgent deadlines, at-risk charges, and incomplete proofs at a glance
- **Timeline Audit**: Complete history of all subscription events
- **PDF Export**: Generate proof binders for each subscription
- **CSV Export**: Export all subscription data for backup

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/patrg444/cancelproof.git
cd cancelproof

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and configure your API keys:

```bash
cp .env.example .env
```

Required variables:
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (for future payment features)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `SUPABASE_ACCESS_TOKEN` - Supabase access token (for future cloud sync)

### Building for Production

```bash
npm run build
npm run preview  # Preview the production build
```

The built files will be in the `dist/` directory.

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **PDF Export**: jsPDF
- **Storage**: localStorage (client-side)

## License

See [ATTRIBUTIONS.md](ATTRIBUTIONS.md) for third-party licenses.
