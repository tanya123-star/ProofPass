# Proofly

Absolutely. Since you're going to give this to an AI coding agent, the design should be written as a **single source-of-truth specification** that covers the entire lifecycle: **planning → implementation → testing → deployment → maintenance**.

I’d also make the **mandatory timestamped attendance photo** a core security/business rule rather than treating it as a secondary feature.

# LITS Quick Event — Full System Design Specification

**Project Type:** BSIT AI Build
**System:** Web-Based Event Management, QR Attendance Verification, and Evaluation System
**Primary Organization:** LITS
**Primary Users:** Students/Participants, LITS Officers, System Administrator

---

## 1. System Overview

**LITS Quick Event** is a web-based event management system that allows LITS Officers to create and manage events, while students can register for available events, receive event-specific QR codes, and complete attendance verification.

The attendance process requires:

1. Student registration
2. Unique QR code generation
3. QR code scanning by an authorized LITS Officer
4. Attendance timestamp recording
5. Mandatory attendance photo submission
6. Required photo timestamp validation
7. LITS Officer photo verification
8. Attendance confirmation
9. Automatic evaluation availability
10. Student evaluation submission
11. Evaluation result management and reporting

The system should maintain an auditable record of registration, attendance, photo submission, verification, and evaluation activities.

---

# 2. System Goals

The system should:

* Digitize LITS event registration.
* Eliminate manual attendance sheets.
* Generate unique QR codes for registered participants.
* Allow authorized LITS Officers to scan QR codes.
* Record server-side attendance timestamps.
* Require an attendance photo.
* Require a valid timestamp associated with the submitted photo.
* Validate the photo timestamp against the event attendance period.
* Allow LITS Officers to approve or reject attendance photos.
* Prevent students from accessing the evaluation before attendance is verified.
* Allow LITS Officers to create event-specific evaluation forms.
* Provide participant and attendance monitoring.
* Generate reports.
* Maintain audit logs for important system actions.

---

# 3. User Roles

## 3.1 Student

Students can:

* Register/login.
* Complete personal information.
* View available events.
* Register for an event.
* Cancel registration if permitted.
* View registration status.
* View generated QR code.
* Present QR code for attendance.
* Upload attendance photo.
* Submit required photo timestamp information.
* View attendance verification status.
* Complete evaluation after attendance verification.
* View participation history.

Students **cannot**:

* Create events.
* Modify event information.
* Scan attendance.
* Verify their own attendance.
* Approve attendance photos.
* Modify attendance timestamps.
* Modify evaluation results.

---

# 4. LITS Officer

LITS Officers are the primary event managers.

They can:

### Event Management

* Create events.
* Edit events.
* Publish/unpublish events.
* Cancel events.
* Archive events.
* Upload event images.
* Set title.
* Set description.
* Set venue.
* Set date.
* Set start/end time.
* Set registration period.
* Set attendance period.
* Set participant limit.
* Configure participant eligibility.

### Registration Management

* View registered participants.
* Search participants.
* Filter participants.
* Remove/cancel registration where authorized.
* View participant details.

### Attendance

* Scan QR codes.
* Record check-in.
* View attendance status.
* Review submitted photos.
* Verify photos.
* Reject photos.
* Provide rejection reasons.
* Close attendance.

### Evaluation

* Create evaluation forms.
* Add questions.
* Edit questions.
* Reorder questions.
* Set question types.
* Publish/unpublish evaluation.
* View responses.
* Export evaluation results.

---

# 5. System Administrator

The System Administrator manages the platform itself.

Can:

* Manage users.
* Create/deactivate LITS Officer accounts.
* Assign roles.
* Manage system settings.
* View system-wide audit logs.
* Manage security settings.
* Monitor system health.
* Manage backups.
* Handle system maintenance.

The Administrator should **not automatically modify attendance records** without an auditable administrative action.

---

# 6. Core System Workflow

## 6.1 Event Creation

```text
LITS Officer
      ↓
Create Event
      ↓
Enter Event Information
      ↓
Configure Registration
      ↓
Configure Attendance
      ↓
Create Evaluation
      ↓
Save Draft
      ↓
Publish
      ↓
Event Becomes Available
```

