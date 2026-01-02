# Rate Limiting

The application includes rate limiting to prevent abuse and ensure fair usage for all users.

## Purpose

Rate limiting helps:
- Prevent spam and abuse
- Protect against automated attacks
- Ensure fair resource allocation
- Maintain system performance
- Comply with usage policies

## What Gets Limited

- Authentication attempts (OTP requests and verification)
- API calls and data requests
- File uploads and downloads
- Administrative actions
- Email sending

## How It Works

When you exceed the allowed number of requests within a time period, you'll receive a message asking you to wait before trying again. Limits vary by action type and user role.

## Limits

- **OTP Requests**: Limited per email address per hour
- **API Calls**: Reasonable limits to prevent abuse
- **File Operations**: Controlled upload/download rates
- **Admin Actions**: Appropriate limits for administrative tasks

## User Experience

If you hit a rate limit, you'll see a clear message explaining what happened and when you can try again. Most limits are generous enough for normal usage.

#### Endpoint-Specific Limiting
Different limits for different endpoint types.

```typescript
const endpointLimiters = {
  // Read operations
  readLimiter: { windowMs: 15 * 60 * 1000, max: 200 },

  // Write operations
  writeLimiter: { windowMs: 15 * 60 * 1000, max: 50 },

  // File uploads
  uploadLimiter: { windowMs: 60 * 60 * 1000, max: 20 },

  // Admin operations
  adminLimiter: { windowMs: 15 * 60 * 1000, max: 500 },

  // Search operations
  searchLimiter: { windowMs: 15 * 60 * 1000, max: 30 }
};
```

### User-Based Rate Limiting

#### Per-User Limiting
Rate limits based on authenticated user rather than IP.

```typescript
const userLimiter = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req, res) => {
    // Different limits based on user role
    const user = req.user;
    switch (user.role) {
      case 'admin': return 1000;
      case 'mentor': return 500;
      case 'student': return 100;
      default: return 50;
    }
  },
  keyGenerator: (req, res) => {
    return req.user?.id || req.ip;
  }
};
```

#### Application-Based Limiting
Limits based on application-specific actions.

```typescript
const applicationLimiter = {
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // 3 applications per user per day
  message: 'Application submission limit exceeded. Please try again tomorrow.',
  keyGenerator: (req, res) => {
    return req.user?.id;
  }
};
```

## Implementation Architecture

### Middleware Structure
```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Redis-based store for distributed rate limiting
const redisStore = new RedisStore({
  sendCommand: (...args) => redis.call(...args),
});

function createRateLimiter(config: RateLimitConfig) {
  return rateLimit({
    store: redisStore,
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: config.keyGenerator,
    handler: (req, res, next, options) => {
      // Custom rate limit exceeded handler
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil(options.windowMs / 1000),
        limit: options.max,
        windowMs: options.windowMs
      });
    }
  });
}
```

### Route-Specific Application
```typescript
// Apply different limiters to different routes
app.use('/api/auth/request-otp', otpRequestLimiter);
app.use('/api/auth/verify-otp', otpVerifyLimiter);
app.use('/api/admin', adminLimiter);
app.use('/api/applications', applicationLimiter);
app.use('/api', apiLimiter); // Catch-all for other API routes
```

### Distributed Rate Limiting
```typescript
// Redis configuration for distributed environments
const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  tls: process.env.NODE_ENV === 'production'
};

// Rate limit store with Redis
const redisStore = new RedisStore({
  sendCommand: (...args) => redis.call(...args),
  prefix: 'rate-limit:',
  resetExpiryOnChange: true
});
```

## Rate Limit Headers

### Standard Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
X-RateLimit-Reset-After: 900
```

### Legacy Headers (Optional)
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
Retry-After: 900
```

## Monitoring and Analytics

### Rate Limit Metrics
```typescript
interface RateLimitMetrics {
  endpoint: string;
  timeWindow: number;
  requests: number;
  blocked: number;
  topIPs: Array<{ ip: string; requests: number }>;
  topUsers: Array<{ userId: string; requests: number }>;
}
```

