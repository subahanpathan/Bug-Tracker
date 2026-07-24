# Bug Tracker API Documentation

Complete REST API documentation for the Bug Tracker backend.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Authorization: Bearer <token>
```

**Security Note:** All ID-based routes (e.g., `/:id`, `/:projectId`) are protected by BOLA/IDOR middleware. You must be a member of the relevant project to access its tickets, comments, or attachments.

## Response Format
All responses follow this format:
```json
{
  "status": "success|error",
  "message": "Response message",
  "data": {}
}
```

## Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

Response (201):
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "token": "jwt_token"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "profile": {...},
    "token": "jwt_token"
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "developer"
  }
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "message": "Logged out successfully"
}
```

## Projects Endpoints

### Get All Projects
```http
GET /projects
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": [...]
}
```

### Get Single Project
```http
GET /projects/:id
Authorization: Bearer <token>
```

### Create Project
```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Project Name",
  "description": "Project Description",
  "key": "PROJ"
}

Response (201):
{
  "status": "success",
  "message": "Project created successfully",
  "data": {...}
}
```

### Update Project
```http
PUT /projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated Description"
}
```

### Delete Project
```http
DELETE /projects/:id
Authorization: Bearer <token>
```

## Bugs Endpoints

### Get All Bugs (with filters)
```http
GET /bugs?projectId=uuid&status=open&priority=high
Authorization: Bearer <token>

Query Parameters:
- projectId (optional)
- status (optional): open, in-progress, resolved, closed
- priority (optional): low, medium, high, critical

Response (200):
{
  "status": "success",
  "data": [...]
}
```

### Get Single Bug
```http
GET /bugs/:id
Authorization: Bearer <token>
```

### Create Bug
```http
POST /bugs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Bug Title",
  "description": "Detailed Description",
  "projectId": "uuid",
  "priority": "high",
  "status": "open",
  "assigneeId": "uuid" (optional)
}

Response (201):
{
  "status": "success",
  "message": "Bug created successfully",
  "data": {...}
}
```

### Update Bug
```http
PUT /bugs/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated Description",
  "priority": "medium",
  "status": "in-progress",
  "assigneeId": "uuid"
}
```

### Delete Bug
```http
DELETE /bugs/:id
Authorization: Bearer <token>
```

## Comments Endpoints

### Get Bug Comments
```http
GET /comments/bug/:bugId
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": [...]
}
```

### Add Comment
```http
POST /comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "bugId": "uuid",
  "content": "Comment text"
}

Response (201):
{
  "status": "success",
  "message": "Comment added successfully",
  "data": {...}
}
```

### Update Comment
```http
PUT /comments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated comment"
}
```

### Delete Comment
```http
DELETE /comments/:id
Authorization: Bearer <token>
```

## Attachments Endpoints

### Upload File
```http
POST /attachments
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- bugId: uuid
- file: [binary file]

Supported Types: JPEG, PNG, GIF, PDF
Max Size: 5MB

Response (201):
{
  "status": "success",
  "message": "File uploaded successfully",
  "data": {...}
}
```

### Get Bug Attachments
```http
GET /attachments/bug/:bugId
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": [...]
}
```

### Delete Attachment
```http
DELETE /attachments/:id
Authorization: Bearer <token>
```

### Stream Attachment (Secure Access)
```http
GET /attachments/stream/:filename
Authorization: Bearer <token>

Response (200):
[Binary Stream of file]

Note: This endpoint replaces direct static access to /uploads. 
It verifies that the user is a member of the project associated with the file.
```

## Users Endpoints

### Get All Users
```http
GET /users
Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "data": [...]
}
```

### Get User Profile
```http
GET /users/:id
Authorization: Bearer <token>
```

### Update User
```http
PUT /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "manager"
}
```

### Delete User
```http
DELETE /users/:id
Authorization: Bearer <token>
```

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

## Rate Limiting
- 100 requests per 15 minutes per IP
- Returns 429 Too Many Requests when limit exceeded

## CORS
- Dynamic configuration via `CORS_ORIGIN` environment variable.
- Defaults to `http://localhost:3000` in development.
- Supports credentials and all HTTP methods.

## Security Headers
- Uses Helmet.js for security headers
- Content Security Policy enabled
- XSS Protection enabled
- BOLA Protection: All resource-based endpoints (bugs, comments, attachments, users) validate ownership/permissions before processing requests.
