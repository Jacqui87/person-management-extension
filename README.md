# Person Manager Application

A full-stack web application for managing person records with secure authentication, validation, and admin/user role handling.

## Features

- User login/logout with JWT authentication
- Admin view and edit functionality for all persons
- Regular users can view and edit their own profiles
- Search and filter person records
- Department management and assignment
- Frontend validation with React and Material UI
- Backend validation using FluentValidation
- RESTful API design with ASP.NET Core 7
- Axios for HTTP requests between frontend and backend
- Detailed error handling with inline feedback for users

## Tech Stack

| Layer             | Technologies                                |
| ----------------- | ------------------------------------------- |
| Frontend          | React, TypeScript, Material UI, Axios, Vite |
| Backend           | ASP.NET Core 7, C#                          |
| Validation        | FluentValidation                            |
| Authentication    | JWT bearer tokens                           |
| Development Tools | Visual Studio Code, .NET CLI                |

## Getting Started

### Prerequisites

- .NET 7 SDK
- Node.js and npm/yarn
- Visual Studio Code or your preferred IDE

### Backend Setup

1. Navigate to the root of the repository (where the solution file is located).
2. Run `dotnet build` to build the backend.
3. Run `dotnet run --project UKParliament.CodeTest.Web` to start the backend API.

### Frontend Setup

1. Open a new terminal window.
2. Change directory to `UKParliament.CodeTest.Web\ClientApp`.
3. Run `npm install` to install dependencies.
4. Run `npm run dev` to start the frontend development server.

### Running the Application

- Access the frontend client (usually at `http://localhost:3000`).
- Log in with existing user credentials or register a new user as Admin.
- Add, edit, or delete person records using the interface.
- Validation errors will show inline, both for frontend input checks and backend validation failures.

## Run and Debug

### Backend (ASP.NET Core)

- Use Visual Studio or Visual Studio Code to open the solution.
- Set breakpoints in your C# code as needed.
- In Visual Studio, press F5 or click the Debug button to start debugging the backend.
- In Visual Studio Code, configure `launch.json` to run and debug the .NET app with breakpoints.

### Frontend (React with Vite and TypeScript)

- Start the frontend dev server via `npm run dev` inside the `ClientApp` folder.
- Use browser developer tools (Chrome/Edge) and React Developer Tools extension for debugging components.
- In VS Code, install the Debugger for Chrome extension and configure `launch.json` for debugging React source code with breakpoints.

### Compound Debugging in VS Code

You can debug both backend and frontend simultaneously using a compound launch configuration. Below is a sample `launch.json` snippet to do this:

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

Launch the “Full Stack Debug” configuration to start backend debugging and frontend in Chrome with source maps, enabling breakpoints in both environments.

## API Documentation and Testing

- Use Swagger UI at `https://localhost:7048/swagger/index.html` to explore and test API endpoints.
- Alternatively, use tools like Postman for manual API testing.

## Code Quality and Architecture

- The code adheres to principles like DRY and separation of concerns for maintainability.
- JWT authentication secures both frontend and backend communications.
- React frontend uses functional components with hooks and Material UI for responsive UI.

## Contribution

This repository is a personal project showcasing senior developer skills in .NET and React. Contributions via pull requests are welcome.
