# API Overview

The application provides a REST API for managing team operations, applications, and user authentication.

## Authentication

Users authenticate using email-based OTP verification. After successful authentication, JWT tokens are issued for API access.

## Main Endpoints

### Public Endpoints
- **POST** `/api/auth/request-otp` - Request authentication code
- **POST** `/api/auth/verify-otp` - Verify code and login

### Application Endpoints
- **GET** `/api/applications` - List user's applications
- **POST** `/api/applications` - Create new application
- **GET** `/api/applications/[id]` - Get specific application
- **PUT** `/api/applications/[id]` - Update application
- **POST** `/api/applications/[id]/submit` - Submit for review

### Admin Endpoints
- **GET** `/api/admin/applications` - List all applications
- **PUT** `/api/admin/applications/[id]/review` - Review application
- **GET** `/api/admin/dashboard` - Dashboard statistics

## Security

The API includes rate limiting, input validation, and secure authentication to protect against abuse and ensure data integrity.

## Error Handling

API responses include clear error messages with appropriate HTTP status codes to help with debugging and user feedback.