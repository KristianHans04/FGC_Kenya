# Audit Logging

The system maintains detailed logs of all user actions and administrative activities for security and compliance purposes.

## What Gets Logged

- User login and authentication attempts
- Application creation and modifications
- Administrative actions and changes
- File uploads and downloads
- System security events
- Important system operations

## Purpose

Audit logs help with:
- Security monitoring and incident investigation
- Compliance with data protection requirements
- Troubleshooting system issues
- Tracking user activity patterns
- Maintaining system accountability

## Access

Audit logs are securely stored and only accessible to authorized administrators. Logs are retained according to data retention policies.

### Audit Details Structure
```typescript
interface AuditDetails {
  // Generic fields
  description: string;       // Human-readable description
  changes?: Record<string, { old: any, new: any }>; // Before/after values

  // Action-specific fields
  applicationId?: string;
  fileId?: string;
  statusChange?: {
    from: ApplicationStatus;
    to: ApplicationStatus;
    reason?: string;
  };
  bulkOperation?: {
    count: number;
    operation: string;
    affectedIds: string[];
  };
  securityEvent?: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    threatType: string;
    mitigation: string;
  };
}
```

## Database Schema

### Audit Logs Table
```sql
CREATE TABLE "AuditLog" (
  id            String    @id @default(cuid())
  timestamp     DateTime  @default(now())
  userId        String?
  sessionId     String?
  action        String
  resourceType  String
  resourceId    String?
  details       Json
  ipAddress     String
  userAgent     String
  location      Json?
  success       Boolean   @default(true)
  errorMessage  String?
  metadata      Json      @default("{}")

  user User? @relation(fields: [userId], references: [id])

  @@map("audit_logs")
);
```

### Indexes for Performance
```sql
-- Performance indexes
CREATE INDEX idx_audit_timestamp ON "AuditLog" ("timestamp");
CREATE INDEX idx_audit_user ON "AuditLog" ("userId");
CREATE INDEX idx_audit_action ON "AuditLog" ("action");
CREATE INDEX idx_audit_resource ON "AuditLog" ("resourceType", "resourceId");
CREATE INDEX idx_audit_ip ON "AuditLog" ("ipAddress");

-- Composite indexes for common queries
CREATE INDEX idx_audit_user_action ON "AuditLog" ("userId", "action", "timestamp");
CREATE INDEX idx_audit_resource_action ON "AuditLog" ("resourceType", "resourceId", "action");
```

## Logging Implementation

### Centralized Logger
```typescript
class AuditLogger {
  private static instance: AuditLogger;

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async log(event: AuditEvent): Promise<void> {
    try {
      // Enrich event with context
      const enrichedEvent = await this.enrichEvent(event);

      // Store in database
      await prisma.auditLog.create({
        data: enrichedEvent
      });

      // Send to monitoring systems
      await this.sendToMonitoring(enrichedEvent);

      // Check for alerts
      await this.checkForAlerts(enrichedEvent);

    } catch (error) {
      // Fallback logging to prevent audit gaps
      console.error('Audit logging failed:', error);
      await this.fallbackLogging(event);
    }
  }

  private async enrichEvent(event: AuditEvent): Promise<AuditLog> {
    const enriched = { ...event };

    // Add location data
    enriched.location = await this.getLocationFromIP(event.ipAddress);

    // Add session context
    if (event.sessionId) {
      enriched.metadata.sessionInfo = await this.getSessionInfo(event.sessionId);
    }

    return enriched;
  }
}
```

### Usage Examples
```typescript
// Authentication logging
await auditLogger.log({
  userId: user.id,
  action: AuditAction.USER_LOGIN,
  resourceType: ResourceType.USER,
  resourceId: user.id,
  details: {
    description: 'User logged in successfully',
    loginMethod: 'otp'
  },
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
  success: true
});

// Application status change
await auditLogger.log({
  userId: admin.id,
  action: AuditAction.APPLICATION_STATUS_CHANGE,
  resourceType: ResourceType.APPLICATION,
  resourceId: application.id,
  details: {
    description: `Application status changed from ${oldStatus} to ${newStatus}`,
    statusChange: {
      from: oldStatus,
      to: newStatus,
      reason: reason
    }
  },
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
  success: true
});
```

## Query and Analysis

### Audit Log Queries
```typescript
// Get user activity
const userActivity = await prisma.auditLog.findMany({
  where: {
    userId: userId,
    timestamp: {
      gte: startDate,
      lte: endDate
    }
  },
  orderBy: { timestamp: 'desc' }
});

// Get application history
const applicationHistory = await prisma.auditLog.findMany({
  where: {
    resourceType: 'application',
    resourceId: applicationId
  },
  orderBy: { timestamp: 'asc' }
});

// Security incidents
const securityIncidents = await prisma.auditLog.findMany({
  where: {
    action: {
      in: ['rate_limit_exceeded', 'suspicious_activity', 'access_denied']
    },
    timestamp: {
      gte: last24Hours
    }
  }
});
```

### Analytics and Reporting
```typescript
// Daily activity summary
const dailyActivity = await prisma.auditLog.groupBy({
  by: ['action'],
  where: {
    timestamp: {
      gte: startOfDay,
      lte: endOfDay
    }
  },
  _count: true
});

// User behavior analysis
const userBehavior = await prisma.auditLog.groupBy({
  by: ['userId', 'action'],
  where: {
    timestamp: {
      gte: last30Days
    }
  },
  _count: true
});
```

## Security and Compliance

