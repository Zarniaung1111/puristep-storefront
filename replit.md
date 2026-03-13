# PuriStep

A professional, mobile-friendly dark-themed landing page for a Myanmar-based digital subscription reseller.

## Overview

Sells AI tools (ChatGPT, Gemini, Claude, Canva, Kling AI, Leonardo AI), CapCut, Music & Streaming (Netflix, YouTube, Spotify, Apple Music), Telegram Premium, and VPN. Customers pay via KBZPay, WavePay, AYAPay, UABPay, or Binance and submit orders through a checkout modal.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js (Node.js)
- **Primary DB**: PostgreSQL (via Drizzle ORM)
- **Cloud Auth + Order History DB**: Supabase (magic link auth, orders table)
- **Routing**: wouter
- **State management**: TanStack Query v5

## Pages

- `/` — Landing page with hero, product cards/accordions, testimonials, how-to-order, payment info
- `/admin` — Admin dashboard to view and manage all orders

## Key Features

1. **Supabase Magic Link Auth**: Sign In button in navbar; email OTP (no password); user dropdown with My Orders + Sign Out
2. **Protected Checkout**: Buy Now buttons redirect to Sign In modal if user is not authenticated
3. **Dynamic Payment Info Box**: After selecting payment method, shows correct receiver phone/UID with a copy button
4. **Order ID System**: Unique `PS-XXXXXX` ID generated on modal open; shown on success screen; sent to Telegram
5. **5 Payment Methods**: KBZPay, WavePay, AYAPay, UABPay, Binance with correct receiver details per method
6. **Telegram Notifications**: Bot sends order notification via `sendPhoto` (with screenshot) or `sendMessage`
7. **My Orders**: Logged-in users can view their order history fetched live from Supabase
8. **Category Filter**: AI Tools, Editing Software, Music & Streaming, Telegram Premium, VPN
9. **AI Accordion**: Expandable per-app plan selector for ChatGPT, Gemini, Claude, Canva, Kling AI, Perplexity Pro, Leonardo AI
10. **Editing Software Accordion**: CapCut (Pro Monthly, Pro Annual) nested inside the Editing Software category
11. **Music Accordion**: Netflix, YouTube, Spotify, Apple Music plans
12. **Admin Dashboard**: View orders, update status, see payment screenshots

## Database Schema

### PostgreSQL (Drizzle ORM)
- `orders`: id, orderId, productName, planName, price, contactPlatform, contactUsername, paymentMethod, paymentScreenshot, status, createdAt

### Supabase
- `orders`: id, order_id, product_name, price, user_id, created_at

## API Routes

- `GET /api/config` — Returns Supabase URL + anon key for frontend initialization
- `POST /api/checkout` — Submit order (saves to PostgreSQL + sends Telegram notification)
- `POST /api/orders` — Submit order (PostgreSQL only)
- `GET /api/orders` — Fetch all orders (admin)
- `PATCH /api/orders/:id/status` — Update order status

## Auth Flow

1. User clicks "Sign In" in navbar → Sign In modal opens
2. User enters email → Supabase sends magic link via email
3. User clicks link → redirected back, session is established
4. Navbar switches to user dropdown (avatar + email)
5. Buy Now buttons check auth → if not signed in, redirect to Sign In modal

## Payment Receivers

- **KBZPay & UABPay**: Phone 09892246556, Name AungNaingOo
- **WavePay & AYAPay**: Phone 09963707270, Name Zarni Aung
- **Binance**: UID 979804957, Name Zarni Aung

## Environment Variables

- `TELEGRAM_BOT_TOKEN` — Telegram bot token
- `TELEGRAM_CHAT_ID` — Chat/channel ID for notifications
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `DATABASE_URL` — PostgreSQL connection string

## Design

- Dark background: `#05050f`, forced dark mode via `class="dark"` on `<html>`
- Primary accent: violet/purple + cyan/teal neon
- Glassmorphism cards with `backdrop-blur` and neon border glows
- CSS animations: `fadeInUp`, `glowPulse`
- Category neon colors: fuchsia=AI, amber=Editing Software, pink=Music, cyan=Telegram, emerald=VPN
