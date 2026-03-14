# PuriStep

A professional, mobile-friendly dark-themed landing page for a Myanmar-based digital subscription reseller.

## Overview

Sells AI tools (ChatGPT, Gemini, Claude, Canva, Kling AI, Perplexity Pro, Leonardo AI), Editing Software (CapCut, Adobe Creative Cloud), Music & Streaming (Netflix, YouTube, Spotify, Apple Music), Telegram Premium, and VPN. Customers pay via KBZPay, WavePay, AYAPay, UABPay, or Binance and submit orders through a checkout modal.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js (Node.js)
- **Primary DB**: PostgreSQL (via Drizzle ORM)
- **Routing**: wouter
- **State management**: TanStack Query v5

## Pages

- `/` — Landing page with hero, product cards/accordions, testimonials, how-to-order, payment info
- `/admin` — Admin dashboard to view and manage all orders

## Key Features

1. **Open Checkout**: Buy Now / Select Plan buttons open the checkout modal directly — no login required
2. **Dynamic Payment Info Box**: After selecting payment method, shows correct receiver phone/UID with a copy button
3. **Order ID System**: Unique `PS-XXXXXX` ID generated on modal open; shown on success screen; sent to Telegram
4. **5 Payment Methods**: KBZPay, WavePay, AYAPay, UABPay, Binance with correct receiver details per method
5. **Telegram Notifications**: Bot sends order notification via `sendPhoto` (with screenshot) or `sendMessage`
6. **Category Filter**: AI Tools, Editing Software, Music & Streaming, Telegram Premium, VPN
7. **AI Accordion**: Expandable per-app plan selector for ChatGPT, Gemini, Claude, Canva, Kling AI, Perplexity Pro, Leonardo AI
8. **Editing Software Accordion**: CapCut (3 plans) + Adobe Creative Cloud (2 plans)
9. **Music Accordion**: Netflix, YouTube, Spotify (custom modal with Individual/Family tabs), Apple Music
10. **Admin Dashboard**: View orders, update status, see payment screenshots

## Database Schema

### PostgreSQL (Drizzle ORM)
- `orders`: id, orderId, productName, planName, price, contactPlatform, contactUsername, paymentMethod, paymentScreenshot, status, createdAt

## API Routes

- `POST /api/checkout` — Submit order (saves to PostgreSQL + sends Telegram notification)
- `GET /api/orders` — Fetch all orders (admin)
- `PATCH /api/orders/:id/status` — Update order status

## Payment Receivers

- **KBZPay & UABPay**: Phone 09892246556, Name AungNaingOo
- **WavePay & AYAPay**: Phone 09963707270, Name Zarni Aung
- **Binance**: UID 979804957, Name Zarni Aung

## Environment Variables

- `TELEGRAM_BOT_TOKEN` — Telegram bot token
- `TELEGRAM_CHAT_ID` — Chat/channel ID for notifications
- `DATABASE_URL` — PostgreSQL connection string

## Design

- Dark background: `#05050f`, forced dark mode via `class="dark"` on `<html>`
- Primary accent: violet/purple + cyan/teal neon
- Glassmorphism cards with `backdrop-blur` and neon border glows
- CSS animations: `fadeInUp`, `glowPulse`
- Category neon colors: fuchsia=AI, amber=Editing Software, pink=Music, cyan=Telegram, emerald=VPN
