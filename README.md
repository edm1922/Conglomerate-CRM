# Conglomerate Realty CRM

A professional CRM system built with React, TypeScript, Vite, and Supabase.

## Features

- **Lead Management**: Track and manage potential clients
- **Client Management**: Maintain client information and history
- **Inventory Management**: Manage property lots and inventory
- **Payment Tracking**: Record and track payments
- **Calendar & Appointments**: Schedule and manage appointments
- **Reports & Analytics**: Generate business insights
- **Admin Dashboard**: System administration and user management
- **Document Templates**: Manage business documents
- **Task Management**: Assign and track tasks

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI, Tailwind CSS, Shadcn/ui
- **Backend**: Supabase (Database, Authentication, Real-time)
- **State Management**: Zustand, React Query
- **Forms**: React Hook Form, Zod validation
- **Charts**: Recharts
- **Deployment**: Vercel

## Environment Setup

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_ADMIN_EMAIL=edronmaguale635@gmail.com
   ```

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:8080](http://localhost:8080) to view it in the browser.

## Production Build

1. Build the application:
   ```bash
   npm run build
   ```

2. Preview the production build:
   ```bash
   npm run preview
   ```

## Deployment to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel Dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAIL`

## Admin Access

The admin panel is restricted to the email address specified in `VITE_ADMIN_EMAIL`. Only users with this email can:
- Create new users
- Access system administration features
- Manage templates and configurations
- Export/import system data

## Privacy Policy

This application includes a privacy policy that explains how user data is collected, used, and protected. You can view the full privacy policy at `/privacy-policy` in the application or by accessing the [privacy-policy.md](public/privacy-policy.md) file directly.

## Terms of Service

This application includes terms of service that govern your access to and use of our customer relationship management application. You can view the full terms of service at `/terms-of-service` in the application or by accessing the [terms-of-service.md](public/terms-of-service.md) file directly.

## Security Features

- Environment-based configuration
- Role-based access control
- Secure authentication with Supabase
- Protected admin routes
- Security headers configured
- HTTPS enforcement

## Performance Optimizations

- Code splitting and lazy loading
- Optimized bundle sizes
- Production build minification
- CDN-ready static assets

## Support

For technical support or questions, contact the development team.