# File Service API Documentation

## Submission Routes API Documentation

This document describes the submission-related API endpoints in the file-service.

All submission endpoints are prefixed with `/submission` (as configured in [`src/app.ts`](services/file-service/src/app.ts)).

## Endpoints

### 1. List Submissions

**GET** `/submission/`

Retrieves a list of submissions with optional filtering.

#### Query Parameters

- `user` (optional): Filter by user ID
- `task` (optional): Filter by task ID
- `marked_for_grading` (optional): Filter by grading status (`true` or `false`)
- `order` (optional): Sort order (`created_at:asc` or `created_at:desc`, defaults to `created_at:desc`)

#### Example Request

```http
GET /submission/?user=123&task=456&marked_for_grading=true&order=created_at:asc
Authorization: Bearer <token>
```

#### Response

```json
{
  "data": [
    {
      "id": "245",
      "userId": "123",
      "taskId": "456",
      "filename": "solution.py",
      "description": "My solution",
      "markedForGrading": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 2. Create Submission

**POST** `/submission/`

Uploads a new submission file for a task.

#### Content Type

`multipart/form-data`

#### Form Fields

- `file` (required): The submission file to upload
- `userId` (required): ID of the user submitting
- `taskId` (required): ID of the task being submitted for
- `description` (optional): Description of the submission
- `metadata` (optional): Additional metadata

#### File Size Limits

- Maximum file size: 200MB (can be changed)
- Task-specific limits may apply (check [`maxUploadSize`](frontend/src/pages/courseDetail.jsx) in task configuration)

#### Example Request

```http
POST /submission/
Content-Type: multipart/form-data
Authorization: Bearer <token>

file=@solution.py
userId=123
taskId=456
description=My Python solution
```

#### Response

```json
{
  "message": "Submission created successfully",
  "data": {
    "id": "245",
    "userId": "123",
    "taskId": "456",
    "filename": "solution.py",
    "fileHash": "sha256_hash",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Error Responses

- `400 Bad Request`: File size exceeds limit or daily submission limit exceeded
- `401 Unauthorized`: Invalid or missing authentication token
- `422 Unprocessable Entity`: Invalid file format or missing required fields

### 3. Download Submission

**GET** `/submission/:id/download`

Downloads the file content of a specific submission.

#### Parameters

- `id` (required): Submission ID

#### Example Request

```http
GET /submission/abc123/download
Authorization: Bearer <token>
```

#### Response

Returns the file content with appropriate headers for download.

## Task Asset Routes API Documentation

This document describes the task asset-related API endpoints in the file-service for managing grader and template files.

## Base URL

All task asset endpoints are prefixed with `/taskAsset` (as configured in the file-service routing).

## Authentication

All endpoints require Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### 1. Upload Grader File

**POST** `/taskAsset/:taskId/grader`

Uploads a grader file for a specific task. Grader files are used by the evaluation service to automatically grade submissions.

##### Parameters

- `taskId` (required): The ID of the task to upload the grader for

##### Content Type

`multipart/form-data`

##### Form Fields

- `file` (required): The grader file to upload (typically Python, JavaScript, or other executable files)

##### File Requirements

- Supported formats: `.py`, `.js`, `.zip`, and other evaluation script formats
- Maximum file size: As configured in `graderUploadMulter`

##### Example Request

```http
POST /taskAsset/task123/grader
Content-Type: multipart/form-data
Authorization: Bearer <token>

file=@grader.py
```

##### Response

```json
{
  "message": "Grader uploaded successfully",
  "data": {
    "taskId": "task123",
    "filename": "grader.py",
    "fileHash": "sha256_hash",
    "uploadedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 2. Upload Template File

**POST** `/taskAsset/:taskId/template`

Uploads a template file for a specific task. Template files provide starter code or structure for students.

##### Parameters

- `taskId` (required): The ID of the task to upload the template for

##### Content Type

`multipart/form-data`

##### Form Fields

- `file` (required): The template file to upload

##### File Requirements

- Supported formats: Various programming languages and file types
- Maximum file size: As configured in `templateUploadMulter`

##### Example Request

```http
POST /taskAsset/task123/template
Content-Type: multipart/form-data
Authorization: Bearer <token>

file=@template.py
```

##### Response

```json
{
  "message": "Template uploaded successfully",
  "data": {
    "taskId": "task123",
    "filename": "template.py",
    "fileHash": "sha256_hash",
    "uploadedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 3. Download Grader File

**GET** `/taskAsset/:taskId/grader/download`

Downloads the grader file for a specific task.

##### Parameters

- `taskId` (required): The ID of the task to download the grader for

##### Example Request

```http
GET /taskAsset/task123/grader/download
Authorization: Bearer <token>
```

##### Response

Returns the grader file content with appropriate headers for download:

- `Content-Type`: Based on file type
- `Content-Disposition`: `attachment; filename="grader.py"`

##### Error Response

```json
{
  "error": {
    "message": "Grader file not found for task"
  }
}
```

#### 4. Download Template File

**GET** `/taskAsset/:taskId/template/download`

Downloads the template file for a specific task.

##### Parameters

- `taskId` (required): The ID of the task to download the template for

##### Example Request

```http
GET /taskAsset/task123/template/download
Authorization: Bearer <token>
```

##### Response

Returns the template file content with appropriate headers for download:

- `Content-Type`: Based on file type
- `Content-Disposition`: `attachment; filename="template.py"`

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": {
    "message": "Error description"
  }
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created (for new submissions)
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error
