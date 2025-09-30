# 🚀 Quick Start Guide

## Prerequisites

- Node.js 22+
- pnpm 10+
- PostgreSQL database
- Git

## 🏗️ Setup Instructions

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/bitshiftdevs/bitblog
or gh repo clone bitshiftdevs/bitblog
cd bitblog

# Install dependencies
pnpm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required Environment Variables:**

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bitblog"

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-jwt-refresh-key"

# Basic site config
SITE_URL="http://localhost:3000"
SITE_NAME="Your Blog Platform"
```

### 3. Database Setup

**Option A: Using Docker (Recommended)**

```bash
# Start PostgreSQL with Docker
docker-compose up postgres -d

# Run migrations and seed
pnpm db:migrate
pnpm db:seed
```

**Option B: Local PostgreSQL**

```bash
# Ensure PostgreSQL is running locally
# Create database: blog_platform

# Run migrations and seed
pnpm db:migrate
pnpm db:seed
```

### 4. Start Development

```bash
# Start all development servers
pnpm dev
```

This will start:

- **Frontend**: <http://localhost:3000>
- **API**: <http://localhost:8787>
- **Database**: localhost:5432

## 🔑 Default Users (from seed)

After running `pnpm db:seed`, you can login with:

| Role   | Email                     | Password  | Permissions        |
| ------ | ------------------------- | --------- | ------------------ |
| Admin  | <admin@blogplatform.com>  | admin123  | Full access        |
| Editor | <editor@blogplatform.com> | editor123 | Content management |
| Author | <john@blogplatform.com>   | author123 | Write posts        |
| Author | <sarah@blogplatform.com>  | author123 | Write posts        |
| Author | <mike@blogplatform.com>   | author123 | Write posts        |

## 📱 Key URLs

- **Homepage**: <http://localhost:3000>
- **Admin Dashboard**: <http://localhost:3000/admin>
- **Login**: <http://localhost:3000/auth>
- **API Docs**: <http://localhost:8787/api> (development)

## 🛠️ Development Commands

```bash
# Frontend only
pnpm dev:web

# API only
pnpm dev:api

# Database commands
pnpm db:studio        # Open Prisma Studio
pnpm db:migrate       # Run new migrations
pnpm db:reset         # Reset database (careful!)
pnpm db:seed          # Re-seed with sample data

# Code quality
pnpm lint            # Run linting
pnpm lint:fix        # Fix auto-fixable issues
pnpm format          # Format code
pnpm typecheck       # Type checking

# Testing
pnpm test            # Unit tests
pnpm test:e2e        # End-to-end tests

# Building
pnpm build           # Build for production
```

## 🎯 First Steps

1. **Login to Admin** → <http://localhost:3000/admin>
   - Use: <admin@blogplatform.com> / admin123

2. **Create Your First Post**
   - Go to Posts → New Post
   - Use the rich TipTap editor
   - Add categories and tags

3. **Customize Settings**
   - Go to Settings → Site Settings
   - Update site title, description, logo

4. **Invite Team Members**
   - Go to Users → Invitations
   - Send email invites with roles

## 🔧 Configuration

### Adding Cloudflare R2 (Production)

```bash
# Add to .env
R2_BUCKET_NAME="your-bucket-name"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_ENDPOINT="https://your-account.r2.cloudflarestorage.com"
R2_PUBLIC_URL="https://your-custom-domain.com"
```

### Email Configuration (SMTP)

```bash
# Add to .env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM_NAME="Your Blog"
SMTP_FROM_EMAIL="noreply@yourdomain.com"
```

### Search Enhancement (Optional)

```bash
# Start Meilisearch with Docker
docker-compose up meilisearch -d

# Add to .env
MEILISEARCH_URL="http://localhost:7700"
MEILISEARCH_KEY="your-master-key"
```

## 🚀 Deployment

### Cloudflare Pages + Workers

1. **Setup Cloudflare**

   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. **Configure Production Environment**

   ```bash
   # Set secrets for Workers
   wrangler secret put DATABASE_URL
   wrangler secret put JWT_SECRET
   wrangler secret put JWT_REFRESH_SECRET
   ```

3. **Deploy**

   ```bash
   # Build applications
   pnpm build

   # Deploy API
   wrangler deploy apps/api

   # Frontend deploys automatically via GitHub Actions
   ```

### GitHub Actions (Automatic)

The repository includes GitHub Actions workflows that automatically:

- ✅ Run tests and linting on PRs
- ✅ Deploy to staging on `develop` branch
- ✅ Deploy to production on `main` branch

Required GitHub Secrets:

```
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
DATABASE_URL (production)
JWT_SECRET (production)
# ... other production secrets
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests (install Playwright first)
npx playwright install
pnpm test:e2e

# Test coverage
pnpm test:coverage
```

## 🔍 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# Reset database if corrupted
pnpm db:reset
pnpm db:seed
```

### Port Conflicts

```bash
# Change ports in nuxt.config.ts and nitro.config.ts
# Default ports: 3000 (web), 8787 (api), 5432 (db)
```

### Build Issues

```bash
# Clear caches
pnpm clean

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📚 Next Steps

1. **Customize Design** → Update components in `apps/web/components/`
2. **Add Features** → Extend API endpoints in `apps/api/server/api/`
3. **Configure SEO** → Update meta tags and OpenGraph settings
4. **Setup Analytics** → Add Google Analytics or Plausible
5. **Add Comments** → Integrate external comment system or build custom
6. **Payment Integration** → Add Stripe for paid content

## 🆘 Support

- 📖 [Full Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/your-org/repo/issues)
- 💬 [Discussions](https://github.com/your-org/repo/discussions)

---

**Happy blogging! 🎉**