---

# 7. Event Information

Each event should contain:

```text
Event
├── Event ID
├── Title
├── Description
├── Event Image
├── Venue
├── Event Date
├── Start Time
├── End Time
├── Registration Opens
├── Registration Closes
├── Attendance Opens
├── Attendance Closes
├── Maximum Participants
├── Participant Eligibility
├── Event Status
├── Created By
├── Created At
└── Updated At
```

### Event status

Use controlled values:

```text
DRAFT
PUBLISHED
ONGOING
COMPLETED
CANCELLED
ARCHIVED
```

---

# 8. Participant Eligibility

The LITS Officer should be able to configure who can register.

Possible options:

### Open

```text
All registered students
```

### Organization-specific

```text
LITS members only
```

### Course/program

```text
BSIT
BSCS
etc.
```

### Year level

```text
1st Year
2nd Year
3rd Year
4th Year
```

### Limited participants

```text
Maximum participants: 100
```

The system must prevent registration after the configured capacity is reached.

---

# 9. Student Registration

The student opens an event:

```text
EVENT

LITS AI BUILD 2026

September 30, 2026
1:00 PM – 5:00 PM

87 / 100 participants

[ REGISTER ]
```

The student provides/uses:

* Student ID
* Full name
* Email
* Contact information
* Course/program
* Year level
* Other required information configured by the system

The system should prevent duplicate registration.

---

# 10. QR Code Generation

After successful registration:

```text
Registration Created
        ↓
Generate Unique QR Token
        ↓
Associate Token With
Student + Event + Registration
        ↓
Display QR Code
```

Example:

```text
Registration ID:
REG-2026-000145

Event:
LITS AI BUILD 2026

Student:
Juan Dela Cruz

QR:
[GENERATED QR CODE]
```

### Security requirement

Do **not** place sensitive student information directly inside the QR code.

The QR should contain a secure, unique registration identifier/token.

Example:

```text
registration_token = securely_generated_random_value
```

The backend resolves the token to the appropriate registration.

---

# 11. QR Attendance

Only authorized LITS Officers can access the attendance scanner.

```text
LITS Officer
      ↓
Select Event
      ↓
Open QR Scanner
      ↓
Scan Student QR
      ↓
Validate Registration
      ↓
Validate Event
      ↓
Validate Attendance Window
      ↓
Create Attendance Record
```

The system should reject:

* Invalid QR.
* Unknown registration.
* Registration for another event.
* Cancelled registration.
* Duplicate attendance.
* Unauthorized scanner.
* Attendance outside the configured window, unless the officer has explicit override permission.

---

# 12. Attendance Record

The attendance record should contain:

```text
Attendance
├── Attendance ID
├── Registration ID
├── Event ID
├── Student ID
├── Check-in Timestamp
├── Checked-in By
├── Photo Status
├── Photo Timestamp
├── Photo Upload Timestamp
├── Verification Status
├── Verified By
├── Verified At
├── Rejection Reason
└── Created At
```

---

# 13. Mandatory Attendance Photo

This is a **required business rule**.

After successful QR scanning:

```text
QR SCANNED ✓

Attendance recorded.

Please upload your attendance
verification photo.

PHOTO REQUIRED

[ Upload Photo ]

Photo Timestamp:
[ REQUIRED ]

[ SUBMIT ]
```

The student cannot complete attendance verification without:

* Photo
* Required timestamp

---

# 14. Photo Timestamp Validation

The system should distinguish:

### QR Scan Timestamp

Generated by the server:

```text
13:42:18
```

### Photo Timestamp

The timestamp associated with the submitted photo:

```text
13:45:03
```

### Upload Timestamp

Generated by the server:

```text
13:46:12
```

These are separate values.

---

# 15. Photo Timestamp Rules

Suppose the event has:

```text
Attendance Opens:
1:00 PM

Attendance Closes:
5:00 PM
```

A valid photo might be:

```text
Photo timestamp:
2:15 PM

Result:
VALID
```

