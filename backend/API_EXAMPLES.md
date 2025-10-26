# Quiz App API Examples

## Base URL
```
http://localhost:3000/api
```

## Authentication

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Іван",
    "lastName": "Петренко",
    "city": "Київ",
    "position": "Інженер",
    "email": "ivan@example.com",
    "phone": "+380501234567",
    "password": "SecurePass123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ivan@example.com",
    "password": "SecurePass123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Quiz Operations

### Get Today's Quiz
```bash
curl -X GET http://localhost:3000/api/quiz/today \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Submit Quiz Answers
```bash
curl -X POST http://localhost:3000/api/quiz/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quizId": 1,
    "answers": [
      {
        "questionId": 1,
        "answer": "A"
      },
      {
        "questionId": 2,
        "answer": "B"
      },
      {
        "questionId": 3,
        "answer": "C"
      },
      {
        "questionId": 4,
        "answer": "D"
      },
      {
        "questionId": 5,
        "answer": "A"
      }
    ]
  }'
```

### Get Quiz Result
```bash
curl -X GET http://localhost:3000/api/quiz/result/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Quiz History
```bash
curl -X GET http://localhost:3000/api/quiz/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Leaderboard
```bash
curl -X GET http://localhost:3000/api/quiz/leaderboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Categories

### Get All Categories
```bash
curl -X GET http://localhost:3000/api/categories
```

### Get Questions by Category
```bash
curl -X GET http://localhost:3000/api/categories/1/questions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Questions (Knowledge Base)

### Get All Questions
```bash
curl -X GET http://localhost:3000/api/questions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Specific Question
```bash
curl -X GET http://localhost:3000/api/questions/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## User Operations

### Submit Feedback
```bash
curl -X POST http://localhost:3000/api/user/feedback \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Дуже корисний додаток!",
    "feedbackType": "general"
  }'
```

### Get Notifications
```bash
curl -X GET http://localhost:3000/api/user/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Mark Notification as Read
```bash
curl -X PUT http://localhost:3000/api/user/notifications/1/read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get User Statistics
```bash
curl -X GET http://localhost:3000/api/user/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Admin Operations

### Get Dashboard Statistics
```bash
curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Create Question
```bash
curl -X POST http://localhost:3000/api/admin/questions \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 1,
    "questionText": "Який колір має знак заборонного сигналу?",
    "optionA": "Червоний",
    "optionB": "Жовтий",
    "optionC": "Зелений",
    "optionD": "Синій",
    "correctAnswer": "A",
    "explanation": "Червоний колір використовується для заборонних сигналів.",
    "difficultyLevel": 1
  }'
```

### Get All Questions (Admin)
```bash
curl -X GET http://localhost:3000/api/admin/questions \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Update Question
```bash
curl -X PUT http://localhost:3000/api/admin/questions/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "Оновлене питання",
    "difficultyLevel": 2
  }'
```

### Delete Question
```bash
curl -X DELETE http://localhost:3000/api/admin/questions/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Create Category
```bash
curl -X POST http://localhost:3000/api/admin/categories \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Нова категорія",
    "description": "Опис нової категорії"
  }'
```

### Get All Categories (Admin)
```bash
curl -X GET http://localhost:3000/api/admin/categories \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Get All Users
```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Deactivate User
```bash
curl -X PUT http://localhost:3000/api/admin/users/1/deactivate \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Export Users Report
```bash
curl -X GET http://localhost:3000/api/admin/reports/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -o users_report.xlsx
```

### Export Quiz Report
```bash
curl -X GET "http://localhost:3000/api/admin/reports/quiz?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -o quiz_report.xlsx
```

## Health Check

### Check Server Status
```bash
curl -X GET http://localhost:3000/api/health
```

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "message": "Detailed error description (development only)"
}
```

## Authentication Errors

- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Valid token but insufficient permissions

## Validation Errors

```json
{
  "errors": [
    {
      "msg": "Validation error message",
      "param": "fieldName",
      "location": "body"
    }
  ]
}
```
