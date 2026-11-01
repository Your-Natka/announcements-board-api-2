# Announcements Board API

A RESTful API for an announcements board application with JWT authentication, announcement management, and image uploads.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT
- Cloudinary
- Multer
- Pino
- Helmet
- CORS
- express-rate-limit
- Swagger / OpenAPI
- Vitest

## Features

- User registration and login.
- JWT access and refresh token authentication.
- Announcement creation, retrieval, updating, and deletion.
- Optional image uploads to Cloudinary.
- Image URLs stored in PostgreSQL through Prisma.
- Security headers with Helmet.
- CORS configuration through environment variables.
- Rate limiting for authentication routes.
- HTTP and application logging with Pino.
- API documentation with Swagger UI and OpenAPI.
- Automated validation tests with Vitest.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Your-Natka/announcements-board-api-2.git
cd announcements-board-api-2
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/announcements_board?schema=public"

JWT_SECRET="your_access_secret"
JWT_REFRESH_SECRET="your_refresh_secret"

PORT=3000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Replace the placeholder values with your own credentials.

**Important:** Never commit your `.env` file or expose secret keys.

### 4. Set up the database

Run Prisma migrations:

```bash
npm run prisma:migrate
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

### 5. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

## Available Scripts

| Command                   | Description                                        |
| ------------------------- | -------------------------------------------------- |
| `npm run dev`             | Start the development server with automatic reload |
| `npm run build`           | Compile TypeScript                                 |
| `npm start`               | Start the compiled application                     |
| `npm run typecheck`       | Check TypeScript types without emitting files      |
| `npm run prisma:generate` | Generate Prisma Client                             |
| `npm run prisma:migrate`  | Run database migrations                            |
| `npm run prisma:studio`   | Open Prisma Studio                                 |
| `npm test -- --run`       | Run tests once with Vitest                         |

## API Documentation

Swagger UI: `http://localhost:3000/api-docs`

OpenAPI specification: `http://localhost:3000/openapi.json`

## Main API Routes

### Authentication

| Method | Endpoint         | Description                   |
| ------ | ---------------- | ----------------------------- |
| POST   | `/auth/register` | Register a new user           |
| POST   | `/auth/login`    | Log in                        |
| GET    | `/auth/me`       | Get the current user          |
| POST   | `/auth/refresh`  | Refresh authentication tokens |
| POST   | `/auth/logout`   | Log out                       |

### Announcements

| Method | Endpoint             | Description            |
| ------ | -------------------- | ---------------------- |
| GET    | `/announcements`     | Get announcements      |
| GET    | `/announcements/:id` | Get an announcement    |
| POST   | `/announcements`     | Create an announcement |
| PATCH  | `/announcements/:id` | Update an announcement |
| DELETE | `/announcements/:id` | Delete an announcement |

Protected routes require a valid access token.

## Image Uploads

Announcement images are uploaded using `multipart/form-data`.

Use the field name `image` when uploading a file.

Image uploads are optional. When an image is provided, it is uploaded to Cloudinary and its secure URL is saved in the announcement's `imageUrl` field.

## Running Tests

```bash
npm test -- --run
```

## TypeScript Check

```bash
npm run typecheck
```

## Environment Variables

| Variable                | Description                             |
| ----------------------- | --------------------------------------- |
| `DATABASE_URL`          | PostgreSQL connection string            |
| `JWT_SECRET`            | Secret used to sign access tokens       |
| `JWT_REFRESH_SECRET`    | Secret used to sign refresh tokens      |
| `PORT`                  | Server port                             |
| `ALLOWED_ORIGINS`       | Comma-separated list of allowed origins |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                   |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                      |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                   |

## Project Purpose

This project was developed as part of a Node.js backend assignment. It demonstrates REST API development, authentication, database management, cloud image uploads, security middleware, logging, API documentation, and automated testing.
