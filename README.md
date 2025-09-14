# Multi-Admin Blog Platform

A modern, SEO-first, multi-admin blog platform with a rich block-style editor, role-based admin UI, fast public site (SSG/ISR), headless API, media storage, search, analytics, and built for Cloudflare hosting.

## 🚀 Features

### Core Features

- **Rich Editor**: TipTap-based block editor with tables, embeds, code blocks, and more
- **Multi-Admin**: Role-based permissions (Admin, Editor, Author, Reviewer)
- **SEO Optimized**: Static generation, meta tags, Open Graph, structured data
- **Fast Performance**: Edge caching, CDN, optimized images
- **Responsive Design**: Mobile-first, accessible UI
- **Dark Mode**: System preference detection with manual toggle

### Content Management

- **Posts**: Draft, scheduled, published states with revisions
- **Categories**: Hierarchical organization
- **Tags**: Flexible labeling system
- **Media Manager**: R2 storage with Cloudflare Images optimization
- **Comments**: Built-in commenting with moderation
- **Search**: Full-text search with optional Meilisearch integration

### Technical Features

- **TypeScript**: End-to-end type safety
- **Prisma ORM**: Database management and migrations
- **Authentication**: JWT with refresh tokens, 2FA support
- **File Uploads**: Direct to Cloudflare R2 with signed URLs
- **Real-time**: WebSocket support for collaborative editing
- **Analytics**: Built-in analytics with external integrations
- **RSS/JSON Feeds**: Automatic feed generation

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Nuxt 3 (Vue) + Nuxt UI
- **Backend**: Nitro + Prisma + PostgreSQL
- **Editor**: TipTap (ProseMirror-based)
- **Hosting**: Cloudflare Pages + Workers
- **Storage**: Cloudflare R2 + Images
- **Database**: PostgreSQL (managed)
- **Package Manager**: pnpm
- **Linting**: Biome

### Project Structure

```
├── apps/
│   ├── web/          # Nuxt 3 frontend application
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── stores/
│   │   └── middleware/
│   └── api/          # Nitro backend application
│       ├── server/
│       ├── prisma/
│       └── wrangler.toml
├── packages/
│   ├── shared/       # Shared types and schemas
│   └── ui/          # Shared UI components
├── .github/
│   └── workflows/   # CI/CD pipelines
└── docs/           # Documentation
```

## 🚦 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database
- Cloudflare account (for production)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd multi-admin-blog-platform
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**

   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

5. **Start development servers**

   ```bash
   pnpm dev
   ```

This will start:

- Frontend: <http://localhost:3000>
- API: <http://localhost:8787>

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/blog_platform"

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-jwt-refresh-secret"

# Cloudflare R2 Storage
R2_BUCKET_NAME="your-bucket"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_ENDPOINT="https://your-account.r2.cloudflarestorage.com"

# See .env.example for complete list
```

## 📚 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start all development servers
pnpm dev:web          # Start only frontend
pnpm dev:api          # Start only API

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Seed database with sample data

# Code Quality
pnpm lint             # Run linting
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code
pnpm typecheck        # Type checking

# Testing
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm test:coverage    # Run tests with coverage

# Building
pnpm build            # Build all applications
pnpm build:web        # Build frontend only
pnpm build:api        # Build API only
```

### Database Management

The project uses Prisma for database management:

```bash
# Create a new migration
pnpm db:migrate dev --name add_user_table

# Reset database (careful!)
pnpm db:reset

# Deploy migrations to production
pnpm db:migrate deploy
```

### Adding New Features

1. **Database Changes**
   - Update `apps/api/prisma/schema.prisma`
   - Run `pnpm db:migrate dev --name description`

2. **API Endpoints**
   - Add handlers in `apps/api/server/api/`
   - Use shared schemas for validation

3. **Frontend Components**
   - Create components in `apps/web/components/`
   - Use Nuxt UI components for consistency

4. **Types**
   - Add shared types in `packages/shared/src/types.ts`
   - Update schemas in `packages/shared/src/schemas.ts`

## 🚀 Deployment

### Cloudflare Deployment

