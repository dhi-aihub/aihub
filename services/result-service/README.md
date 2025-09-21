# Results Service API Documentation

This document describes the results-related API endpoints in the results-service for managing submission evaluation results.

## Base URL

All results endpoints are available at the results-service base URL.

## Endpoints

### 1. Create or Update Result

**POST** `/results`

Creates a new result or updates an existing one for a submission evaluation.

#### Content Type

`application/json`

#### Request Body

```json
{
  "submissionId": "submission_id",
  "taskId": "task_id",
  "userId": "user_id",
  "score": 85.5,
  "maxScore": 100,
  "status": "completed",
  "feedback": "Good work! Minor issues with edge cases.",
  "testResults": [
    {
      "testName": "test_basic_functionality",
      "status": "passed",
      "score": 25,
      "maxScore": 25,
      "message": "All basic tests passed"
    },
    {
      "testName": "test_edge_cases",
      "status": "failed",
      "score": 15,
      "maxScore": 25,
      "message": "Failed on empty input handling"
    }
  ],
  "executionTime": 1.23,
  "memoryUsage": 45.6,
  "metadata": {
    "language": "python",
    "graderVersion": "1.0.0"
  }
}
```

#### Request Body Fields

- `submissionId` (required): ID of the submission being evaluated
- `taskId` (required): ID of the task
- `userId` (required): ID of the user who made the submission
- `score` (required): Numeric score achieved
- `maxScore` (required): Maximum possible score
- `status` (required): Evaluation status (`pending`, `running`, `completed`, `failed`, `timeout`)
- `feedback` (optional): Textual feedback for the student
- `testResults` (optional): Array of individual test results
- `executionTime` (optional): Execution time in seconds
- `memoryUsage` (optional): Memory usage in MB
- `metadata` (optional): Additional metadata about the evaluation

#### Example Request

```http
POST /results
Content-Type: application/json
Authorization: Bearer <token>

{
  "submissionId": "sub_123",
  "taskId": "task_456",
  "userId": "user_789",
  "score": 90,
  "maxScore": 100,
  "status": "completed",
  "feedback": "Excellent solution with good code quality."
}
```

#### Response