### Data Protection
- **Encryption**: Audit logs encrypted at rest
- **Access Control**: Restricted access to audit data
- **Retention Policies**: Configurable data retention periods
- **Backup**: Regular audit log backups

### Compliance Features
- **GDPR Compliance**: Right to access/delete audit data
- **Data Minimization**: Only necessary audit data collected
- **Anonymization**: Sensitive data anonymized where possible
- **Export Capabilities**: Audit data export for compliance

### Integrity Protection
- **Tamper Detection**: Cryptographic signatures on log entries
- **Chain of Custody**: Secure log transmission and storage
- **Immutability**: Prevention of log entry modifications
- **Verification**: Log integrity verification mechanisms

## Monitoring and Alerts

### Real-time Alerts
```typescript
interface AlertRule {
  id: string;
  name: string;
  condition: AlertCondition;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actions: AlertAction[];
}

const alertRules: AlertRule[] = [
  {
    id: 'failed-login-spike',
    name: 'Failed Login Spike',
    condition: {
      action: 'user_login',
      success: false,
      count: 10,
      timeWindow: 300 // 5 minutes
    },
    severity: 'high',
    actions: ['email_admin', 'log_security_event']
  },
  {
    id: 'bulk-admin-action',
    name: 'Large Bulk Operation',
    condition: {
      action: 'bulk_operation',
      threshold: 100,
      timeWindow: 3600 // 1 hour
    },
    severity: 'medium',
    actions: ['notify_admin']
  }
];
```

### Dashboard Integration
- **Real-time Metrics**: Live audit event monitoring
- **Alert Management**: Active alert tracking and resolution
- **Trend Analysis**: Audit pattern recognition
- **Compliance Reporting**: Automated compliance report generation

## Performance Optimization

### Storage Optimization
- **Partitioning**: Time-based log partitioning
- **Compression**: Automatic log compression
- **Archiving**: Old log archival to cost-effective storage
- **Cleanup**: Automated old log removal

### Query Optimization
- **Indexing Strategy**: Optimized database indexes
- **Caching**: Frequently accessed log data caching
- **Pagination**: Efficient large dataset handling
- **Async Processing**: Non-blocking log writing

### Scalability Features
- **Distributed Logging**: Multi-instance log aggregation
- **Load Balancing**: Log processing load distribution
- **Queue Management**: Asynchronous log processing queues
- **Horizontal Scaling**: Database read replicas for queries

## API Endpoints

### Get Audit Logs
```http
GET /api/admin/audit-logs
Query Parameters:
- userId: Filter by user
- action: Filter by action type
- resourceType: Filter by resource type
- startDate: Start date filter
- endDate: End date filter
- page: Page number
- limit: Items per page
```

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "log_id",
      "timestamp": "2024-01-15T10:30:00Z",
      "userId": "user_id",
      "action": "application_status_change",
      "resourceType": "application",
      "resourceId": "app_id",
      "details": {
        "description": "Application status changed",
        "statusChange": {
          "from": "submitted",
          "to": "under_review"
        }
      },
      "ipAddress": "192.168.1.100",
      "success": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "pages": 25
  }
}
```

### Get Audit Statistics
```http
GET /api/admin/audit-logs/statistics
Query Parameters:
- period: Time period (day, week, month)
- groupBy: Grouping field (action, user, resourceType)
```

**Response:**
```json
{
  "success": true,
  "statistics": {
    "totalEvents": 15420,
    "eventsByAction": {
      "user_login": 2450,
      "application_create": 1890,
      "file_upload": 980
    },
    "eventsByUser": {
      "user_123": 450,
      "user_456": 320
    },
    "securityEvents": 23,
    "errorRate": 0.02
  }
}
```

### Export Audit Logs
```http
GET /api/admin/audit-logs/export
Query Parameters:
- format: Export format (csv, json, pdf)
- filters: Same as GET endpoint
```

## Testing and Validation

### Unit Testing
```typescript
describe('Audit Logger', () => {
  it('should log user login events', async () => {
    const event = createLoginEvent(user, session);
    await auditLogger.log(event);

    const logs = await getAuditLogs({ userId: user.id });
    expect(logs).toContainEqual(expect.objectContaining({
      action: 'user_login',
      success: true
    }));
  });

  it('should handle logging failures gracefully', async () => {
    // Mock database failure
    mockDatabaseFailure();

    const event = createTestEvent();
    await expect(auditLogger.log(event)).resolves.not.toThrow();
  });
});
```

### Integration Testing
```typescript
describe('Audit Trail', () => {
  it('should maintain complete application history', async () => {
    // Create application
    const app = await createApplication(user);

    // Update application multiple times
    await updateApplication(app.id, update1);
    await updateApplication(app.id, update2);
    await submitApplication(app.id);

    // Verify audit trail
    const history = await getApplicationHistory(app.id);
    expect(history).toHaveLength(4); // create + 2 updates + submit
  });
});
```

## Future Enhancements

### Advanced Features
- **Log Analysis AI**: Intelligent pattern recognition
- **Predictive Analytics**: Anomaly detection
- **Real-time Dashboards**: Live audit monitoring
- **Automated Compliance**: Self-auditing systems

### Scalability Improvements
- **Log Streaming**: Real-time log processing pipelines
- **Distributed Storage**: Multi-region log storage
- **Advanced Search**: Full-text search capabilities
- **Data Lake Integration**: Big data analytics integration

This audit logging system ensures complete transparency, security, and compliance for all activities within the FIRST Global Team Kenya application.