An invalid photo:

```text
Photo timestamp:
7:45 PM

Result:
INVALID

Reason:
Photo timestamp is outside the
attendance period.
```

The system should also detect:

```text
Photo timestamp < QR scan timestamp
```

and flag it for review rather than automatically trusting it.

---

# 16. Important Security Consideration

Do **not** treat a timestamp entered manually by the student as inherently trustworthy.

Ideally:

```text
Photo
 ↓
Extract available metadata
 ↓
Read timestamp
 ↓
Validate timestamp
 ↓
Store original photo
 ↓
Store server upload timestamp
 ↓
LITS Officer reviews
```

If the platform cannot reliably extract a timestamp from the image itself, the UI should clearly distinguish:

> **Photo timestamp supplied by participant**

from:

> **Server upload timestamp**

The server upload timestamp should always be authoritative for when the system received the file.

This prevents the system from falsely claiming that a manually entered timestamp proves when a photo was actually taken.

---

# 17. Photo Verification

LITS Officer sees:

```text
ATTENDANCE VERIFICATION

Student:
Juan Dela Cruz

QR Scan:
1:42 PM

Photo Timestamp:
1:45 PM

Uploaded:
1:46 PM

Photo:
[ IMAGE ]

Status:
PENDING

[ VERIFY ] [ REJECT ]
```

If rejected:

```text
Rejection Reason:
[ Photo does not clearly show event participation ]

[ REJECT ATTENDANCE ]
```

The student should be notified that verification was rejected.

---

# 18. Attendance Status

Use controlled statuses:

```text
REGISTERED
CHECKED_IN
PHOTO_PENDING
UNDER_REVIEW
VERIFIED
REJECTED
CANCELLED
```

Example:

```text
REGISTERED
     ↓
CHECKED_IN
     ↓
PHOTO_PENDING
     ↓
UNDER_REVIEW
     ↓
VERIFIED
```

Alternative:

```text
UNDER_REVIEW
     ↓
REJECTED
     ↓
RESUBMISSION
     ↓
UNDER_REVIEW
```

---

# 19. Evaluation Unlocking

This is another major business rule.

The evaluation should **not** simply be available because the student registered.

Instead:

```text
Registration
      ↓
QR Scanned
      ↓
Photo Submitted
      ↓
Photo Verified
      ↓
Attendance Confirmed
      ↓
Evaluation Unlocked
```

Before verification:

```text
Evaluation

🔒 Evaluation unavailable.

Your attendance must be verified
before you can complete the evaluation.
```

After verification:

```text
Attendance: ✓ VERIFIED

Evaluation:
AVAILABLE

[ COMPLETE EVALUATION ]
```

---

# 20. Evaluation Builder

LITS Officers can create event-specific evaluations.

Question types:

* Rating scale
* Multiple choice
* Checkbox
* Short answer
* Long answer

Example:

```text
EVENT EVALUATION

1. How would you rate the event organization?
   1  2  3  4  5

2. How useful was the event?
   1  2  3  4  5

3. What did you like about the event?
   [________________________]

4. What can be improved?
   [________________________]
```

---

# 21. Evaluation Rules

The system should enforce:

* Only eligible attendees can answer.
* One evaluation submission per student per event.
* Required questions must be answered.
* Submission timestamp is recorded.
* Student cannot modify a submitted evaluation unless the officer explicitly enables editing.
* Evaluation results are accessible to authorized LITS Officers.

---

# 22. Dashboard

## Student Dashboard

```text
Dashboard
│
├── Upcoming Events
├── My Registrations
├── My QR Codes
├── Attendance Status
├── Pending Evaluations
└── Event History
```

## LITS Dashboard

```text
Dashboard
│
├── Total Events
├── Upcoming Events
├── Registered Participants
├── Today's Attendance
├── Pending Verification
├── Pending Evaluations
└── Quick Actions
```

---

# 23. Reports

LITS Officers should eventually be able to generate:

### Event Participant Report

```text
Student ID
Name
Course
Year
Registration Date
Registration Status
```

