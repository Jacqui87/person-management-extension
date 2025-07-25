# Person Manager Application

A full-stack web application designed for managing person records with secure user authentication and role-based access control. This app enables admin users to view and manage all person records and regular users to view and edit their own profiles. It features comprehensive validation, filtering, department and role management, and a responsive, user-friendly UI.

# Project Evolution

This project originated from the [UK Parliament's product-senior-developer-home-exercise](https://github.com/ukparliament/product-senior-developer-home-exercise) starter repository and has been extended significantly into a production-ready React and ASP.NET Core 7 application — demonstrating robust architectural patterns, security best practices, and polished implementation.

Key extensions include:

- Full JWT-based authentication and authorization
- Role-based access control separating admin and user privileges
- Advanced search, filtering, and pagination for person records
- Rich department and role management integrated end-to-end
- Comprehensive frontend form validation via Formik and Yup
- FluentValidation-based backend validation with error propagation
- RESTful API design with clear separation of concerns
- Integration of Material UI and responsive design for better UX
- Modern frontend tooling with Vite and TypeScript for faster builds and type safety
- Extensive error handling with inline, user-friendly messages
- Development and debugging workflows supporting both frontend and backend concurrently

# Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Running and Debugging](#running-and-debugging)
- [API Documentation and Testing](#api-documentation-and-testing)
- [Code Quality and Architecture](#code-quality-and-architecture)
- [Contributing](#contributing)
- [License](#license)

# Features

- User authentication with JWT bearer tokens
- Role-based access control: Admins manage all persons, users manage their own profiles
- Search and filtering of person records with responsive UI
- Department and role management with admin interfaces
- Frontend validation using Formik and Yup
- Backend validation using FluentValidation in ASP.NET Core
- RESTful API built on ASP.NET Core 7
- Frontend API consumption with Axios
- Inline error handling and feedback for improved user experience
- Responsive design using Material UI
- Maintainable and scalable code architecture

# Tech Stack

| Layer             | Technologies                                |
| ----------------- | ------------------------------------------- |
| Frontend          | React, TypeScript, Material UI, Axios, Vite |
| Backend           | ASP.NET Core 7, C#                          |
| Validation        | Yup (frontend), FluentValidation (backend)  |
| Authentication    | JWT Bearer Tokens                           |
| Development Tools | Visual Studio Code, .NET CLI, npm/yarn      |

# Getting Started

### Prerequisites

- .NET 7 SDK
- Node.js (latest LTS recommended) and npm or yarn
- Visual Studio Code or preferred IDE

### Backend Setup

1. Clone the repository.
2. Navigate to the root (where the `.sln` file is located).
3. Run `dotnet build` to build the backend.
4. Run `dotnet run --project UKParliament.CodeTest.Web` to start the backend API (API runs on default port 7048).

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
- Use Postman or similar tools for in-depth manual API testing.

# Code Quality and Architecture

- Followed SOLID principles and separation of concerns.
- Frontend uses functional React components with hooks, maintaining clean state management.
- Reusable, styled components with Material UI and responsive design patterns.
- Backend inputs validated robustly using FluentValidation for reliable data integrity.
- JWT tokens secure user authentication across the stack.
- Detailed inline validation errors provide friendly and clear user feedback.

# Contribution

This repository serves as a senior developer's personal project showcasing advanced skills building full-stack web applications with modern .NET and React. Contributions via pull requests are welcome — including:

- Bug fixes
- Performance improvements
- Documentation enhancements
- Additional test coverage

Please open issues for questions or feature requests.
