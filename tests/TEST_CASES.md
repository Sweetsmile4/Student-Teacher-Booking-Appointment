# TEST CASES FOR STUDENT-TEACHER BOOKING APPOINTMENT SYSTEM

## Test Execution Format
All tests should be run manually in the browser console or using Jest framework.

---

## 1. LOGGER UTILITY TESTS

### TC-1.1: Log Info Message
- **Precondition:** Browser console open
- **Steps:**
  1. Call `logger.info('Test message')`
  2. Check browser console for colored output
- **Expected Result:** Message displayed in console with [INFO] tag

### TC-1.2: Log Error Message
- **Steps:**
  1. Call `logger.error('Error occurred', new Error('Test'))`
  2. Check localStorage
- **Expected Result:** Error stored and displayed in console

### TC-1.3: Export Logs
- **Steps:**
  1. Generate multiple logs: `logger.info('Test 1'); logger.info('Test 2');`
  2. Call `logger.exportLogs()`
- **Expected Result:** JSON file downloaded with log entries

---

## 2. AUTHENTICATION TESTS

### TC-2.1: User Registration (Student)
- **Steps:**
  1. Navigate to /pages/register.html
  2. Fill in: Name="John Doe", Email="john@test.com", Password="Test@123", Role="Student"
  3. Click Register
- **Expected Result:** Success message displayed, redirected to login page

### TC-2.2: User Registration (Teacher)
- **Steps:**
  1. Navigate to /pages/register.html
  2. Fill in all fields including Department and Subject
  3. Click Register
- **Expected Result:** Teacher account created successfully

### TC-2.3: Invalid Email Registration
- **Steps:**
  1. Try registering with invalid email format
  2. Submit form
- **Expected Result:** Validation error displayed

### TC-2.4: User Login
- **Steps:**
  1. Navigate to /pages/login.html
  2. Enter valid credentials
  3. Click Login
- **Expected Result:** Redirected to appropriate dashboard based on role

### TC-2.5: Invalid Credentials
- **Steps:**
  1. Enter wrong password
  2. Click Login
- **Expected Result:** Error message displayed

### TC-2.6: Unapproved Student Login
- **Steps:**
  1. Login with unapproved student account
- **Expected Result:** Denied access with approval message

---

## 3. STUDENT MODULE TESTS

### TC-3.1: Search Teachers - No Filter
- **Steps:**
  1. Login as student
  2. Go to "Search Teachers" section
  3. Click Search without filters
- **Expected Result:** All approved teachers displayed

### TC-3.2: Search Teachers - By Department
- **Steps:**
  1. Fill in Department field with "Computer Science"
  2. Click Search
- **Expected Result:** Only CS teachers displayed

### TC-3.3: Search Teachers - By Name
- **Steps:**
  1. Fill in Name field with teacher name
  2. Click Search
- **Expected Result:** Matching teachers displayed

### TC-3.4: Book Appointment
- **Steps:**
  1. Search and select a teacher
  2. Click "Book Appointment"
  3. Fill in date, time, and purpose
  4. Submit
- **Expected Result:** Appointment created with "pending" status

### TC-3.5: View My Appointments
- **Steps:**
  1. Go to "My Appointments"
- **Expected Result:** List of all student appointments with statuses

### TC-3.6: Cancel Appointment
- **Steps:**
  1. Find pending appointment
  2. Click Cancel
  3. Confirm cancellation
- **Expected Result:** Appointment status changed to "cancelled"

### TC-3.7: Update Student Profile
- **Steps:**
  1. Go to Profile section
  2. Update phone number
  3. Save changes
- **Expected Result:** Profile updated successfully

---

## 4. TEACHER MODULE TESTS

### TC-4.1: View All Appointments
- **Steps:**
  1. Login as teacher
  2. Go to Appointments
- **Expected Result:** All appointments displayed

### TC-4.2: Filter Pending Appointments
- **Steps:**
  1. In Appointments section, filter by "Pending"
- **Expected Result:** Only pending appointments shown

### TC-4.3: Approve Appointment
- **Steps:**
  1. View pending appointment
  2. Click "Approve"
  3. Confirm
- **Expected Result:** Status changed to "approved"

### TC-4.4: Cancel Appointment with Reason
- **Steps:**
  1. Click Cancel on any appointment
  2. Enter cancellation reason
  3. Confirm
- **Expected Result:** Appointment cancelled with reason recorded

