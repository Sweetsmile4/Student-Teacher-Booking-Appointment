# SYSTEM ARCHITECTURE DOCUMENT

## 1. SYSTEM OVERVIEW

The Student-Teacher Booking Appointment System is a web-based application designed to facilitate efficient scheduling of appointments between students and teachers in an educational institution.

### System Goals
- Enable students to search and book appointments with teachers
- Provide teachers with appointment management capabilities
- Allow administrators to manage users and system configuration
- Ensure secure authentication and authorization
- Maintain comprehensive audit logs of all actions

---

## 2. ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Student    │  │   Teacher    │  │    Admin     │      │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Student     │  │  Teacher     │  │   Admin      │      │
│  │  Module      │  │  Module      │  │   Module     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Auth Service  │  Logger Utility  │  Utilities   │       │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                            │
│         Firebase (Auth, Firestore, Storage)                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                           │
│  Firestore Collections:
│  - users (students, teachers, admins)
│  - appointments
│  - messages
│  - logs
└─────────────────────────────────────────────────────────────┘
```

---

## 3. DATA MODEL

### Collections in Firestore

#### users Collection
```json
{
  "uid": "user-unique-id",
  "email": "user@example.com",
  "displayName": "User Name",
  "role": "student|teacher|admin",
  "department": "Computer Science",
  "subject": "Data Structures",
  "phone": "555-1234",
  "createdAt": Timestamp,
  "updatedAt": Timestamp,
  "approved": boolean,
  "approvedAt": Timestamp,
  "approvedBy": "admin-uid",
  "availability": ["Mon 09:00-10:00", "Wed 10:30-11:30"]
}
```

#### appointments Collection
```json
{
  "studentId": "student-uid",
  "teacherId": "teacher-uid",
  "date": "2026-03-25",
  "time": "10:00",
  "purpose": "Project discussion",
  "status": "pending|approved|cancelled|completed",
  "createdAt": Timestamp,
  "updatedAt": Timestamp,
  "approvedAt": Timestamp,
  "approvedBy": "teacher-uid",
  "cancelledAt": Timestamp,
  "cancelledBy": "user-uid",
  "cancellationReason": "Teacher unavailable"
}
```

#### messages Collection
```json
{
  "senderId": "sender-uid",
  "senderRole": "student|teacher",
  "teacherId": "teacher-uid",
  "appointmentId": "appointment-id",
  "message": "Message content",
  "read": boolean,
  "readAt": Timestamp,
  "createdAt": Timestamp
}
```

#### logs Collection (Auto-generated)
```json
{
  "timestamp": Timestamp,
  "level": "INFO|ERROR|WARN|DEBUG",
  "message": "Log message",
  "userId": "user-uid",
  "data": {},
  "userAgent": "Browser info"
}
```

---

## 4. MODULE ARCHITECTURE

### Logger Module (src/js/utils/logger.js)
- **Purpose:** Centralized logging for all application actions
- **Features:**
  - Console logging with color coding
  - LocalStorage persistence
  - Log export functionality
  - Multiple log levels (INFO, ERROR, WARN, DEBUG)

### Auth Service (src/js/utils/authService.js)
- **Purpose:** Handle authentication and user management
- **Features:**
  - User registration with role assignment
  - Login with approval validation
  - Session management
  - User data retrieval and storage

### Student Module (src/js/modules/student.js)
- **Purpose:** Provide student-specific functionality
- **Methods:**
  - `searchTeachers(filters)` - Search for available teachers
  - `bookAppointment(studentId, teacherId, data)` - Create appointment
  - `getAppointments(studentId, status)` - Retrieve appointments
  - `cancelAppointment(appointmentId)` - Cancel appointment
  - `sendMessage(studentId, teacherId, message)` - Send message

### Teacher Module (src/js/modules/teacher.js)
- **Purpose:** Provide teacher-specific functionality
- **Methods:**
  - `setAvailability(teacherId, slots)` - Set schedule
  - `getAppointments(teacherId, status)` - View appointments
  - `approveAppointment(appointmentId)` - Approve appointment
  - `cancelAppointment(appointmentId, reason)` - Cancel appointment
  - `getMessages(teacherId)` - Retrieve messages

### Admin Module (src/js/modules/admin.js)
- **Purpose:** Provide admin-specific functionality
- **Methods:**
  - `addTeacher(teacherData)` - Add new teacher
  - `updateTeacher(teacherId, data)` - Modify teacher info
  - `deleteTeacher(teacherId)` - Remove teacher
  - `getPendingStudents()` - Get unapproved students
  - `approveStudent(studentId)` - Approve student
  - `getDashboardStats()` - System statistics

---

## 5. USER ROLES AND PERMISSIONS

### Student Role
| Feature | Permission |
|---------|-----------|
| Register | ✓ |
| Login | ✓ (after approval) |
| Search Teachers | ✓ |
| Book Appointment | ✓ |
| Cancel Appointment | ✓ |
| View Own Appointments | ✓ |
| Send Messages | ✓ |
| Manage Other Users | ✗ |

### Teacher Role
| Feature | Permission |
|---------|-----------|
| Register | ✓ |
| Login | ✓ |
| View Appointments | ✓ |
| Approve Appointments | ✓ |
| Cancel Appointments | ✓ |
| Set Availability | ✓ |
| View Messages | ✓ |
| Manage Other Users | ✗ |

### Admin Role
| Feature | Permission |
|---------|-----------|
| All Student Features | ✓ |
| All Teacher Features | ✓ |
| Add Teachers | ✓ |
| Manage Teachers | ✓ |
| Approve Students | ✓ |
| Reject Students | ✓ |
| View System Stats | ✓ |
| Manage All Users | ✓ |

---

## 6. AUTHENTICATION FLOW

```
User Input
    ↓
