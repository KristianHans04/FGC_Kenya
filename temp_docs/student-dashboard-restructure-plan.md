# Student Dashboard Restructure - Implementation Plan
**Date:** 2026-01-04  
**Project:** FIRST Global Team Kenya Platform  
**Scope:** Complete restructure of student dashboard and related features

---

## Executive Summary

The current student dashboard contains inappropriate "vibecoded" features (modules, training progress bars, achievements) that don't align with a robotics team's actual workflow. This plan outlines a complete restructure to create a proper robotics team management system with:

1. **Calendar System** - Event scheduling, task management, meeting coordination
2. **Universal Profile Pages** - Profile pages for all user roles
3. **Robotics-Focused Dashboard** - Team collaboration, project tracking, resource sharing
4. **Proper Data Persistence** - Remove hardcoded mock data, implement real database integration

---

## Phase 1: Database Schema Updates

### 1.1 Calendar & Events Schema
**File:** `prisma/schema.prisma`

Add new models:
```prisma
model CalendarEvent {
  id          String   @id @default(uuid())
  slug        String   @unique @default(cuid())
  title       String
  description String?
  type        EventType @default(MEETING)
  
  startDate   DateTime
  endDate     DateTime
  allDay      Boolean  @default(false)
  
  location    String?
  isVirtual   Boolean  @default(false)
  meetingLink String?
  
  // Visibility
  isPublic    Boolean  @default(false)
  
  // Relations
  createdById String
  createdBy   User     @relation("CreatedEvents", fields: [createdById], references: [id])
  
  attendees   EventAttendee[]
  reminders   EventReminder[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([startDate])
  @@index([createdById])
  @@index([type])
}

enum EventType {
  MEETING
  WORKSHOP
  COMPETITION
  PRACTICE
  DEADLINE
  TEAM_BUILD
  OTHER
}

model EventAttendee {
  id        String   @id @default(uuid())
  eventId   String
  event     CalendarEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation("EventAttendees", fields: [userId], references: [id], onDelete: Cascade)
  status    AttendeeStatus @default(PENDING)
  respondedAt DateTime?
  
  @@unique([eventId, userId])
  @@index([userId])
}

enum AttendeeStatus {
  PENDING
  ACCEPTED
  DECLINED
  MAYBE
}

model EventReminder {
  id        String   @id @default(uuid())
  eventId   String
  event     CalendarEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)
  userId    String
  reminderAt DateTime
  sent      Boolean  @default(false)
  sentAt    DateTime?
  
  @@index([reminderAt, sent])
}

model Task {
  id          String   @id @default(uuid())
  slug        String   @unique @default(cuid())
  title       String
  description String?
  priority    TaskPriority @default(MEDIUM)
  status      TaskStatus @default(TODO)
  
  dueDate     DateTime?
  completedAt DateTime?
  
  // Assignment
  assignedToId String?
  assignedTo   User? @relation("AssignedTasks", fields: [assignedToId], references: [id])
  
  createdById String
  createdBy   User @relation("CreatedTasks", fields: [createdById], references: [id])
  
  tags        String[]
  attachments Json?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([status])
  @@index([assignedToId])
  @@index([dueDate])
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  COMPLETED
  CANCELLED
}

model TeamResource {
  id          String   @id @default(uuid())
  slug        String   @unique @default(cuid())
  title       String
  description String?
  category    ResourceCategory
  
  fileUrl     String?
  linkUrl     String?
  content     String?  // For text/markdown content
  
  tags        String[]
  isPinned    Boolean  @default(false)
  
  uploadedById String
  uploadedBy   User @relation("UploadedResources", fields: [uploadedById], references: [id])
  
  views       Int      @default(0)
  downloads   Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([category])
  @@index([isPinned])
}

enum ResourceCategory {
  TUTORIAL
  DOCUMENTATION
  CODE_SAMPLE
  DESIGN_FILE
  COMPETITION_INFO
  RESEARCH
  OTHER
}
```

### 1.2 Update User Model
**File:** `prisma/schema.prisma`

