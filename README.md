# Smart Bookmark App

A modern bookmarking application built with Next.js, TypeScript, and Supabase. Users can authenticate via OAuth, save bookmarks, and manage their collection with an intuitive interface.

## 🚀 Features

- **OAuth Authentication** - Secure login via social providers
- **Bookmark Management** - Create, view, and organize bookmarks
- **Responsive Design** - Works seamlessly across all devices
- **Real-time Updates** - Instant feedback on bookmark operations
- **TypeScript Support** - Full type safety throughout the application

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org) - React framework with API routes
- **Language**: TypeScript - Type-safe development
- **Database & Auth**: [Supabase](https://supabase.com) - PostgreSQL with authentication
- **Styling**: CSS Modules + PostCSS
- **ESLint**: Code quality and consistency

## 📁 Project Structure

```
smart-bookmark-app/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication routes
│   │   ├── callback/      # OAuth callback handler
│   │   └── logout/        # Logout functionality
│   ├── login/             # Login page
│   ├── components/        # Reusable components
│   │   └── BookmarksList.tsx
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── utils/
│   └── supabase/          # Supabase client utilities
│       ├── client.ts      # Client-side Supabase
│       └── server.ts      # Server-side Supabase
├── public/                # Static assets
└── middleware.ts          # Next.js middleware (auth checks)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smart-bookmark-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐛 Challenges & Solutions

### Challenge 1: OAuth Redirect Handling
**Problem**: Managing OAuth callbacks and maintaining session state across redirects.

**Solution**: Implemented a dedicated OAuth callback route (`/auth/callback`) that properly handles the redirect flow and sets authentication cookies securely.

### Challenge 2: Server vs Client Supabase Instances
**Problem**: Determining when to use server-side vs client-side Supabase clients for optimal security and performance.

**Solution**: Created separate client and server utilities:
- `client.ts` - For client-side operations (browser interactions)
- `server.ts` - For server-side operations (protected API routes, secure data fetching)

### Challenge 3: Protected Routes & Middleware
**Problem**: Ensuring authenticated users can only access authorized pages.

**Solution**: Implemented Next.js middleware to check authentication state before rendering protected pages.

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🚢 Deployment

Deploy to [Vercel](https://vercel.com) (recommended for Next.js):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy with one click

## 📝 License

This project is open source and available under the MIT License.
