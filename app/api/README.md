# API Routes

This directory contains Next.js API route handlers for the FIRST Global Team Kenya application backend.

## Structure

```
api/
├── auth/               # Authentication endpoints
│   ├── request-otp/   # Request OTP for login
│   ├── verify-otp/    # Verify OTP and authenticate
│   └── refresh/       # Refresh access tokens
├── applications/       # Application management
│   ├── [id]/          # Specific application CRUD
│   └── route.ts       # List/create applications
├── admin/             # Admin-only endpoints
│   ├── applications/  # Application review
│   └── dashboard/     # Admin statistics
└── middleware.ts      # API middleware
```

## Authentication Endpoints

### POST `/api/auth/request-otp`
Request OTP code for authentication.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to email"
}
```

### POST `/api/auth/verify-otp`
Verify OTP and create session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "user": { "id": "user_id", "email": "user@example.com" },
  "tokens": { "accessToken": "...", "refreshToken": "..." }
}
```

### POST `/api/auth/refresh`
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

## Application Endpoints

### GET `/api/applications`
List user applications (paginated).

### POST `/api/applications`
Create new application.

### GET `/api/applications/[id]`
Get specific application details.

### PUT `/api/applications/[id]`
Update draft application.

### POST `/api/applications/[id]/submit`
Submit application for review.

## Admin Endpoints

### GET `/api/admin/applications`
List all applications with filters.

### PUT `/api/admin/applications/[id]/review`
Review and update application status.

### GET `/api/admin/dashboard`
Get dashboard statistics.

## Security Features

- JWT authentication required for protected routes
- Rate limiting on all endpoints
- Input validation with Zod schemas
- SQL injection prevention via Prisma
- Audit logging for sensitive operations

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data"
  }
}
```

## Development Notes

- Use TypeScript for type safety
- Implement proper error handling
- Add comprehensive logging
- Follow REST API conventions
- Document all endpoints

## Testing

- Unit tests for route logic
- Integration tests for full API flows
- Authentication testing
- Error case testing

## Adding New Endpoints

1. Create new directory: `api/new-endpoint/`
2. Add `route.ts` file
3. Implement HTTP method handlers
4. Add input validation
5. Update API documentation