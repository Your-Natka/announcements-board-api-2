# Announcements Board API

A RESTful API for an announcements board built with **Node.js, Express, TypeScript, PostgreSQL, and Prisma ORM**.

The application provides user authentication, announcement management, input validation, and API documentation through Swagger UI.

## Features

- User registration and login
- JWT-based authentication
- Access and refresh token handling
- Refresh token rotation
- User profile retrieval
- Create, read, update, and delete announcements
- Announcement ownership and access control
- Request validation using Zod
- Pagination for announcements
- PostgreSQL database integration with Prisma ORM
- Interactive API documentation using Swagger UI
- TypeScript strict mode

## Tech Stack

- **Node.js** — JavaScript runtime
- **Express** — web application framework
- **TypeScript** — static typing
- **PostgreSQL** — relational database
- **Prisma ORM** — database access and migrations
- **JWT** — authentication and authorization
- **Zod** — request validation
- **Swagger / OpenAPI** — API documentation

## Project Structure

```text
announcements-board-api/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── schemas/
│   └── openapi.ts
├── app.ts
├── prisma/
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Your-Natka/announcements-board-api.git
cd announcements-board-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/announcements_board?schema=public"
JWT_SECRET="your_access_token_secret"
JWT_REFRESH_SECRET="your_refresh_token_secret"
PORT=3000
```

Replace the database credentials and JWT secrets with your own values.

### 4. Set up the database

Make sure PostgreSQL is running and the database exists.

Generate the Prisma Client:

```bash
npm run prisma:generate
```

Run database migrations:

```bash
npm run prisma:migrate -- --name init
```

### 5. Run the development server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

## API Documentation

Interactive Swagger documentation is available at:

```text
http://localhost:3000/api-docs
```

Swagger UI allows you to explore endpoints, provide request data, authorize requests, and execute API operations.

## API Endpoints

### Authentication

| Method | Endpoint         | Description                        |
| ------ | ---------------- | ---------------------------------- |
| POST   | `/auth/register` | Register a new user                |
| POST   | `/auth/login`    | Log in and receive tokens          |
| POST   | `/auth/refresh`  | Refresh authentication tokens      |
| POST   | `/auth/logout`   | Log out and revoke refresh tokens  |
| GET    | `/auth/me`       | Get the current authenticated user |

### Announcements

| Method | Endpoint             | Description                       |
| ------ | -------------------- | --------------------------------- |
| POST   | `/announcements`     | Create an announcement            |
| GET    | `/announcements`     | Get announcements with pagination |
| GET    | `/announcements/:id` | Get an announcement by ID         |
| PATCH  | `/announcements/:id` | Update an announcement            |
| DELETE | `/announcements/:id` | Delete an announcement            |

Protected endpoints require a valid JWT access token in the Authorization header:

```text
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Validation and Error Handling

The API validates incoming request data using Zod.

Examples of validation rules:

- Announcement title must contain at least 3 characters.
- Price must be greater than or equal to 0.
- Required fields cannot be omitted.
- Invalid request data returns `400 Bad Request`.

### HTTP Status Codes

| Status | Description                    |
| ------ | ------------------------------ |
| 200    | Request completed successfully |
| 201    | Resource created successfully  |
| 204    | Resource deleted successfully  |
| 400    | Validation error               |
| 401    | Unauthorized                   |
| 403    | Access denied                  |
| 404    | Resource not found             |
| 500    | Internal server error          |

## Authorization and Security

- Passwords are not included in public user responses.
- Protected routes require JWT authentication.
- Users can modify or delete only their own announcements.
- Unauthorized requests are rejected.
- Refresh tokens are stored and managed by the application.

## Pagination

The announcements endpoint supports pagination.

Example:

```text
GET /announcements?page=1&perPage=10
```

The response includes announcement data and pagination metadata:

```json
{
  "data": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "totalPages": 0,
    "perPage": 10
  }
}
```

## Testing

The API was manually tested using Swagger UI.

The following scenarios were verified:

- User registration and login
- Retrieving the authenticated user
- Creating announcements
- Retrieving announcements
- Updating announcements
- Deleting announcements
- Validation of empty titles
- Validation of negative prices
- Validation of missing required fields
- Unauthorized access without a token
- Access control for announcements belonging to another user
- Correct HTTP status codes for successful and unsuccessful requests

## License

This project was created for educational purposes as part of a Node.js / TypeScript assignment.
