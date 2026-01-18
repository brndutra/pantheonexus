# PantheonNexus - Scion Character Management System

## Overview

PantheonNexus is a full-stack web application for managing Scion tabletop RPG character sheets. It provides a cyberpunk/mythological themed interface for creating, viewing, and editing character data including attributes, skills, abilities, and divine powers. The application features a React frontend with a dark gold/black aesthetic and an Express backend connected to PostgreSQL.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack Query for server state, local React state for UI
- **Styling**: Tailwind CSS v4 with custom theme variables, shadcn/ui component library
- **Build Tool**: Vite with custom plugins for Replit integration
- **Design System**: Custom "mythic-tech" theme with gold/black color palette, custom fonts (Orbitron, Rajdhani, Share Tech Mono)

### Backend Architecture
- **Framework**: Express 5 with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Pattern**: RESTful JSON API under `/api` prefix
- **Session Storage**: connect-pg-simple for PostgreSQL session storage (available but not currently implemented)

### Data Storage
- **Database**: PostgreSQL (required via DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` using Drizzle ORM definitions
- **Key Tables**: 
  - `users` - User authentication (id, username, password)
  - `characters` - Character sheets with JSONB fields for flexible attribute storage
  
- **Compendium Tables** (reference data for Scion RPG):
  - `boons` - Divine powers by purview (Fire, Sky, Death, etc.)
  - `knacks` - Epic Attribute powers (tier-based abilities)
  - `callings` - Scion roles/archetypes with favored purviews and abilities
  - `natures` - Character personality types with willpower recovery rules
  - `attacks` - Combat attack templates (melee, ranged, unarmed, special)

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/ui/  # shadcn/ui components
│   │   ├── pages/          # Route components
│   │   ├── lib/            # Utilities, API client, hooks
│   │   └── hooks/          # Custom React hooks
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database operations layer
│   └── db.ts         # Database connection
├── shared/           # Shared types and schemas
│   └── schema.ts     # Drizzle schema definitions
└── attached_assets/  # Static assets and legacy utilities
```

### Key Design Patterns
- **Storage Interface Pattern**: `IStorage` interface in `server/storage.ts` abstracts database operations
- **Schema Validation**: Zod schemas generated from Drizzle for API request validation
- **Path Aliases**: TypeScript paths configured for clean imports (`@/`, `@shared/`)
- **Component Library**: shadcn/ui with "new-york" style variant

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connected via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migrations via `drizzle-kit push`

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **framer-motion**: Animation library
- **recharts**: Data visualization (radar charts for attributes)
- **Radix UI**: Accessible component primitives (via shadcn/ui)
- **embla-carousel-react**: Carousel component

### Build & Development
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development

### Styling
- **Tailwind CSS v4**: Utility-first CSS with `@tailwindcss/vite` plugin
- **class-variance-authority**: Component variant management
- **tailwind-merge**: Class name merging utility

### Fonts (Google Fonts)
- Orbitron (display/mythic headings)
- Rajdhani (tech/body text)
- Share Tech Mono (code/data display)