Add relations to User model:
```prisma
// Add to User model relations:
createdEvents     CalendarEvent[]  @relation("CreatedEvents")
eventAttendances  EventAttendee[]  @relation("EventAttendees")
assignedTasks     Task[]          @relation("AssignedTasks")
createdTasks      Task[]          @relation("CreatedTasks")
uploadedResources TeamResource[]  @relation("UploadedResources")
```

---

## Phase 2: API Routes Implementation

### 2.1 Calendar API Routes

#### `/app/api/calendar/events/route.ts`
- GET: Fetch events (with filters: date range, type, user)
- POST: Create new event (ADMIN/SUPER_ADMIN only)
- PATCH: Update event
- DELETE: Delete event

#### `/app/api/calendar/events/[id]/route.ts`
- GET: Get single event
- PATCH: Update event
- DELETE: Delete event

#### `/app/api/calendar/events/[id]/rsvp/route.ts`
- POST: RSVP to event (accept/decline/maybe)

### 2.2 Tasks API Routes

#### `/app/api/tasks/route.ts`
- GET: Fetch tasks (with filters: status, assigned user, due date)
- POST: Create new task
- PATCH: Update task status

#### `/app/api/tasks/[id]/route.ts`
- GET: Get single task
- PATCH: Update task
- DELETE: Delete task

### 2.3 Resources API Routes

#### `/app/api/resources/route.ts`
- GET: Fetch resources (with filters: category, tags)
- POST: Upload new resource

#### `/app/api/resources/[id]/route.ts`
- GET: Get single resource
- PATCH: Update resource
- DELETE: Delete resource

### 2.4 Profile API Routes

#### `/app/api/profile/[slug]/route.ts`
- GET: Get user profile (public info)
- PATCH: Update own profile

---

## Phase 3: Component Development

### 3.1 Calendar Components

#### `/app/components/calendar/CalendarView.tsx`
- Monthly calendar grid
- Event display
- Date navigation
- Event filtering

#### `/app/components/calendar/EventCard.tsx`
- Event display card
- RSVP buttons
- Event details

#### `/app/components/calendar/EventForm.tsx`
- Create/edit event form
- Date/time pickers
- Attendee selection
- Meeting link input

#### `/app/components/calendar/DayView.tsx`
- Single day events list
- Time slots
- Quick event creation

### 3.2 Task Components

#### `/app/components/tasks/TaskList.tsx`
- Task list with filters
- Status columns (Kanban view)
- Drag-and-drop support

#### `/app/components/tasks/TaskCard.tsx`
- Task display card
- Status badges
- Priority indicators

#### `/app/components/tasks/TaskForm.tsx`
- Create/edit task form
- Assignment dropdown
- Due date picker

### 3.3 Profile Components

#### `/app/components/profile/ProfileView.tsx`
- Universal profile display
- Role-based sections
- Edit mode toggle

#### `/app/components/profile/ProfileHeader.tsx`
- Avatar, name, role
- Contact info
- Social links

#### `/app/components/profile/ProfileStats.tsx`
- Contribution stats
- Activity summary
- Achievement display (optional)

### 3.4 Resource Components

#### `/app/components/resources/ResourceGrid.tsx`
- Resource cards grid
- Category filters
- Search functionality

#### `/app/components/resources/ResourceCard.tsx`
- Resource preview
- Download/view buttons
- Metadata display

#### `/app/components/resources/ResourceUpload.tsx`
- File upload form
- Metadata input
- Preview generation

---

## Phase 4: Page Restructure

### 4.1 Remove Unnecessary Pages

**DELETE:**
- `/app/(dashboard)/(student)/student/training/` (entire directory)
- `/app/(dashboard)/(student)/student/achievements/` (entire directory)
- `/app/api/student/modules/route.ts`

### 4.2 Create New Pages

#### `/app/(dashboard)/(student)/student/calendar/page.tsx`
- Calendar view
- Event list
- Quick create button
- Filter options

