# Quick Commerce (RushNow)

This project is an original implementation inspired by Blinkit's quick commerce layout. It does **not** copy proprietary code or assets.

## Features

- Next.js App Router + TypeScript
- Tailwind CSS styling
- Responsive navbar, category carousel, product grid
- Product detail pages
- Search with API route filtering
- Persistent cart (localStorage) + sidebar + cart page
- Mock categories & products with remote Unsplash images
- **User Authentication with NextAuth.js**
- **Google OAuth Login**
- **Email/Password Login & Signup**

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Authentication Setup

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Set application type to "Web application"
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Demo Credentials

For testing email/password login, use:
- Email: `demo@rushnow.com`
- Password: `demo123`

## Project Structure

```
src/app        # Pages & layout
src/components # UI components
src/context    # Cart context/provider
src/lib        # Mock data & types
public/images  # (Optional) local placeholder images
```

## Customization

- Add real products in `src/lib/data.ts`.
- Replace remote images with your own optimized CDN or local images (update `next.config.mjs`).
- Extend cart with discount codes, delivery slots, etc.

## Disclaimer

Blinkit is a trademark of its respective owner; this project is for educational purposes only.