### Attendance Report

```text
Student
QR Scan Time
Photo Timestamp
Upload Time
Verification Status
Verified By
```

### Evaluation Report

```text
Question
Responses
Average Rating
Comments
```

Reports can eventually support:

* CSV
* Excel
* PDF

For the AI Build MVP, CSV export is enough if time is limited.

---

# 24. Notifications

Recommended notifications:

### Student

* Registration successful.
* Event reminder.
* QR code available.
* Attendance successfully recorded.
* Photo rejected.
* Photo verified.
* Evaluation available.
* Evaluation submitted.

### Officer

* New registration.
* Attendance photo awaiting verification.
* Evaluation response received.

---

# 25. Audit Log

Because attendance is a verification system, an audit log is valuable.

Record actions such as:

```text
WHO
WHAT
WHEN
TARGET
RESULT
```

Example:

```text
LITS Officer: officer01
Action: VERIFIED_ATTENDANCE
Student: STU-00145
Event: EVT-0001
Time: 4:32 PM
```

Other actions:

```text
CREATE_EVENT
UPDATE_EVENT
PUBLISH_EVENT
REGISTER_EVENT
GENERATE_QR
SCAN_QR
UPLOAD_PHOTO
VERIFY_ATTENDANCE
REJECT_ATTENDANCE
CREATE_EVALUATION
SUBMIT_EVALUATION
```

---

# 26. Recommended Database Architecture

At minimum:

```text
users
students
events
event_participants
attendance
attendance_photos
evaluations
evaluation_questions
evaluation_responses
notifications
audit_logs
```

### Relationships

```text
USER
 │
 └── STUDENT
       │
       └── EVENT PARTICIPATION
                │
                ├── QR TOKEN
                │
                └── ATTENDANCE
                       │
                       └── ATTENDANCE PHOTO


EVENT
 │
 ├── PARTICIPANTS
 ├── ATTENDANCE
 └── EVALUATION
        │
        ├── QUESTIONS
        └── RESPONSES
```

---

# 27. Suggested Technology Stack

For a BSIT AI Build, keep the stack straightforward.

### Frontend

**React + TypeScript**

### Backend

**Node.js + Express**

### Database

**PostgreSQL**

### Authentication

Either:

* Google OAuth
* Email/password
* School account authentication

### QR

A reliable QR generation/scanning library.

### File Storage

Use object/file storage rather than storing large image binaries directly in the database.

### Deployment

For example:

```text
Frontend
    ↓
Web Hosting

Backend
    ↓
Cloud Server

Database
    ↓
Managed PostgreSQL

Images
    ↓
Object/File Storage
```

The exact provider can be selected during implementation based on your team's existing tools and budget.

---

# 28. Project Architecture

Use a clean separation:

```text
┌───────────────────────────────┐
│          FRONTEND             │
│ React + TypeScript            │
│                               │
│ Student UI                    │
│ Officer Dashboard             │
│ QR Scanner                    │
│ Event Management              │
│ Evaluation UI                 │
└───────────────┬───────────────┘
                │ HTTPS
                ▼
┌───────────────────────────────┐
│           BACKEND             │
│ Node.js + Express             │
│                               │
│ Authentication                │
│ RBAC                          │
│ Event Service                 │
│ Registration Service          │
│ QR Service                    │
│ Attendance Service             │
│ Photo Verification            │
│ Evaluation Service            │
│ Notification Service          │
│ Audit Service                 │
└───────────────┬───────────────┘
                │
       ┌────────┴────────┐
       ▼                 ▼
┌──────────────┐  ┌───────────────┐
│ PostgreSQL   │  │ File Storage  │
│              │  │               │
│ Application  │  │ Attendance    │
│ Data         │  │ Photos        │
└──────────────┘  └───────────────┘
```

---

# 29. Development Plan

Give the coding agent this development order.

### Phase 1 — Planning

Produce:

* Requirements specification
* User roles
* User stories
* Use cases
* Database ERD
* System architecture
* API specification
* UI wireframes
* Security rules
* Testing strategy

