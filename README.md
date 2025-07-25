# Person Manager Application

A full-stack web application for managing Parliament person records with React and ASP.NET Core.

This app supports secure user authentication and role-based access control. Admin users can manage all person records; regular users can view and update their own profiles. Features include validation, filtering, department and role management, and a responsive UI.

# Project Evolution

This project originated from the [UK Parliament's product-senior-developer-home-exercise](https://github.com/ukparliament/product-senior-developer-home-exercise) and has been extended toward a production-ready React and ASP.NET Core 7 application.

Key extensions include:

- JWT-based authentication and authorization
- Role-based access control separating admin and user privileges
- Advanced search and filtering for person records
- Department and role management
- Frontend validation (Formik + Yup)
- Backend validation (FluentValidation)
- RESTful API built with ASP.NET Core 7
- Frontend API calls via Axios
- Inline error display
- Responsive design with Material UI
- Maintainable code structure

# Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Running and Debugging](#running-and-debugging)
- [API Documentation and Testing](#api-documentation-and-testing)
- [Code Quality and Architecture](#code-quality-and-architecture)
- [What I would do given more time to complete this task](#what-i-would-do-given-more-time-to-complete-this-task)
- [Contributing](#contributing)

# Features

- User authentication with JWT bearer tokens
- Role-based access control: Admins manage all persons, users manage their own profiles
- Search and filtering of person records with responsive UI
- Department and role management with admin interfaces
- Frontend validation using Formik and Yup
- Backend validation using FluentValidation in ASP.NET Core
- RESTful API built on ASP.NET Core 7
- Frontend API consumption with Axios
- Inline error display
- Responsive design using Material UI
- Maintainable and scalable code architecture

# Tech Stack

| Layer             | Technologies                                        |
| ----------------- | --------------------------------------------------- |
| Frontend          | React, TypeScript, Material UI, Axios, Vite, Formik |
| Backend           | ASP.NET Core 7, C#                                  |
| Validation        | Yup (frontend), FluentValidation (backend)          |
| Authentication    | JWT Bearer Tokens                                   |
| Development Tools | Visual Studio Code, .NET CLI, npm/yarn              |

# Getting Started

### Prerequisites

- .NET 7 SDK
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
            "program": "${workspaceFolder}/bin/Debug/net7.0/YourBackendApp.dll",
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

1. Add translations using i18Next, e.g., Welsh/English support.
2. Support user profile photos, possibly using Azure Blob Storage.
3. Implement a department and role management system allowing dynamic addition of entries.
4. Add bulk upload capability for users, departments, and roles.
5. Provide bulk editing features for these records.
6. Improve UI by adding an 'x' icon next to the search bar for quick clearing.
7. Replace dropdown filters with MUI's AutoComplete component for better usability.
8. Enforce stronger password rules: minimum 8 characters, mixed case, numbers, special characters.
9. Fix currently skipped failing React tests.
10. Use HTTP PATCH instead of PUT to optimize updates and reduce data overwrite.
11. Add a snackbar notification system to provide feedback on add/update operations, enhancing user experience.

# Contribution

This repository serves as a senior developer's personal project showcasing advanced skills building full-stack web applications with modern .NET and React. Contributions via pull requests are welcome — including:

- Bug fixes
- Performance improvements
- Documentation enhancements
- Additional test coverage
