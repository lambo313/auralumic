# Development Guide

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Copy `.env.example` to `.env.local`
- Fill in required values

4. Start development server:
```bash
npm run dev
```

## Project Structure

- `app/` - Next.js pages and API routes
- `components/` - React components
- `lib/` - Utility functions and configurations
- `types/` - TypeScript type definitions
- `services/` - External service integrations

## Development Workflow

1. Create feature branch
2. Implement changes
3. Write tests
4. Submit pull request

## Testing

Run tests:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

## Code Style

- Follow ESLint rules
- Use Prettier for formatting
- Follow TypeScript best practices

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter
- `npm run type-check` - Check types
- `npm test` - Run tests
- `npm run db:seed` - Seed database

## Adding New Features

1. Create new components in appropriate directory
2. Add TypeScript types
3. Implement API routes if needed
4. Add tests
5. Update documentation
