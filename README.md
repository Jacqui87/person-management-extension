# Person Manager Application

A full-stack web application for managing person records with secure authentication, validation, and admin/user role handling.

## Features

- User login/logout with JWT authentication  
- Admin view and edit functionality for all persons  
- Users can view and edit their own profile only  
- Search and filter persons  
- Department management  
- Backend validation with FluentValidation  
- Frontend validation and error display with React and Material UI  
- Axios used for HTTP requests  
- Comprehensive error handling and user feedback

## Tech Stack

- **Frontend:** React, TypeScript, Material UI, Axios  
- **Backend:** ASP.NET Core 7, C#, FluentValidation  
- **Authentication:** JWT Bearer Tokens  
- **Build tools:** Vite, Visual Studio Code  
- **API:** RESTful with ASP.NET Core Controllers

## Installation Instructions

### Prerequisites

Ensure you have installed:

- [.NET 7 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/7.0)  
- [Node.js 18+](https://nodejs.org/en/download/)
- [Git](https://git-scm.com/downloads)  

### Backend Setup

* cd to the root folder i.e. where the solution file is.
* Run: dotnet build
* Run: dotnet run --project UKParliament.CodeTest.Web

### Frontend Setup

* Open a new terminal
* From the root cd UKParliament.CodeTest.Web\ClientApp
* Run: npm install
* Run: npm run dev

### Running the Application

- Login with an existing user or create a new user as Admin.
- Use the interface to add, edit, delete persons.
- Invalid data such as malformed emails will show validation errors on both frontend and backend.
- Errors from the backend validation will appear next to form fields for correction.

## Testing

* You can test backend API endpoints using tools like [Postman](https://www.postman.com/) or Swagger: https://localhost:7048/swagger/index.html
