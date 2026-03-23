# Student-Teacher Booking Appointment

Web-based appointment booking system for educational institutions where students can book appointments with teachers, teachers can approve or cancel requests, and admins can manage teachers and approvals.

## Project Snapshot

- Title: Student-Teacher Booking Appointment
- Domain: Education
- Tech Stack: HTML, CSS, JavaScript, Firebase (Auth + Firestore + Hosting)
- Pattern: Modular frontend architecture with role-based modules

## Problem Statement

Traditional and online appointment systems improve scheduling efficiency, reduce wait time, and improve service throughput. This project provides a web-based system that enables students and teachers to manage appointments from anywhere via Internet-enabled devices. Students can request appointments with purpose and timing, and teachers/admin can process those requests.

## Core Modules

### Admin
- Add teacher (name, department, subject, etc.)
- Update/delete teacher
- Approve/reject student registrations
- View dashboard statistics

### Teacher
- Login/logout
- Set schedule/availability
- Approve/cancel appointments
- View student messages
- View all appointments

### Student
- Register/login
- Search teachers
- Book appointment
- Send message with appointment purpose/details

## Implemented Features in This Repository

- Role-based pages and dashboards for admin/teacher/student
- Firebase authentication integration (email/password)
- Firestore CRUD operations for users, appointments, messages
- Logging utility with level-based logs and local export
- Test cases document and sample code-level test suite
- Architecture and low-level design documentation
- Deployment guide for Firebase and server-based hosting

## Repository Structure

```text
Student-Teacher-Booking-Appointment/
├── pages/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── admin-dashboard.html
│   ├── teacher-dashboard.html
│   └── student-dashboard.html
├── src/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── modules/
│       │   ├── admin.js
│       │   ├── teacher.js
│       │   └── student.js
│       ├── pages/
│       │   ├── admin-dashboard.js
│       │   ├── login.js
│       │   ├── register.js
│       │   ├── student-dashboard.js
│       │   └── teacher-dashboard.js
│       └── utils/
│           ├── authService.js
│           ├── firebaseConfig.js
│           └── logger.js
├── docs/
│   ├── DEPLOYMENT.md
│   ├── LOW_LEVEL_DESIGN.md
│   └── SYSTEM_ARCHITECTURE.md
├── tests/
│   ├── TEST_CASES.md
│   └── test-cases.js
└── README.md
```

## Setup and Run

### 1. Clone

```bash
git clone https://github.com/<your-username>/Student-Teacher-Booking-Appointment.git
cd Student-Teacher-Booking-Appointment
```

### 2. Configure Firebase

1. Create a Firebase project in Firebase Console.
2. Enable Authentication (Email/Password).
3. Enable Firestore Database.
4. Update `src/js/utils/firebaseConfig.js` with your Firebase config keys.

### 3. Run Locally

Option A: Python static server

```bash
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000/pages/index.html
```

Option B: Firebase Hosting local serve

```bash
npm i -g firebase-tools
firebase login
firebase serve
```

## Basic Workflow

1. Student registers.
2. Admin approves student registration.
3. Student logs in and searches teachers.
4. Student books appointment request.
5. Teacher approves/cancels appointment.
6. Student tracks status and can send message.

## Coding Standards and Evaluation Alignment

### Modular Code
- Feature logic split into `modules` and page controllers in `pages` JS.

### Safe
- Role checks before dashboard access.
- Approval checks for non-admin users.

### Testable
- Test cases listed in `tests/TEST_CASES.md`.
- Code-level test template in `tests/test-cases.js`.

### Maintainable
- Separated utility/services/modules/page scripts.
- Consistent function-based APIs across modules.

### Portable
- Runs as static web app on Linux/Windows/macOS with modern browser.

### Logging
- All major actions log through logger utility.

## Firebase Data Collections

- `users`
- `appointments`
- `messages`

Refer to `docs/SYSTEM_ARCHITECTURE.md` for schema details.

## Documentation Submitted

- System architecture: `docs/SYSTEM_ARCHITECTURE.md`
- Low-level design (LLD): `docs/LOW_LEVEL_DESIGN.md`
- Deployment design and justification: `docs/DEPLOYMENT.md`
- Test cases: `tests/TEST_CASES.md`

## Deployment Justification

Recommended deployment is Firebase Hosting because:

- Same ecosystem as backend services (Auth/Firestore)
- Easy CI/CD and SSL setup
- Good performance via CDN
- Minimal ops overhead for academic projects

Detailed deployment options are in `docs/DEPLOYMENT.md`.

## Optimization Notes

- Code-level: modular separation and reusable service methods.
- Architecture-level: Firebase managed services reduce backend complexity.
- Runtime-level: filtered Firestore queries and minimal page payload.

## GitHub Submission Checklist

- Public repository enabled
- Source code pushed
- README with setup + workflow + execution
- Docs for architecture + LLD + deployment
- Test cases included

## Future Improvements

- Real-time notifications
- Email reminders
- Teacher calendar view with conflict detection
- Stronger form validation and better error UX

## License

MIT