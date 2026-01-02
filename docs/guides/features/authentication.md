# Authentication

The application uses email-based OTP (One-Time Password) authentication instead of traditional passwords for better security.

## How It Works

1. **Enter Email**: Users enter their email address
2. **Receive Code**: A 6-digit code is sent to their email
3. **Enter Code**: Users enter the code to log in
4. **Access Granted**: Users are logged in with secure tokens

## Security Benefits

- No passwords to remember or steal
- Each code works only once
- Codes expire quickly for security
- Protected against common password attacks

## For Developers

The authentication system uses JWT tokens for secure API access. Tokens are automatically refreshed to maintain user sessions without requiring re-login.

## Common Issues

- **Code not received**: Check spam folder, codes expire in 10 minutes
- **Too many attempts**: Wait before requesting new codes
- **Session expired**: Log in again to get new access