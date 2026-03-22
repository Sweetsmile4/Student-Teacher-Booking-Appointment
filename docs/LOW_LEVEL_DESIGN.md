# LOW-LEVEL DESIGN DOCUMENT

## 1. INTRODUCTION

This document details the low-level design of the Student-Teacher Booking Appointment System, focusing on implementation details, algorithms, and data structures.

---

## 2. CLASS DIAGRAMS

### Logger Class
```
┌─────────────────────────────────────────┐
│           Logger                        │
├─────────────────────────────────────────┤
│ - logs: Array                           │
├─────────────────────────────────────────┤
│ + info(message, data)                   │
│ + error(message, error)                 │
│ + warn(message, data)                   │
│ + debug(message, data)                  │
│ - _log(level, message, data)            │
│ + getAllLogs()                          │
│ + clearLogs()                           │
│ + exportLogs()                          │
│ - saveLogsToStorage()                   │
│ - loadLogsFromStorage()                 │
└─────────────────────────────────────────┘
```

### AuthService Class
```
┌────────────────────────────────────────────┐
│        AuthService                         │
├────────────────────────────────────────────┤
│ - currentUser: User                        │
├────────────────────────────────────────────┤
│ + register(email, password, userData)      │
│ + login(email, password)                   │
│ + logout()                                 │
│ + getUserData(uid)                         │
│ + getCurrentUser()                         │
│ + isAuthenticated()                        │
│ - initializeAuthListener()                 │
│ - storeUserSession(user)                   │
│ - clearUserSession()                       │
└────────────────────────────────────────────┘
```

### StudentModule Class
```
┌──────────────────────────────────────────┐
│        StudentModule                     │
├──────────────────────────────────────────┤
│ - appointmentsRef: Reference             │
│ - messagesRef: Reference                 │
├──────────────────────────────────────────┤
│ + searchTeachers(filters)                │
│ + getTeacherDetails(teacherId)           │
│ + bookAppointment(studentId, data)       │
│ + getAppointments(studentId, status)     │
│ + cancelAppointment(appointmentId)       │
│ + sendMessage(studentId, teacherId, msg) │
│ + getProfile(studentId)                  │
│ + updateProfile(studentId, data)         │
└──────────────────────────────────────────┘
```

### TeacherModule Class
```
┌───────────────────────────────────────────┐
│        TeacherModule                      │
├───────────────────────────────────────────┤
│ - appointmentsRef: Reference              │
│ - messagesRef: Reference                  │
├───────────────────────────────────────────┤
│ + setAvailability(teacherId, slots)       │
│ + getAppointments(teacherId, status)      │
│ + approveAppointment(appointmentId)       │
│ + cancelAppointment(appointmentId, reason)│
│ + getMessages(teacherId)                  │
│ + markMessageAsRead(messageId)            │
│ + getProfile(teacherId)                   │
│ + updateProfile(teacherId, data)          │
└───────────────────────────────────────────┘
```

### AdminModule Class
```
┌──────────────────────────────────────────┐
│        AdminModule                       │
├──────────────────────────────────────────┤
│ - dbRef: Reference                       │
│ - usersRef: Reference                    │
├──────────────────────────────────────────┤
│ + addTeacher(teacherData)                │
│ + updateTeacher(teacherId, data)         │
│ + deleteTeacher(teacherId)               │
│ + getAllTeachers()                       │
│ + getPendingStudents()                   │
│ + approveStudent(studentId)              │
│ + rejectStudent(studentId, reason)       │
│ + getAllUsers()                          │
│ + getDashboardStats()                    │
└──────────────────────────────────────────┘
```

---

## 3. SEQUENCE DIAGRAMS

### User Registration Sequence
```
User → UI
UI → AuthService.register(email, pwd, userData)
AuthService → Firebase.auth.createUserWithEmailAndPassword()
Firebase → Database
Database → Firestore.users.add(userData)
Firestore → AuthService
AuthService → LocalStorage (save session)
AuthService → Logger
Logger → Firestore (audit log)
Logger → LocalStorage (log entry)
```