1. **Setup Cloudflare**

   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. **Configure Secrets**

   ```bash
   # API Worker secrets
   wrangler secret put DATABASE_URL
   wrangler secret put JWT_SECRET
   # ... add other secrets

   # Pages environment variables (via dashboard)
   ```

3. **Deploy**

   ```bash
   pnpm build
   wrangler deploy apps/api
   # Pages will deploy automatically via GitHub Actions
   ```

### Environment Setup

- **Development**: Local PostgreSQL + local file storage
- **Staging**: Managed PostgreSQL + Cloudflare R2
- **Production**: Managed PostgreSQL + Cloudflare R2 + CDN

### CI/CD Pipeline

GitHub Actions automatically:

- Runs tests and linting on PRs
- Deploys to staging on `develop` branch
- Deploys to production on `main` branch
- Runs security scans and performance audits

## 🔐 Security

### Authentication

- JWT tokens with refresh token rotation
- Password hashing with Argon2
- 2FA support with TOTP
- Session management

### Authorization

- Role-based permissions (RBAC)
- Route-level protection
- API endpoint authorization
- Admin area restrictions

### Data Protection

- Input validation with Zod schemas
- XSS protection with DOMPurify
- CSRF protection
- Rate limiting
- Audit logging

## 📖 API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Content Endpoints

- `GET /api/posts` - List posts
- `GET /api/posts/:slug` - Get single post
- `POST /api/posts` - Create post (admin)
- `PUT /api/posts/:id` - Update post (admin)
- `DELETE /api/posts/:id` - Delete post (admin)

### Media Endpoints

- `GET /api/media` - List media files
- `POST /api/media/upload` - Upload file
- `DELETE /api/media/:id` - Delete file

See full API documentation at `/api/docs` when running in development.

## 🧪 Testing

### Unit Tests

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
```

### E2E Tests

```bash
pnpm test:e2e
pnpm test:e2e:headed  # With browser UI
```

### Performance Testing

```bash
pnpm lighthouse      # Lighthouse audit
pnpm test:load       # Load testing
```

## 🎨 Customization

### Styling

- Uses Nuxt UI with Tailwind CSS
- Custom theme in `apps/web/tailwind.config.ts`
- Dark mode support built-in

### Editor Customization

- TipTap extensions in `apps/web/components/Editor/`
- Custom block types can be added
- Collaborative editing ready

### Admin Interface

- Role-based dashboard customization
- Plugin system for extensions
- White-label ready

## 📊 Analytics & Monitoring

### Built-in Analytics

- Page views and user tracking
- Content performance metrics
- Admin activity monitoring

### External Integrations

- Google Analytics 4
- Plausible Analytics (privacy-focused)
- Custom analytics providers

### Monitoring

- Error tracking with Sentry
- Performance monitoring
- Uptime monitoring
- Database query monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋 Support

- 📖 [Documentation](./docs/)
- 🐛 [Issue Tracker](https://github.com/your-org/multi-admin-blog-platform/issues)
- 💬 [Discussions](https://github.com/your-org/multi-admin-blog-platform/discussions)
- 📧 Email: <support@yourdomain.com>

## 🗺️ Roadmap

### Phase 1 (Current)

- [x] Core blog functionality
- [x] Multi-admin system
- [x] Rich text editor
- [x] SEO optimization
- [x] Basic analytics

### Phase 2 (Next)

- [ ] Advanced search (Meilisearch)
- [ ] Real-time collaborative editing
- [ ] Advanced analytics dashboard
- [ ] Plugin system
- [ ] Multi-language support

### Phase 3 (Future)

- [ ] Membership/paywall system
- [ ] Newsletter integration
- [ ] Advanced comment system
- [ ] Mobile app (React Native)
- [ ] AI-powered features

## 🏆 Acknowledgments

- [Nuxt](https://nuxt.com/) - The Intuitive Vue Framework
- [TipTap](https://tiptap.dev/) - The headless editor framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Cloudflare](https://cloudflare.com/) - Edge platform
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

Built with ❤️ by [BitShift](https://github.com/bitshiftdevs)