### TC-4.5: Read Messages
- **Steps:**
  1. Go to Messages section
  2. View message from student
- **Expected Result:** Message marked as read

### TC-4.6: Set Availability
- **Steps:**
  1. Go to "My Schedule"
  2. Select available days
  3. Add time slots
  4. Save
- **Expected Result:** Schedule saved successfully

### TC-4.7: View Dashboard Stats
- **Steps:**
  1. View teacher dashboard
- **Expected Result:** Stats show total, pending, and approved appointments

---

## 5. ADMIN MODULE TESTS

### TC-5.1: View Dashboard Statistics
- **Steps:**
  1. Login as admin
  2. View dashboard
- **Expected Result:** Shows total users, teachers, appointments, pending approvals

### TC-5.2: Add New Teacher
- **Steps:**
  1. Go to Teachers section
  2. Fill in teacher details
  3. Click "Add Teacher"
- **Expected Result:** Teacher added and appears in teachers list

### TC-5.3: Edit Teacher Information
- **Steps:**
  1. Find teacher in list
  2. Click Edit
  3. Modify details
  4. Save
- **Expected Result:** Teacher information updated

### TC-5.4: Delete Teacher
- **Steps:**
  1. Find teacher
  2. Click Delete
  3. Confirm
- **Expected Result:** Teacher removed from list

### TC-5.5: View Pending Student Registrations
- **Steps:**
  1. Go to Students section
  2. View "Pending Student Registrations"
- **Expected Result:** List of unapproved students displayed

### TC-5.6: Approve Student
- **Steps:**
  1. Find pending student
  2. Click "Approve"
  3. Confirm
- **Expected Result:** Student approved, can now login

### TC-5.7: Reject Student with Reason
- **Steps:**
  1. Find pending student
  2. Click "Reject"
  3. Enter rejection reason
  4. Confirm
- **Expected Result:** Student registration rejected, logged in DB

### TC-5.8: View All Students
- **Steps:**
  1. Go to Students section
  2. View "All Students"
- **Expected Result:** Complete list of all students with approval status

---

## 6. INTEGRATION TESTS

### TC-6.1: Complete Student Journey
- **Steps:**
  1. Register as student
  2. Wait for admin approval
  3. Login
  4. Search teachers
  5. Book appointment
  6. View appointment status
- **Expected Result:** All steps complete successfully

### TC-6.2: Complete Appointment Workflow
- **Steps:**
  1. Student books appointment
  2. Teacher views and approves
  3. Student sees approval
  4. Appointment time arrives
- **Expected Result:** Full workflow executes properly

### TC-6.3: Admin Approval to Student Access
- **Steps:**
  1. New student registers
  2. Admin approves
  3. Student can login
  4. Can access all features
- **Expected Result:** Proper access control maintained

---

## 7. SECURITY TESTS

### TC-7.1: Authentication Required
- **Steps:**
  1. Try accessing /pages/admin-dashboard.html without login
- **Expected Result:** Redirected to login page

### TC-7.2: Role-Based Access Control
- **Steps:**
  1. Login as student
  2. Try accessing admin-dashboard.html directly
- **Expected Result:** Denied access, redirected to home

### TC-7.3: Data Isolation
- **Steps:**
  1. Student can only see own appointments
  2. Teacher can only see own appointments
- **Expected Result:** Data properly isolated by user

---

## 8. PERFORMANCE TESTS

### TC-8.1: Logger Performance
- **Steps:**
  1. Log 100 entries using logger
  2. Measure time taken
- **Expected Result:** Completes in <500ms

### TC-8.2: Search Performance
- **Steps:**
  1. Search teachers with multiple filters
  2. Measure response time
- **Expected Result:** Results displayed in <1 second

### TC-8.3: Page Load Time
- **Steps:**
  1. Load dashboard
  2. Measure page render time
- **Expected Result:** Page renders in <2 seconds

---

## 9. BROWSER COMPATIBILITY TESTS

### TC-9.1: Chrome
- Test all features in latest Chrome

### TC-9.2: Firefox
- Test all features in latest Firefox

### TC-9.3: Safari
- Test all features in latest Safari

### TC-9.4: Mobile Responsiveness
- Test all pages on mobile devices

---

## 10. BUG REGRESSION TESTS

### TC-10.1: Previous Issues
- Test any previously identified and fixed issues
- Update as new bugs are found and fixed