#### `/app/(dashboard)/(student)/student/tasks/page.tsx`
- Task board (Kanban style)
- My tasks view
- Create task button

#### `/app/(dashboard)/(student)/student/page.tsx` (Update)
- Dashboard overview
- Upcoming events widget
- My tasks widget
- Recent resources
- Team activity feed

#### `/app/(dashboard)/(student)/student/profile/page.tsx` (Update)
- Own profile view/edit
- Settings integration

### 4.3 Update Existing Pages

#### `/app/(dashboard)/(student)/student/team/page.tsx`
- Fix undefined errors
- Remove hardcoded data
- Connect to real API
- Add team collaboration features

#### `/app/(dashboard)/(student)/student/resources/page.tsx`
- Connect to resources API
- Add upload functionality
- Remove hardcoded data

#### `/app/(dashboard)/(student)/student/media/page.tsx`
- Keep as is (if relevant)
- Connect to actual media API

### 4.4 Universal Profile Pages

#### `/app/(dashboard)/profile/[slug]/page.tsx`
- Universal profile route for all roles
- Role-specific content sections
- Privacy controls

---

## Phase 5: Admin Dashboard Updates

### 5.1 Calendar Management

#### `/app/(dashboard)/(admin)/admin/calendar/page.tsx`
- Full calendar management
- Create/edit/delete events
- Manage attendees
- Event analytics

### 5.2 Task Management

#### `/app/(dashboard)/(admin)/admin/tasks/page.tsx`
- View all tasks
- Assign tasks to users
- Task analytics
- Bulk operations

### 5.3 Resource Management

#### `/app/(dashboard)/(admin)/admin/resources/page.tsx`
- Approve/moderate resources
- Featured resources
- Resource analytics

---

## Phase 6: Other Role Dashboards

### 6.1 Mentor Dashboard

#### `/app/(dashboard)/(mentor)/mentor/calendar/page.tsx`
- View events
- Create mentor-specific events

#### `/app/(dashboard)/(mentor)/mentor/tasks/page.tsx`
- View/create tasks
- Assign tasks to students

#### `/app/(dashboard)/(mentor)/mentor/students/page.tsx`
- Student progress view
- Mentorship tracking

### 6.2 Alumni Dashboard

#### `/app/(dashboard)/(alumni)/alumni/calendar/page.tsx`
- View public events
- RSVP to events

#### `/app/(dashboard)/(alumni)/alumni/resources/page.tsx`
- Access resources
- Share alumni experiences

### 6.3 User (Applicant) Dashboard

#### `/app/(dashboard)/(user)/dashboard/calendar/page.tsx`
- View public events
- Competition schedules

---

## Phase 7: Integration & Testing

### 7.1 Database Migration
```bash
npx prisma migrate dev --name add_calendar_tasks_resources
npx prisma generate
```

### 7.2 Seed Data
Create seed script for:
- Sample events
- Sample tasks
- Sample resources
- Test user profiles

### 7.3 Build & Test
```bash
npm run build
```

---

## Implementation Order

### Priority 1 (Critical)
1. Fix team page undefined errors
2. Database schema updates
3. Calendar API routes
4. Tasks API routes
5. Profile API routes

### Priority 2 (High)
6. Calendar components
7. Task components
8. Student calendar page
9. Student tasks page
10. Universal profile pages

### Priority 3 (Medium)
11. Resources API updates
12. Resource components
13. Student dashboard update
14. Admin calendar management
15. Admin task management

### Priority 4 (Low)
16. Mentor dashboard updates
17. Alumni dashboard updates
18. User dashboard updates
19. Advanced features (drag-drop, notifications)
20. Analytics & reporting

---

## Files to Modify/Create (Summary)

### Database
- `prisma/schema.prisma` - Add new models

### API Routes (Create)
- `/app/api/calendar/events/route.ts`
- `/app/api/calendar/events/[id]/route.ts`
- `/app/api/calendar/events/[id]/rsvp/route.ts`
- `/app/api/tasks/route.ts`
- `/app/api/tasks/[id]/route.ts`
- `/app/api/resources/route.ts` (update)
- `/app/api/resources/[id]/route.ts`
- `/app/api/profile/[slug]/route.ts`

