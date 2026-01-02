# App Directory

This directory contains the Next.js App Router pages and route-specific components for the FIRST Global Team Kenya website.

## Structure

```
app/
├── (auth)/              # Authentication routes
│   ├── login/          # Login page
│   └── signup/         # Signup page
├── (dashboard)/        # Protected dashboard routes
│   ├── (admin)/        # Admin dashboard
│   ├── (alumni)/       # Alumni dashboard
│   ├── (mentor)/       # Mentor dashboard
│   └── (student)/      # Student dashboard
├── api/                # API route handlers
├── components/         # Shared React components
├── lib/                # Utility libraries
├── types/              # TypeScript definitions
├── globals.css         # Global styles
├── layout.tsx          # Root layout
└── page.tsx            # Homepage
```

## Route Groups

### Authentication Routes (`(auth)`)
- **Purpose**: Public authentication pages
- **Routes**:
  - `/login` - User login with OTP
  - `/signup` - User registration

### Dashboard Routes (`(dashboard)`)
- **Purpose**: Protected user dashboard pages
- **Access**: Requires authentication
- **Groups**:
  - `(admin)` - Administrative functions
  - `(alumni)` - Alumni-specific features
  - `(mentor)` - Mentor dashboard
  - `(student)` - Student applications and progress

## Key Components

### Layout Components
- `layout.tsx` - Root application layout with providers
- Theme provider integration
- Authentication context
- Global navigation

### Page Components
- `page.tsx` - Homepage with hero section and features
- Route-specific page components in subdirectories

## API Routes

Located in `api/` subdirectory with route handlers for:
- Authentication endpoints
- Application management
- Admin functions
- File uploads

## Development Notes

- Uses Next.js 13+ App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Server and client components as needed

## Adding New Pages

1. Create new route directory: `app/new-page/`
2. Add `page.tsx` file
3. Export default React component
4. Use layout inheritance or create custom layout

## Best Practices

- Keep components small and focused
- Use server components when possible
- Implement proper loading states
- Handle errors gracefully
- Follow accessibility guidelines