### Real-time Monitoring
```typescript
// Monitor rate limit hits
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    if (res.statusCode === 429) {
      // Log rate limit violation
      logRateLimitViolation({
        ip: req.ip,
        userId: req.user?.id,
        endpoint: req.path,
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
      });
    }
    return originalJson.call(this, data);
  };
  next();
});
```

### Analytics Dashboard
```typescript
// Rate limiting analytics
const analytics = {
  getRateLimitStats: async (timeRange: TimeRange) => {
    const stats = await prisma.rateLimitLog.groupBy({
      by: ['endpoint'],
      where: {
        timestamp: { gte: timeRange.start, lte: timeRange.end },
        blocked: true
      },
      _count: true
    });
    return stats;
  },

  getTopOffenders: async (timeRange: TimeRange) => {
    const offenders = await prisma.rateLimitLog.groupBy({
      by: ['ipAddress'],
      where: {
        timestamp: { gte: timeRange.start, lte: timeRange.end },
        blocked: true
      },
      _count: { _all: true },
      orderBy: { _count: { ipAddress: 'desc' } },
      take: 10
    });
    return offenders;
  }
};
```

## Database Schema

### Rate Limit Logs Table
```sql
CREATE TABLE "RateLimitLog" (
  id          String   @id @default(cuid())
  ipAddress   String
  userId      String?
  endpoint    String
  userAgent   String
  blocked     Boolean  @default(false)
  timestamp   DateTime @default(now())

  @@map("rate_limit_logs")
);

-- Indexes for performance
CREATE INDEX idx_rate_limit_ip ON "RateLimitLog" ("ipAddress");
CREATE INDEX idx_rate_limit_user ON "RateLimitLog" ("userId");
CREATE INDEX idx_rate_limit_endpoint ON "RateLimitLog" ("endpoint");
CREATE INDEX idx_rate_limit_timestamp ON "RateLimitLog" ("timestamp");
```

### Rate Limit Configuration Table
```sql
CREATE TABLE "RateLimitConfig" (
  id          String   @id @default(cuid())
  endpoint    String   @unique
  windowMs    Int
  maxRequests Int
  enabled     Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("rate_limit_configs")
);
```

## Configuration Management

### Environment Variables
```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Rate Limit Defaults
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Specific Limits
OTP_REQUEST_LIMIT=5
OTP_VERIFY_LIMIT=5
LOGIN_ATTEMPT_LIMIT=10
API_REQUEST_LIMIT=100
ADMIN_REQUEST_LIMIT=500
```

### Dynamic Configuration
```typescript
// Load rate limit configs from database
const rateLimitConfigs = await prisma.rateLimitConfig.findMany({
  where: { enabled: true }
});

// Apply configurations dynamically
rateLimitConfigs.forEach(config => {
  const limiter = createRateLimiter({
    windowMs: config.windowMs,
    max: config.maxRequests,
    message: 'Rate limit exceeded'
  });

  app.use(config.endpoint, limiter);
});
```

## Error Handling and User Experience

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 900,
  "limit": 100,
  "windowMs": 900000
}
```

### Progressive Delay
```typescript
// Implement progressive delays for repeated violations
function getProgressiveDelay(attemptCount: number): number {
  const baseDelay = 60; // 1 minute
  const multiplier = Math.pow(2, Math.min(attemptCount - 1, 5)); // Max 32x
  return baseDelay * multiplier;
}
```

### User-Friendly Messages
```typescript
const rateLimitMessages = {
  otpRequest: 'Too many OTP requests. Please wait before requesting another code.',
  otpVerify: 'Too many verification attempts. Please request a new OTP.',
  login: 'Too many login attempts. Your account is temporarily locked.',
  api: 'API request limit exceeded. Please reduce your request frequency.',
  upload: 'Upload limit exceeded. Please try again later.'
};
```

## Security Considerations

### IP Spoofing Protection
```typescript
// Validate IP addresses
function validateIPAddress(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Get real client IP behind proxies
function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];

  if (validateIPAddress(realIP as string)) return realIP as string;
  if (typeof forwarded === 'string') {
    const ips = forwarded.split(',').map(ip => ip.trim());
    for (const ip of ips) {
      if (validateIPAddress(ip)) return ip;
    }
  }

  return req.ip || 'unknown';
}
```

### Abuse Detection
```typescript
// Detect suspicious patterns
function detectAbuse(requests: RateLimitLog[]): AbuseLevel {
  const recentRequests = requests.filter(r =>
    r.timestamp > Date.now() - 60000 // Last minute
  );

  const uniqueIPs = new Set(recentRequests.map(r => r.ipAddress)).size;
  const blockedCount = recentRequests.filter(r => r.blocked).length;

  if (blockedCount > 10) return 'high';
  if (uniqueIPs > 5 && blockedCount > 3) return 'medium';
  if (blockedCount > 1) return 'low';

  return 'none';
}
```

### Blacklist Management
```typescript
interface BlacklistEntry {
  ip: string;
  reason: string;
  expiresAt: Date;
  createdAt: Date;
}