### Appointment Booking Sequence
```
Student → Search Teachers
UI → StudentModule.searchTeachers(filters)
StudentModule → Firestore.query(filters)
Firestore → UI (results)
Student → Select Teacher
Student → Fill Book Form
UI → StudentModule.bookAppointment(data)
StudentModule → Firestore.appointments.add()
Firestore → StudentModule (appointmentId)
StudentModule → Logger
Logger → UI (success message)
```

### Teacher Approval Sequence
```
Teacher → View Appointments
UI → TeacherModule.getAppointments(teacherId)
Firestore → UI (pending appointments)
Teacher → Click Approve
UI → TeacherModule.approveAppointment(appointmentId)
TeacherModule → Firestore.update({status: 'approved'})
Firestore → TeacherModule
TeacherModule → Logger
Logger → UI (confirmation)
Logger → LocalStorage
```

---

## 4. ALGORITHM SPECIFICATIONS

### Search Algorithm
```javascript
// Time Complexity: O(n) where n = total teachers
// Space Complexity: O(m) where m = filtered results

searchTeachers(filters) {
  try:
    query = db.collection('users')
            .where('role', '==', 'teacher')
            .where('approved', '==', true)
    
    if filters.department:
      query = query.where('department', '==', filters.department)
    
    if filters.subject:
      query = query.where('subject', '==', filters.subject)
    
    results = query.get()
    
    if filters.name:
      results = filter(results, r => 
        r.displayName.toLowerCase().includes(filters.name.toLowerCase()))
    
    return results
  
  catch error:
    logger.error('Search failed', error)
    return error
```

### Appointment Status Update Algorithm
```javascript
// Time Complexity: O(1) - Direct document update
// Space Complexity: O(1)

approveAppointment(appointmentId) {
  try:
    appointmentId = get from parameter
    currentUserId = authService.getCurrentUser().uid
    
    appointmentDoc = db.collection('appointments').doc(appointmentId)
    appointmentDoc.update({
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: currentUserId
    })
    
    logger.info('Appointment approved', {appointmentId})
    return {success: true}
  
  catch error:
    logger.error('Update failed', error)
    return {success: false, error: error.message}
```

### User Authentication Algorithm
```javascript
// Time Complexity: O(1) - Constant Firebase operations
// Space Complexity: O(1)

login(email, password) {
  try:
    userCredential = auth.signInWithEmailAndPassword(email, password)
    user = userCredential.user
    
    userData = getUserData(user.uid)
    
    if userData.approved == false AND userData.role != 'admin':
      auth.signOut()
      return {success: false, error: 'Not approved yet'}
    
    storeUserSession(user)
    logger.info('Login successful', {uid: user.uid})
    return {success: true, user: user, userData: userData}
  
  catch error:
    logger.error('Login failed', error)
    return {success: false, error: error.message}
```

---

## 5. DATABASE QUERY OPTIMIZATION

### Indexed Queries
```
users collection:
- Index: (role, approved)
- Index: (department, subject)

appointments collection:
- Index: (studentId, createdAt)
- Index: (teacherId, status)
- Index: (status, createdAt)

messages collection:
- Index: (teacherId, createdAt)
- Index: (read, createdAt)
```

### Query Optimization Strategies
1. **Use WHERE clauses** - Filter at database level
2. **Limit results** - Pagination for large datasets
3. **Order by indexed fields** - Faster sorting
4. **Denormalization** - Cache frequently accessed data

---

## 6. ERROR HANDLING PATTERNS

### Try-Catch Pattern
```javascript
try {
  // Operation
  result = performOperation()
  logger.info('Success', result)
  return {success: true, data: result}
} catch (error) {
  logger.error('Operation failed', error)
  return {success: false, error: error.message}
}
```

