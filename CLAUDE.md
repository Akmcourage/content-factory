# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**公众号内容工厂** - An AI-driven WeChat Official Account content creation platform that automates the entire content lifecycle: from topic analysis → content creation → publication.

**Current Status**: Frontend prototype completed (all UI/UX). Backend logic and real APIs are NOT implemented - all data is mocked.

**Tech Stack**: Next.js 14 (App Router) + TypeScript + Tailwind CSS

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Custom port
npm run dev -- -p 3001
```

## Architecture Overview

### 1. Application Structure

This is a **Next.js App Router** application with a **fixed sidebar layout**:

- **Root Layout** (`app/layout.tsx`): Wraps all pages with `<Sidebar />` + main content area
- **Sidebar** (`components/sidebar.tsx`): Client component using `usePathname()` for active route highlighting
- **Pages**: Four main routes, all under `app/` directory
  - `/` - Dashboard (stats overview, quick actions, recent articles)
  - `/analysis` - Topic analysis (keyword search → AI insights)
  - `/creation` - Content creation (AI article generation with Unsplash images)
  - `/publish` - Publish management (article CRUD, batch operations, status filtering)

**Key Point**: All pages are **"use client"** components with heavy state management (`useState`) because they contain interactive forms, animations, and mock API simulations.

### 2. Component System

**UI Components** (`components/ui/`): Custom component library following shadcn/ui patterns
- `Button`, `Card`, `Input`, `Textarea`, `Badge`
- All use `cn()` utility from `lib/utils.ts` for className merging
- Variants controlled via props (e.g., `variant="outline"`, `size="sm"`)

**Styling Pattern**:
```tsx
// Always merge classes with cn()
import { cn } from "@/lib/utils"
className={cn("base-classes", conditionalClasses, props.className)}
```

### 3. Page State Management Pattern

Each page follows this pattern for mock async operations:

```tsx
const [isLoading, setIsLoading] = useState(false)
const [showResults, setShowResults] = useState(false)

const handleAction = () => {
  setIsLoading(true)
  setTimeout(() => {
    setIsLoading(false)
    setShowResults(true)
  }, 2000)
}
```

**Important**: When implementing real backend, replace these `setTimeout` mocks with actual API calls.

### 4. Routing and Navigation

- **Navigation config**: Defined in `components/sidebar.tsx` as `navigation` array
- **Active state**: Automatically handled by comparing `usePathname()` with `href`
- **Adding new pages**:
  1. Create `app/new-page/page.tsx`
  2. Add entry to `navigation` array in `sidebar.tsx`
  3. Use appropriate Lucide React icon

### 5. Styling System

**Tailwind CSS** with CSS variables for theming:
- Theme colors defined in `app/globals.css` (`:root` and `.dark`)
- Responsive breakpoints: `md:`, `lg:` (mobile-first)
- Custom utilities: `bg-muted`, `text-muted-foreground`, etc.

**Color Customization**: Edit CSS variables in `app/globals.css`:
```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  /* ... */
}
```

## Future Backend Implementation

When adding real functionality, create these directories/files:

```
app/api/
├── analysis/
│   ├── search/route.ts      # POST: Search WeChat articles
│   └── insight/route.ts     # POST: Generate AI insights
├── creation/
│   ├── create/route.ts      # POST: AI article generation
│   └── images/route.ts      # GET: Fetch Unsplash images
├── articles/
│   ├── route.ts             # GET: List articles, POST: Create
│   └── [id]/route.ts        # GET/PUT/DELETE: Article CRUD
└── publish/
    └── wechat/route.ts      # POST: Publish to WeChat
```

**Database Schema** (SQLite):
- `analysis_records` - Topic analysis sessions
- `source_articles` - Scraped WeChat articles
- `created_articles` - AI-generated articles
- `article_images` - Article image references

See `need1.0.txt` for detailed requirements.

## Code Conventions

### TypeScript
- All pages and components use TypeScript
- Define interfaces for complex data structures (see `app/publish/page.tsx` for `Article` interface example)

### Component Files
- One component per file
- Use `"use client"` directive when using hooks (`useState`, `usePathname`, etc.)
- Export components as default for pages, named exports for reusable components

### Imports
- Use `@/` alias for absolute imports
- Group imports: React → Next.js → third-party → local components → utils

## Important Notes

1. **No Backend**: All API interactions are simulated with `setTimeout`. Search for `setTimeout` to find mock points.

2. **Mock Data Locations**:
   - Dashboard: `app/page.tsx` - `stats`, `recentArticles`
   - Analysis: `app/analysis/page.tsx` - `mockArticles`, `insights`
   - Creation: `app/creation/page.tsx` - `mockArticle`, `insightTopics`
   - Publish: `app/publish/page.tsx` - `mockArticles`

3. **State Management**: Currently using local `useState`. Consider adding Context API or Zustand when data needs to be shared across pages.

4. **Image Handling**: Unsplash URLs are hardcoded placeholders. Replace with real Unsplash API calls.

5. **User Auth**: Sidebar user info is hardcoded. Implement proper authentication system in future.

## Adding New Features

### Adding a UI Component
1. Create file in `components/ui/[component].tsx`
2. Follow existing patterns (forwardRef, variant props)
3. Use `cn()` for className handling
4. Export component

### Adding a New Page
1. Create `app/new-route/page.tsx`
2. Add "use client" if using interactivity
3. Follow existing page structure (header → main content → actions)
4. Update sidebar navigation
5. Use consistent spacing (`p-8 space-y-6` for page container)

### Modifying Styles
- Global styles: `app/globals.css`
- Component-specific: Use Tailwind classes
- Theme colors: CSS variables in `globals.css`

## External Dependencies

**Required API Keys** (not yet implemented):
- OpenAI-compatible API endpoint (for article analysis and generation)
- Unsplash API key (for article images)
- WeChat Official Account API credentials (for article search and publishing)

**Configuration** (when implementing backend):
- Store in `.env.local` (already gitignored)
- Never commit API keys to repository