class IPBlacklist {
  private blacklist: Map<string, BlacklistEntry> = new Map();

  add(ip: string, reason: string, duration: number): void {
    const expiresAt = new Date(Date.now() + duration);
    this.blacklist.set(ip, {
      ip,
      reason,
      expiresAt,
      createdAt: new Date()
    });
  }

  isBlocked(ip: string): boolean {
    const entry = this.blacklist.get(ip);
    if (!entry) return false;

    if (entry.expiresAt < new Date()) {
      this.blacklist.delete(ip);
      return false;
    }

    return true;
  }

  cleanup(): void {
    const now = new Date();
    for (const [ip, entry] of this.blacklist.entries()) {
      if (entry.expiresAt < now) {
        this.blacklist.delete(ip);
      }
    }
  }
}
```

## Testing Strategy

### Unit Tests
```typescript
describe('Rate Limiting', () => {
  it('should allow requests under limit', async () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 5 });

    for (let i = 0; i < 5; i++) {
      const response = await request(app).get('/api/test');
      expect(response.status).not.toBe(429);
    }
  });

  it('should block requests over limit', async () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 2 });

    // First two requests should succeed
    await request(app).get('/api/test').expect(200);
    await request(app).get('/api/test').expect(200);

    // Third request should be blocked
    await request(app).get('/api/test').expect(429);
  });
});
```

### Integration Tests
```typescript
describe('Rate Limiting Integration', () => {
  it('should handle concurrent requests properly', async () => {
    const promises = Array(10).fill().map(() =>
      request(app).get('/api/test')
    );

    const responses = await Promise.all(promises);
    const blockedCount = responses.filter(r => r.status === 429).length;

    expect(blockedCount).toBeGreaterThan(0);
  });

  it('should reset limits after window', async () => {
    const limiter = createRateLimiter({ windowMs: 1000, max: 2 });

    // Exhaust limit
    await request(app).get('/api/test').expect(200);
    await request(app).get('/api/test').expect(200);
    await request(app).get('/api/test').expect(429);

    // Wait for window to reset
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Should work again
    await request(app).get('/api/test').expect(200);
  });
});
```

## Performance Optimization

### Memory Management
```typescript
// Clean up expired entries periodically
setInterval(() => {
  rateLimitStore.cleanup();
}, 60000); // Every minute
```

### Caching Strategy
```typescript
// Cache rate limit configurations
const configCache = new NodeCache({ stdTTL: 300 }); // 5 minutes

async function getRateLimitConfig(endpoint: string) {
  const cached = configCache.get(endpoint);
  if (cached) return cached;

  const config = await prisma.rateLimitConfig.findUnique({
    where: { endpoint }
  });

  configCache.set(endpoint, config);
  return config;
}
```

### Distributed Caching
```typescript
// Use Redis for distributed rate limiting
const redisClient = createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

await redisClient.connect();
```

## Future Enhancements

### Advanced Features
- **Machine Learning**: Intelligent rate limit adjustments
- **Geographic Limiting**: Region-based rate limits
- **Time-based Limits**: Different limits for business hours
- **User Reputation**: Rate limits based on user behavior history

### Scalability Improvements
- **Global Rate Limiting**: Cross-region rate limit coordination
- **Auto-scaling**: Dynamic rate limit adjustments based on load
- **Edge Computing**: Rate limiting at CDN level
- **Real-time Analytics**: Advanced rate limiting dashboards

This rate limiting system ensures fair usage, protects against abuse, and maintains system stability and security for the FIRST Global Team Kenya application.