# Simple Vercel Deployment Guide

## Quick Setup

### 1. Environment Variables (Required)
In Vercel dashboard, add these 3 environment variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://lbyetugkkpjmhyjmkvwm.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxieWV0dWdra3BqbWh5am1rdndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NTc0MjgsImV4cCI6MjA3MzEzMzQyOH0.YruwhpGWoK8wx6YMS5dYlf8ODukojKaOaIOMhy7yPpg` |
| `VITE_ADMIN_EMAIL` | `edronmaguale635@gmail.com` |

### 2. Deploy
Just click **Deploy** in Vercel!

### 3. Access
- **Admin**: Login with `edronmaguale635@gmail.com`
- **Users**: Any other email you create

## That's it! 🚀

Vercel auto-detects:
- ✅ Vite framework
- ✅ Build command (`npm run build`)
- ✅ Output directory (`dist`)
- ✅ Install command (`npm install`)

No additional configuration needed.