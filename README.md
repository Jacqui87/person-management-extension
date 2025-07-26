# Person Manager Application

A full-stack web application for managing Parliament person records with React and ASP.NET Core.

This app supports secure user authentication and role-based access control. Admin users can manage all person records; regular users can view and update their own profiles. Features include validation, filtering, department and role management, and a responsive UI.

# Project Evolution

This project originated from the [UK Parliament's product-senior-developer-home-exercise](https://github.com/ukparliament/product-senior-developer-home-exercise) and has been extended toward a production-ready React and ASP.NET Core 8 application.

Key extensions include:

- JWT-based authentication and authorization
- Role-based access control separating admin and user privileges
- Advanced search and filtering for person records
- Department and role management
- Frontend validation (Formik + Yup)
- Backend validation (FluentValidation)
- RESTful API built with ASP.NET Core 8
- Frontend API calls via Axios
- Inline error display
- Responsive design with Material UI
- Maintainable code structure

# Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Running and Debugging](#running-and-debugging)
- [Performance Testing & Lighthouse Audit](#performance-testing-&-lighthouse-audit)
- [API Documentation and Testing](#api-documentation-and-testing)
- [Code Quality and Architecture](#code-quality-and-architecture)
- [What I would do given more time to complete this task](#what-i-would-do-given-more-time-to-complete-this-task)
- [API Schema Descriptions](#api-schema-dDescriptions)
- [Request and Response Examples](#request-and-response-examples)
- [API Usage Examples](#api-usage-examples)
- [Architecture Diagram](#architecture-diagram)

# Features

- User authentication with JWT bearer tokens
- Role-based access control: Admins manage all persons, users manage their own profiles
- Search and filtering of person records with responsive UI
- Department and role management with admin interfaces
- Frontend validation using Formik and Yup
- Backend validation using FluentValidation in ASP.NET Core
- RESTful API built on ASP.NET Core 8
- Frontend API consumption with Axios
- Inline error display
- Responsive design using Material UI
- Maintainable and scalable code architecture

# Tech Stack

| Layer             | Technologies                                        |
| ----------------- | --------------------------------------------------- |
| Frontend          | React, TypeScript, Material UI, Axios, Vite, Formik |
| Backend           | ASP.NET Core 8, C#                                  |
| Validation        | Yup (frontend), FluentValidation (backend)          |
| Authentication    | JWT Bearer Tokens                                   |
| Development Tools | Visual Studio Code, .NET CLI, npm/yarn              |

# Getting Started

### Prerequisites

- .NET 8 SDK
- Node.js (latest LTS recommended) and npm or yarn
- Visual Studio Code or preferred IDE

### Backend Setup

1. Clone the repository.
2. Navigate to the root (where the `.sln` file is located).
3. Run `dotnet build` to build the backend.
4. Run `dotnet run --project UKParliament.CodeTest.Web` to start the backend API - API runs on default port 7048 (https://localhost:7048).

### Frontend Setup

1. Open a new terminal window.
2. Navigate to `UKParliament.CodeTest.Web\ClientApp`.
3. Run `npm install` (or `yarn install`) to install dependencies.
4. Run `npm run dev` to start the frontend development server (typically runs on http://localhost:3000).

# Running and Debugging

### Backend (ASP.NET Core)

- Open the solution in Visual Studio or Visual Studio Code.
- Set breakpoints as needed in C# code.
- Use `F5` or the Debug button to start debugging.
- In VS Code, configure `launch.json` for debugging with breakpoints.

### Frontend (React with Vite and TypeScript)

- Start the dev server with `npm run dev`.
- Use browser devtools and React Developer Tools for debugging.
- Optional: Set breakpoints and debug inside VS Code with `launch.json`.

### Compound Debugging (Backend + Frontend)

Use the below snippet in `.vscode/launch.json` to debug backend and frontend simultaneously:

```
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": ".NET Core Launch (backend)",
            "type": "coreclr",
            "request": "launch",
            "preLaunchTask": "build",
            "program": "${workspaceFolder}/bin/Debug/net8.0/YourBackendApp.dll",
            "args": [],
            "cwd": "${workspaceFolder}",
            "stopAtEntry": false,
            "serverReadyAction": {
                "action": "openExternally",
                "pattern": "\bNow listening on:\s+(https?://\S+)"
            },
            "env": {
                "ASPNETCORE_ENVIRONMENT": "Development"
            },
            "sourceFileMap": {
                "/Views": "${workspaceFolder}/Views"
            }
        }
    ]
}
```

# Performance Testing & Lighthouse Audit

The frontend application was audited using `https://developers.google.com/web/tools/lighthouse` on the production build to ensure high performance, accessibility, SEO, and adherence to best practices.

## Testing Process

- The production build was created with:

```
npm run build
```

- The build was locally served using:

```
npm run preview
```

- Lighthouse audits were performed on the preview server URL (e.g., http://localhost:4173 or similar) accessed in an incognito Google Chrome browser, ensuring testing without interference from extensions or cached data.

### Latest Lighthouse Scores

| Category       | Score |
| -------------- | ----- |
| Performance    | 86    |
| Accessibility  | 98    |
| Best Practices | 93    |
| SEO            | 91    |

These results demonstrate that the application is production-ready, with strong optimization around runtime performance, accessibility compliance, modern best practices, and SEO.

# API Documentation and Testing

- API endpoints are documented and testable via **Swagger UI** at `https://localhost:7048/swagger/index.html`.
- Swagger UI is accessible when the backend is running in Development mode.
- Use Postman or similar tools for in-depth manual API testing.

# Code Quality and Architecture

- Based on SOLID principles and separation of concerns.
- Frontend uses functional components and hooks.
- Uses Material UI with responsive layouts.
- Backend validates input with FluentValidation.
- JWT tokens secure authentication across frontend and backend.
- Inline validation messages provide clear feedback.

# What I would do given more time to complete this task

1. Testing coverage:
   -- Increase coverage for edge cases and integration flows.
   -- Fix or remove skipped/failing tests.

2. API Improvements:
   -- Move from PUT to PATCH for partial updates.

3. Frontend Enhancements:
   -- Use TanStack Query for data fetching/caching, for example in the personService.ts.
   -- Add i18n support for accessibility and wider reach (e.g. Welsh/English support).
   -- Improve UX with features like clearable search, better dropdowns (MUI AutoComplete), and profile photo support (using Azure Blob Storage).

4. Security:
   -- Enforce strong password policies: minimum 8 characters, mixed case, numbers, special characters.
   -- Add email verification for updates with an email to the updated address with either a link to click on or a verification code to verify the change.

5. Bulk Operations:
   -- Add bulk upload/edit for users, departments, and roles.

6. Department and Role Management:
   -- Implement a department and role management system

7. DevOps & Tooling:
   -- Add CI/CD pipelines for automated testing, linting, and deployment.

8. Documentation:
   -- Expand API docs with request/response examples.
   -- Add architecture diagrams.

# API Schema Descriptions

## Person DTO

```json
{
  "id": 1,
  "firstName": "string",
  "lastName": "string",
  "role": 2,
  "email": "string",
  "password": "string",
  "biography": "string (optional)",
  "department": 3,
  "dateOfBirth": "YYYY-MM-DD"
}
```

## Department DTO

```json
{
  "id": 1,
  "name": "string"
}
```

## Role DTO

```json
{
  "id": 1,
  "name": "string"
}
```

## Auth Request

```json
{
  "email": "string",
  "password": "string"
}
```

## Auth Response

```json
{
  "token": "string (JWT)",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "email": "string",
    "role": 2
  }
}
```

---

# Request and Response Examples

## Create Person

**Request:**  
`POST /api/person`

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "role": 2,
  "email": "jane.doe@example.com",
  "password": "Password123!",
  "biography": "A short bio about Jane.",
  "department": 3,
  "dateOfBirth": "1990-05-15"
}
```

**Response:**  
`201 Created`

```json
{
  "id": 42,
  "firstName": "Jane",
  "lastName": "Doe",
  "role": 2,
  "email": "jane.doe@example.com",
  "biography": "A short bio about Jane.",
  "department": 3,
  "dateOfBirth": "1990-05-15"
}
```

## Get All Departments

**Request:**  
`GET /api/departments`

**Response:**  
`200 OK`

```json
[
  {
    "id": 1,
    "name": "IT"
  },
  {
    "id": 2,
    "name": "HR"
  }
]
```

## Update Person (PUT)

**Request:**  
`PUT /api/person/42`

```json
{
  {
  "id": 42,
  "firstName": "Jane",
  "lastName": "Doe",
  "role": 2,
  "email": "jane.doe@example.com",
  "password": "Password123!",
  "biography": "Updated bio for Jane.",
  "department": 3,
  "dateOfBirth": "1990-05-15"
}
}
```

**Response:**  
`200 OK`

```json
{
  "id": 42,
  "firstName": "Jane",
  "lastName": "Doe",
  "role": 2,
  "email": "jane.doe@example.com",
  "biography": "Updated bio for Jane.",
  "department": 3,
  "dateOfBirth": "1990-05-15"
}
```

## Authentication

**Request:**  
`POST /api/auth/login`

```json
{
  "email": "jane.doe@example.com",
  "password": "Password123!"
}
```

**Response:**  
`200 OK`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": 42,
    "email": "jane.doe@example.com",
    "role": 2
  }
}
```

---

# API Usage Examples

## Fetch All Persons

```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" https://localhost:7048/api/person
```

## Create a Department

```bash
curl -X POST https://localhost:7048/api/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"name": "Finance"}'
```

## Update a User

```bash
curl -X PUT https://localhost:7048/api/person/42 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "id": 42,
    "firstName": "Jane",
    "lastName": "Doe",
    "role": 2,
    "email": "jane.doe@example.com",
    "password": "Password123!",
    "biography": "Updated bio for Jane.",
    "department": 3,
    "dateOfBirth": "1990-05-15"
}'
```

---

# Architecture Diagram

```
+--------------------------------------+
|              Frontend                |
|--------------------------------------|
| React (TypeScript, MUI, Formik/Yup)  |
+--------------------+-----------------+
                     |
                     |  REST API (HTTPS)
                     v
+--------------------+-----------------+
|              Backend                 |
|--------------------------------------|
| ASP.NET Core 8 API                   |
| FluentValidation, JWT Auth           |
+--------------------+-----------------+
                     |
                     |  LINQ Queries
                     v
+--------------------+-----------------+
|             Database                 |
|--------------------------------------|
|         In memory database           |
+--------------------------------------+
```
