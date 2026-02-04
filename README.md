# OVH VPS Tracker

Serverless application for monitoring OVH VPS availability, built with Hono and deployed on Cloudflare Workers. It checks the OVH API on a schedule and sends email notifications via Resend when specific plans become available.

## Features

- **Automated Checks**: Runs every 30 minutes via Cron Triggers.
- **Multi-Region**: Monitor multiple datacenters simultaneously (e.g., SGP, BHS, GRA).
- **Instant Alerts**: Email notifications sent via Resend API.
- **Serverless**: Deployed on Cloudflare Workers.
- **Configurable**: Filter by OS availability (Linux/Windows) or Region.

## Prerequisites

- [Bun](https://bun.sh/) or Node.js
- [Cloudflare Account](https://dash.cloudflare.com/)
- [Resend Account](https://resend.com/)

## Setup Guide

### 1. Clone & Install

```bash
git clone https://github.com/yappiverse/ovhtracker.git
cd ovhtracker
bun install
```

### 2. Configure Environment

Rename `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

Set your environment variables in `.env`:

```env
RESEND_API="re_12345678"
EMAIL_RECIPIENT="your@email.com"
EMAIL_SENDER="OVH Tracker <noreply@yourdomain.com>"
OVH_API_BASE_URL="https://ca.api.ovh.com/v1"
OVH_SUBSIDIARY="WE"
NOTIFY_REGIONS="SGP,WAW"
NOTIFY_STATUS_TYPES="linuxStatus,windowsStatus"
```

### 3. Custom Domain & Cron Setup

This project is configured to run on a custom domain and a 30-minute schedule.

**Cron Schedule**:
The worker runs automatically at `:00` and `:30` of every hour (UTC).
Configuration in `wrangler.jsonc`:

```jsonc
"triggers": {
  "crons": ["0,30 * * * *"]
}
```

**Custom Domain**:
To use your own domain (e.g., `ovhtracker.yourdomain.com`), configure it in `wrangler.jsonc`:

```jsonc
"routes": [
  {
    "pattern": "ovhtracker.yourdomain.com",
    "zone_name": "yourdomain.com",
    "custom_domain": true
  }
]
```

_Note: Make sure to add a DNS record for your subdomain in Cloudflare pointing to the worker (Proxied)._

### 4. Deploy

Deploy the worker to Cloudflare:

```bash
bun run deploy
```

### 5. Set Secrets

Production secrets must be set via Wrangler:

```bash
# Email Configuration
bunx wrangler secret put RESEND_API
bunx wrangler secret put EMAIL_RECIPIENT
bunx wrangler secret put EMAIL_SENDER

# OVH Configuration
bunx wrangler secret put OVH_API_BASE_URL
bunx wrangler secret put OVH_SUBSIDIARY

# Notifications
bunx wrangler secret put NOTIFY_REGIONS
bunx wrangler secret put NOTIFY_STATUS_TYPES
```

## Configuration Options

| Variable              | Description                                   | Example       |
| --------------------- | --------------------------------------------- | ------------- |
| `NOTIFY_REGIONS`      | Regions to monitor (comma-separated or "ALL") | `SGP,BHS`     |
| `NOTIFY_STATUS_TYPES` | Status types to check                         | `linuxStatus` |
| `OVH_SUBSIDIARY`      | OVH Subsidiary Code                           | `WE`          |

## Supported Datacenters

- **SGP**: Singapore
- **BHS**: Beauharnois (Canada)
- **GRA**: Gravelines (France)
- **SBG**: Strasbourg (France)
- **DE**: Frankfurt (Germany)
- **WAW**: Warsaw (Poland)
- **UK**: London (UK)
- **EU-SOUTH-MIL**: Milan (Italy)
- **SYD**: Sydney (Australia)

## Development

Run locally:

```bash
bun run dev
```

Test cron manually:

```bash
curl "http://localhost:8787/__scheduled?cron=0,30+*+*+*+*"
```