Auth Service (login/register)
    ↓
Firebase Auth
    ↓
Firestore User Validation
    ↓
Session Storage
    ↓
Dashboard Redirect
```

---

## 7. APPOINTMENT BOOKING FLOW

```
Student Search
    ↓
Select Teacher
    ↓
Fill Appointment Form
    ↓
Student Module (bookAppointment)
    ↓
Firestore Create
    ↓
Status: Pending
    ↓
Teacher Review
    ↓
Teacher Module (approve/cancel)
    ↓
Update Firestore
    ↓
Status: Approved/Cancelled
```

---

## 8. DEPLOYMENT ARCHITECTURE

### Frontend Hosting Options
1. **Firebase Hosting**
   - Built-in CDN
   - SSL/TLS encryption
   - Easy integration with Firebase backend

2. **GitHub Pages**
   - Static site hosting
   - Version control integration

3. **Traditional Web Server**
   - Apache/Nginx
   - Self-hosted or cloud VPS

### Backend Services
- **Firebase Firestore** - Document database
- **Firebase Authentication** - User management
- **Firebase Storage** - File storage (if needed)

### Security Considerations
- HTTPS only
- API key management
- CORS configuration
- Firestore security rules

---

## 9. PERFORMANCE OPTIMIZATION

### Client-Side
- Lazy loading of modules
- Caching of search results
- Debouncing of search inputs
- Minimized CSS/JS bundles

### Database
- Indexed queries
- Collection partitioning by date
- Pagination for large datasets

### Logging
- Local storage for recent logs
- Batch uploads to Firestore
- Automatic log rotation

---

## 10. SCALABILITY CONSIDERATIONS

### Current Capacity
- 1,000+ concurrent users
- 100,000+ appointments
- Real-time updates via Firestore listeners

### Future Scaling
- Implement caching layer
- Message queue for bulk operations
- Read replicas for heavy queries
- CDN for static assets

---

## 11. ERROR HANDLING STRATEGY

1. **Validation Errors** - Display user-friendly messages
2. **Network Errors** - Retry logic with exponential backoff
3. **Database Errors** - Log and notify admin
4. **Authentication Errors** - Redirect to login
5. **Authorization Errors** - Deny access gracefully

---

## 12. DISASTER RECOVERY

### Backup Strategy
- Daily Firestore backups
- Encrypted backup storage
- Recovery time objective: 24 hours

### Monitoring
- Error rate tracking
- Performance metrics
- User activity logs
- System health checks