### API Routes (Delete)
- `/app/api/student/modules/route.ts`

### Components (Create)
- `/app/components/calendar/CalendarView.tsx`
- `/app/components/calendar/EventCard.tsx`
- `/app/components/calendar/EventForm.tsx`
- `/app/components/calendar/DayView.tsx`
- `/app/components/tasks/TaskList.tsx`
- `/app/components/tasks/TaskCard.tsx`
- `/app/components/tasks/TaskForm.tsx`
- `/app/components/profile/ProfileView.tsx`
- `/app/components/profile/ProfileHeader.tsx`
- `/app/components/profile/ProfileStats.tsx`
- `/app/components/resources/ResourceGrid.tsx`
- `/app/components/resources/ResourceCard.tsx`
- `/app/components/resources/ResourceUpload.tsx`

### Pages (Delete)
- `/app/(dashboard)/(student)/student/training/` (directory)
- `/app/(dashboard)/(student)/student/achievements/` (directory)

### Pages (Create)
- `/app/(dashboard)/(student)/student/calendar/page.tsx`
- `/app/(dashboard)/(student)/student/tasks/page.tsx`
- `/app/(dashboard)/profile/[slug]/page.tsx`
- `/app/(dashboard)/(admin)/admin/calendar/page.tsx`
- `/app/(dashboard)/(admin)/admin/tasks/page.tsx`
- `/app/(dashboard)/(mentor)/mentor/calendar/page.tsx`
- `/app/(dashboard)/(mentor)/mentor/tasks/page.tsx`
- `/app/(dashboard)/(alumni)/alumni/calendar/page.tsx`
- `/app/(dashboard)/(user)/dashboard/calendar/page.tsx`

### Pages (Update)
- `/app/(dashboard)/(student)/student/page.tsx`
- `/app/(dashboard)/(student)/student/team/page.tsx`
- `/app/(dashboard)/(student)/student/resources/page.tsx`
- `/app/(dashboard)/(student)/student/profile/page.tsx`

---

## Design Guidelines Compliance

### Tailwind V4 Theming
- Use semantic color classes: `bg-card`, `text-card-foreground`, `border-border`
- No hardcoded colors with dark mode variants
- CSS variables for all colors

### Security
- Authentication on all API routes
- Role-based authorization
- Input validation with Zod
- Rate limiting on create/update operations
- SQL injection prevention (Prisma handles this)

### Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- Proper heading hierarchy
- Color contrast compliance
- Focus states on all inputs

### Mobile Responsiveness
- Mobile-first design
- Touch targets min 44x44px
- Responsive calendar layout
- Swipe gestures for calendar navigation

### 60/30/10 Rule
- 60% - Background colors (bg-background, bg-card)
- 30% - Content areas (bg-muted, text-muted-foreground)
- 10% - Accent colors (bg-primary, border-primary)

### No Emojis
- Use Lucide icons only
- Professional text throughout
- No emoji in data or UI

---

## Success Criteria

✅ All undefined errors fixed  
✅ No hardcoded mock data  
✅ Calendar system fully functional  
✅ Task management operational  
✅ Universal profile pages working  
✅ All role dashboards updated  
✅ Database properly seeded  
✅ npm run build succeeds  
✅ TypeScript compilation passes  
✅ All security measures implemented  
✅ Mobile responsive on all pages  
✅ Dark mode working correctly  
✅ Accessibility standards met  

---

## Estimated Scope

- **Files to Create:** ~35
- **Files to Modify:** ~15
- **Files to Delete:** ~5
- **Database Models:** 8 new models
- **API Routes:** 12 new routes
- **Components:** 15 new components

---

## Next Steps

Upon approval, implementation will proceed in the order specified in "Implementation Order" section, completing each feature fully before moving to the next. No documentation will be created during implementation - only code. Final build verification will ensure 100% completion.

---

**End of Implementation Plan**