### Validation Pattern
```javascript
validateInput(data) {
  if !data.email:
    return {valid: false, error: 'Email required'}
  
  if !isValidEmail(data.email):
    return {valid: false, error: 'Invalid email format'}
  
  if data.password.length < 6:
    return {valid: false, error: 'Password too short'}
  
  return {valid: true}
}
```

---

## 7. CONCURRENCY HANDLING

### Race Condition Prevention
```javascript
// Use transaction for multiple updates
db.runTransaction(async (transaction) => {
  appointmentDoc = await transaction.get(appointmentRef)
  
  if appointmentDoc.data().status != 'pending':
    throw new Error('Appointment already processed')
  
  transaction.update(appointmentRef, {
    status: 'approved',
    approvedAt: new Date()
  })
})
```

### Lock Mechanism
```javascript
// Firestore document version control
// Update only if version unchanged
updateWithVersion(docId, newData, version) {
  transaction = db.transaction()
  
  doc = transaction.get(docRef)
  if doc.data().version != version:
    throw new Error('Document modified')
  
  transaction.update(docRef, {
    ...newData,
    version: version + 1
  })
}
```

---

## 8. CACHING STRATEGY

### Implementation
```javascript
class Cache {
  constructor(ttl = 5 * 60 * 1000) {
    this.data = {}
    this.timestamps = {}
    this.ttl = ttl
  }
  
  set(key, value) {
    this.data[key] = value
    this.timestamps[key] = Date.now()
  }
  
  get(key) {
    if !this.data[key]:
      return null
    
    if Date.now() - this.timestamps[key] > this.ttl:
      delete this.data[key]
      return null
    
    return this.data[key]
  }
}
```

---

## 9. MEMORY MANAGEMENT

### Log Rotation
```javascript
// Keep only recent 100 logs in storage
saveLogsToStorage() {
  recentLogs = this.logs.slice(-100)
  localStorage.setItem('appLogs', JSON.stringify(recentLogs))
}
```

### Session Cleanup
```javascript
// Clear on logout
clearUserSession() {
  sessionStorage.removeItem('currentUser')
  sessionStorage.removeItem('userAppointments')
}
```

---

## 10. SECURITY CONSIDERATIONS

### Input Validation
```javascript
// Validate all user inputs
validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

validatePassword(password) {
  return password.length >= 6 &&
         /[A-Z]/.test(password) &&
         /[0-9]/.test(password)
}
```

### XSS Prevention
```javascript
// Sanitize HTML content
sanitizeHtml(html) {
  div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}
```

### SQL Injection Protection
```javascript
// Use parameterized queries (Firestore handles this)
// Never concatenate user input into queries
query = db.collection('users')
  .where('email', '==', userInput)  // Safe
```

---

## 11. TESTING STRATEGY

### Unit Test Template
```javascript
describe('Module', () => {
  beforeEach(() => {
    // Setup
  })
  
  test('should perform action', () => {
    // Arrange
    input = {data}
    
    // Act
    result = function(input)
    
    // Assert
    expect(result).toBe(expected)
  })
})
```

### Integration Test Template
```javascript
describe('Workflow', () => {
  test('complete scenario', async () => {
    // Setup
    user = await register()
    
    // Execute workflow
    teacher = await search()
    appointment = await book(teacher)
    approved = await approve(appointment)
    
    // Verify end state
    expect(approved.status).toBe('approved')
  })
})
```

---

## 12. PERFORMANCE METRICS

### Target Performance
- Page Load: < 2 seconds
- Search Response: < 1 second
- Appointment Booking: < 500ms
- Logger Operations: < 100ms

### Monitoring
```javascript
// Performance measurement
startTime = performance.now()
result = await heavyOperation()
endTime = performance.now()

duration = endTime - startTime
logger.info('Operation duration', {operation: name, duration: duration})
```