**Do not begin implementation until the architecture and business rules are consistent.**

---

### Phase 2 — Project Setup

Implement:

* Repository
* Frontend
* Backend
* Database
* Environment configuration
* Authentication
* Basic RBAC
* Logging
* Error handling

---

### Phase 3 — Event Management

Implement:

* Event CRUD
* Event publishing
* Event status
* Registration windows
* Attendance windows
* Participant limits
* Eligibility rules
* Event image upload

---

### Phase 4 — Registration

Implement:

* Student registration
* Duplicate prevention
* Participant management
* Registration status
* QR generation
* QR display

---

### Phase 5 — Attendance

Implement:

* Officer QR scanner
* QR validation
* Server timestamp
* Attendance record
* Duplicate scan prevention
* Photo upload
* Required photo timestamp
* Timestamp validation
* Photo review
* Approve/reject
* Rejection reason

This is the **highest-priority workflow** after registration.

---

### Phase 6 — Evaluation

Implement:

* Evaluation builder
* Questions
* Required fields
* Publishing
* Attendance-based access control
* Student submission
* Response storage
* Results

---

### Phase 7 — Reports

Implement:

* Participant report
* Attendance report
* Verification report
* Evaluation report
* CSV export

---

### Phase 8 — Notifications & Audit

Implement:

* In-app notifications
* Optional email notifications
* Audit logs
* Notification preferences

---

# 30. Testing Strategy

The agent should test at multiple levels.

### Unit Testing

Test:

* QR token generation
* Registration validation
* Timestamp validation
* Attendance rules
* Evaluation unlocking
* RBAC
* Event capacity

### Integration Testing

Test:

```text
Registration → QR → Scan → Photo → Verification → Evaluation
```

### Security Testing

Test:

* Unauthorized access
* Role escalation
* Invalid QR
* Reused QR
* Duplicate attendance
* File upload validation
* Malicious file types
* API authorization
* Session/token security

### UI Testing

Test:

* Desktop
* Tablet
* Mobile
* QR scanner interface
* Upload interface
* Officer dashboard

### User Acceptance Testing

Have actual student participants and LITS Officers test the system.

---

# 31. Critical Acceptance Tests

The following should **all pass** before deployment.

### Test 1 — Registration

```text
Student registers
→ registration created
→ QR generated
```

### Test 2 — Duplicate Registration

```text
Student registers again
→ system rejects duplicate
```

### Test 3 — QR

```text
Valid QR
→ attendance process starts
```

### Test 4 — Invalid QR

```text
Invalid QR
→ attendance rejected
```

### Test 5 — Photo Requirement

```text
QR scanned
→ no photo
→ verification cannot proceed
```

### Test 6 — Timestamp Requirement

```text
Photo uploaded
→ required timestamp missing
→ submission rejected
```

### Test 7 — Invalid Timestamp

```text
Photo timestamp outside event window
→ flagged/rejected
```

### Test 8 — Verification

```text
Valid photo
→ LITS verifies
→ attendance becomes VERIFIED
```

### Test 9 — Evaluation Lock

```text
Attendance not verified
→ evaluation unavailable
```

### Test 10 — Evaluation Unlock

```text
Attendance verified
→ evaluation available
```

### Test 11 — RBAC

```text
Student attempts officer endpoint
→ 403 / unauthorized
```

### Test 12 — Duplicate Attendance

```text
Same QR scanned again
→ duplicate attendance prevented
```

---

# 32. Deployment Checklist

Before production:

```text
☐ Environment variables configured
☐ Production database created
☐ Database migrations completed
☐ File storage configured
☐ Authentication configured
☐ HTTPS enabled
☐ CORS configured
☐ RBAC verified
☐ QR scanner tested
☐ Photo upload tested
☐ Timestamp validation tested
☐ Evaluation workflow tested
☐ Error handling tested
☐ Audit logging enabled
☐ Database backup configured
☐ Production seed/admin account created
☐ Monitoring/logging configured
```

---

# 33. Maintenance Plan

After deployment:

### Daily

Monitor:

* Server errors
* Failed uploads
* Failed QR scans
* Authentication problems

### Weekly

Review:

* Audit logs
* Database health
* Storage usage
* User feedback
* Attendance anomalies

### Monthly

Perform:

* Dependency updates
* Security review
* Database backup verification
* Performance review
* Feature review

---

# 34. MVP vs Future Features

To prevent the AI agent from overbuilding, explicitly separate these.

### MVP

```text
✓ Authentication
✓ RBAC
✓ Event CRUD
✓ Student registration
✓ QR generation
✓ QR scanning
✓ Attendance timestamp
✓ Required photo
✓ Required photo timestamp
✓ Photo verification
✓ Attendance status
✓ Evaluation builder
✓ Evaluation submission
✓ Basic reports
✓ Audit log
```

### Future

```text
○ Certificates
○ Advanced analytics
○ Automated certificate generation
○ Push notifications
○ Calendar integration
○ Facial recognition
○ Geolocation verification
○ AI-generated event summaries
○ AI evaluation analysis
○ Advanced attendance analytics
○ Multiple organization support
```

I would **not add facial recognition or GPS verification to the first version**. Your QR + server timestamp + required timestamped photo + LITS verification already provides a clear and testable attendance workflow.

---

# 35. Definition of Done

The AI coding agent should consider the project complete only when:

> A student can register for an available event, receive a unique event-specific QR code, have the QR code scanned by an authorized LITS Officer, submit a required attendance photo with a required timestamp, have the timestamp validated against the configured attendance period, have the photo reviewed and verified by the LITS Officer, and automatically gain access to the event's evaluation form after successful attendance verification.

And the LITS Officer must be able to:

> Create and manage events, configure registration and attendance periods, configure eligible participants, manage registrations, scan QR codes, review and verify attendance photos, manage evaluations, view attendance and evaluation results, and access auditable system records.

---

## The instruction I would give the AI coding agent

You can give the agent the specification above, but **don't tell it to immediately start coding everything**. Tell it to work in controlled phases:

```text
You are the lead software engineer for this project.

Build the LITS Quick Event system according to the provided system
specification.

Do NOT immediately implement the entire system.

First:
1. Analyze the requirements.
2. Identify ambiguities and contradictions.
3. Produce the proposed architecture.
4. Produce the database schema/ERD.
5. Produce the RBAC matrix.
6. Produce the API/module structure.
7. Produce the implementation plan.
8. Produce the testing strategy.
9. Identify security risks and mitigation.
10. Identify assumptions that require confirmation.

After the planning phase is internally consistent, implement the
system incrementally.

For every implementation phase:
- Write/modify the code.
- Run tests.
- Run lint/type checks.
- Verify database migrations.
- Verify authorization.
- Verify error handling.
- Report what was implemented.
- Report tests performed.
- Report failures and fixes.
- Do not mark a feature complete if its tests are failing.

The mandatory attendance workflow is:

Student Registration
→ Event-Specific QR Generation
→ LITS Officer QR Scan
→ Server-Side Check-in Timestamp
→ Mandatory Attendance Photo
→ Mandatory Photo Timestamp
→ Timestamp Validation
→ LITS Officer Verification
→ Attendance Confirmed
→ Evaluation Unlocked.

Never bypass attendance verification to make the evaluation available.

Never trust client-provided timestamps as authoritative.
Always preserve the server upload timestamp.
Do not expose sensitive student information in QR codes.
Enforce RBAC on the backend, not only in the frontend.

Prioritize security, data integrity, maintainability, validation,
error handling, accessibility, and testability.

Development lifecycle:

PLAN
→ DESIGN
→ IMPLEMENT
→ TEST
→ REVIEW
→ DEPLOY
→ MONITOR
→ MAINTAIN.

Keep the implementation modular and avoid unnecessary features
outside the defined MVP.
```

**One architectural decision I strongly recommend:** make the **backend the authority for event windows, attendance status, authorization, and server timestamps**. The frontend should display and collect information, but it should never be trusted to decide whether a student is officially attended or whether an evaluation should be unlocked.