```json
{
  "message": "Result created successfully",
  "data": {
    "id": "result_id",
    "submissionId": "sub_123",
    "taskId": "task_456",
    "userId": "user_789",
    "score": 90,
    "maxScore": 100,
    "status": "completed",
    "feedback": "Excellent solution with good code quality.",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 2. Get Result by ID

**GET** `/results/:id`

Retrieves a specific result by its ID.

#### Parameters

- `id` (required): Result ID

#### Example Request

```http
GET /results/result_123
Authorization: Bearer <token>
```

#### Response

```json
{
  "data": {
    "id": "result_123",
    "submissionId": "sub_123",
    "taskId": "task_456",
    "userId": "user_789",
    "score": 90,
    "maxScore": 100,
    "status": "completed",
    "feedback": "Excellent solution with good code quality.",
    "testResults": [
      {
        "testName": "test_functionality",
        "status": "passed",
        "score": 45,
        "maxScore": 50,
        "message": "Most functionality works correctly"
      }
    ],
    "executionTime": 2.15,
    "memoryUsage": 32.4,
    "metadata": {
      "language": "python",
      "graderVersion": "1.0.0"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Error Response

```json
{
  "error": {
    "message": "Result not found"
  }
}
```

### 3. List Results

**GET** `/results`

Retrieves a list of results with optional filtering and pagination.

#### Query Parameters

- `submissionId` (optional): Filter by submission ID
- `taskId` (optional): Filter by task ID
- `userId` (optional): Filter by user ID
- `status` (optional): Filter by evaluation status
- `limit` (optional): Number of results to return (default: 50)
- `offset` (optional): Number of results to skip (default: 0)
- `sortBy` (optional): Field to sort by (default: `createdAt`)
- `sortOrder` (optional): Sort order (`asc` or `desc`, default: `desc`)

#### Example Requests

**Get all results for a task:**

```http
GET /results?taskId=task_456&limit=20
Authorization: Bearer <token>
```

**Get results for a specific user:**

```http
GET /results?userId=user_789&status=completed
Authorization: Bearer <token>
```

**Get latest results with pagination:**

```http
GET /results?limit=10&offset=0&sortBy=createdAt&sortOrder=desc
Authorization: Bearer <token>
```

#### Response

```json
{
  "data": [
    {
      "id": "result_123",
      "submissionId": "sub_123",
      "taskId": "task_456",
      "userId": "user_789",
      "score": 90,
      "maxScore": 100,
      "status": "completed",
      "feedback": "Excellent solution",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

## Result Status Values

- `pending`: Result is waiting to be processed
- `running`: Evaluation is currently in progress
- `completed`: Evaluation completed successfully
- `failed`: Evaluation failed due to an error
- `timeout`: Evaluation exceeded time limit

## Test Result Structure

Individual test results within the `testResults` array follow this structure:

```json
{
  "testName": "descriptive_test_name",
  "status": "passed|failed|skipped",
  "score": 25,
  "maxScore": 25,
  "message": "Detailed feedback about this test",
  "output": "Any captured output from the test",
  "error": "Error message if test failed"
}
```

## Common Use Cases

### 1. Retrieving Results for a Student's Dashboard

```http
GET /results?userId=student_123&sortBy=createdAt&sortOrder=desc&limit=10
Authorization: Bearer <token>
```

### 2. Getting Task Performance Overview

```http
GET /results?taskId=task_456&status=completed
Authorization: Bearer <token>
```

### 3. Checking Specific Submission Result

```http
GET /results?submissionId=sub_789
Authorization: Bearer <token>
```

### 4. Creating a Result After Evaluation

```http
POST /results
Content-Type: application/json
Authorization: Bearer <token>

{
  "submissionId": "sub_456",
  "taskId": "task_123",
  "userId": "user_789",
  "score": 85,
  "maxScore": 100,
  "status": "completed",
  "feedback": "Well done! Consider optimizing the algorithm for better performance.",
  "testResults": [
    {
      "testName": "basic_functionality",
      "status": "passed",
      "score": 40,
      "maxScore": 40
    },
    {
      "testName": "edge_cases",
      "status": "passed",
      "score": 30,
      "maxScore": 30
    },
    {
      "testName": "performance",
      "status": "failed",
      "score": 15,
      "maxScore": 30,
      "message": "Algorithm exceeds time limit on large inputs"
    }
  ]
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created (for new results)
- `400`: Bad Request (invalid parameters or body)
- `401`: Unauthorized (missing or invalid token)
- `404`: Not Found (result not found)
- `422`: Unprocessable Entity (validation errors)
- `500`: Internal Server Error

## Integration with Other Services

### File Service Integration

Results are linked to submissions from the file-service:

- Use `submissionId` from submission creation to link results
- Results can trigger rerun requests back to the file-service

### Evaluation Service Integration

The evaluation service typically:

1. Receives submission notifications
2. Downloads grader files from file-service
3. Evaluates submissions
4. Creates results using the POST `/results` endpoint

### Frontend Integration

The frontend uses these endpoints to:

- Display student results and feedback
- Show instructor dashboards with class performance
- Provide detailed test result breakdowns
- Enable result filtering and sorting

## Implementation Details

The results routes are implemented in [`src/controllers/result.controller.ts`](services/results-service/src/controllers/result.controller.ts) and provide:

- **Efficient querying** with database indexing on common filter fields
- **Pagination support** for large result sets
- **Flexible filtering** by multiple criteria
- **Detailed error handling** with appropriate HTTP status codes

For optimal performance, consider using the filtering parameters to limit result sets, especially when dealing with large numbers of submissions or results.
