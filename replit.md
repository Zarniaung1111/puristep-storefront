# Digital Packs Vol 2

A professional, mobile-friendly landing page for a digital subscription reseller business operating in Myanmar.

## Overview

Sells digital subscriptions including Netflix, YouTube Premium, and Canva Pro. Customers pay via KBZPay or WavePay and submit orders through a form with their Telegram/Messenger contact info.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js (Node.js)
- **Database**: PostgreSQL (via Drizzle ORM)
- **Routing**: wouter
- **State management**: TanStack Query v5

## Pages

- `/` — Landing page with hero, product cards, how-to-order section, and payment info
- `/admin` — Admin dashboard to view and manage all orders

## Key Features

1. **Product Cards**: Netflix (Monthly/Private), YouTube Premium (Family/Individual), Canva Pro
2. **Order Form**: Opens in a dialog on "Buy Now" — collects Telegram/Messenger username and payment screenshot (base64 stored in DB)
3. **Payment Support**: KBZPay and WavePay
4. **Order Storage**: All orders saved to PostgreSQL with status tracking (pending/confirmed/cancelled)
5. **Admin Dashboard**: View orders, update status, see payment screenshots

## Database Schema

- `orders` table: id, productName, planName, price, contactPlatform, contactUsername, paymentMethod, paymentScreenshot, status, createdAt

## API Routes

- `POST /api/orders` — Submit a new order
- `GET /api/orders` — Fetch all orders (admin)
- `PATCH /api/orders/:id/status` — Update order status

## Design

- Dark theme forced via `class="dark"` on `<html>`
- Primary accent color: violet/purple (`262 83% 58%`)
- Custom background: `#080810`
- Mobile-first responsive layout
