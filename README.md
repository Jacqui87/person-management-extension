# Person Manager Application

A full-stack web application for managing person records, built with React and ASP.NET Core 8.

This project began as an implementation of the [UK Parliament's product-senior-developer-home-exercise](https://github.com/ukparliament/product-senior-developer-home-exercise), originally developed and submitted [here](https://github.com/Jacqui87/product-senior-developer-home-exercise). That version was completed within a 7-day window and included a section outlining improvements I would pursue with more time.

This repository continues that work — evolving it toward a more robust, production-ready application by turning those aspirations into implementation.

---

### 🌐 Bilingual Support (Cymorth Dwyieithog)

The application now fully supports both **English** (`en-GB`) and **Welsh** (`cy-GB`) across the entire user interface — including form labels, validation messages, error feedback, navigation items, and instructional text.

Users can choose their preferred language from a dropdown in the interface. This preference is saved and automatically applied the next time they log in, ensuring a consistent experience in their selected language.

---

## 🚀 Improvements in Progress

## ✅ Completed vs ❌ Planned Enhancements

| Feature Area                         | Description                                                              | Status |
| ------------------------------------ | ------------------------------------------------------------------------ | ------ |
| **Codebase Refinement**              | Extracted Role/Department logic into dedicated services and controllers. | ✅     |
| **Targeted Testing Improvements**    | Split tests per service, modularised coverage, improved maintainability. | ✅     |
| **Frontend Performance**             | Lazy-loaded React components with `React.lazy` and `Suspense`.           | ✅     |
| **Bilingual UI Support**             | English and Welsh translations via `react-i18next`.                      | ✅     |
| **User Language Preference**         | Language selection UI with persistence on login.                         | ✅     |
| **Test Coverage (Frontend/Backend)** | Expand unit tests, add edge case coverage, fix/remove 4 skipped tests.   | ❌     |
| **API Improvements**                 | Move from `PUT` to `PATCH` for partial updates.                          | ❌     |
| **TanStack Query**                   | Add TanStack Query for improved data fetching and caching.               | ❌     |
| **Improved UX Features**             | Clearable search and MUI Autocomplete dropdowns.                         | ✅     |
| **Profile Photo Upload**             | Support uploading profile photos via Azure Blob Storage integration.     | ❌     |
| **Security - Email Verification**    | Send email with link or code to verify updates.                          | ❌     |
| **Bulk Operations**                  | Add bulk upload/edit support for people, departments, roles.             | ❌     |
| **Role/Department Admin**            | Allow admin users to manage roles and departments via UI.                | ❌     |
| **CI/CD & Tooling**                  | Set up CI/CD pipelines for automated tests, linting, deployment.         | ❌     |
| **Refresh Token Support**            | Add refresh token handling to extend sessions without re-login.          | ❌     |
| **End-to-End (E2E) Testing**         | Add Cypress or Playwright tests to cover key user workflows.             | ❌     |

### ✅ Completed

#### 1. Codebase Refinement

- Extracted role and department logic into dedicated backend and frontend modules (RoleService, DepartmentService, controllers).
- Improved separation of concerns, simplified testing, and enhanced scalability.

#### 2. Targeted Testing Improvements

- Reorganized tests to align with new service boundaries.
- Made tests more modular and maintainable by focusing on specific domain logic.

#### 3. Frontend Performance Optimisation

- Implemented lazy loading of key React components using React.lazy and Suspense.
- Reduced initial load time by deferring non-essential component loading.

#### 4. English/Welsh Internationalisation (not yet configurable by a user)

- Added bilingual support via react-i18next for all UI labels and messages.
- Users can select preferred language; translation keys are well-organized by domain.

#### 5. Clearable Search & Autocomplete Dropdowns

- Enhanced filtering UI with clearable search inputs and MUI Autocomplete for roles and departments.
- Improved user experience, accessibility, and integrated translation support.

---

### 🛠️ Planned Enhancements

_*(Adapted and expanded from the original [“What I would do given more time to complete this task”](https://github.com/Jacqui87/product-senior-developer-home-exercise?tab=readme-ov-file#what-i-would-do-given-more-time-to-complete-this-task))*_

#### 1. **Testing Coverage (Frontend & Backend)**

- Increase test coverage and add more edge case scenarios.
- Fix or remove skipped tests (currently 4 are skipped).

#### 2. **API Improvements**

- Replace `PUT` with `PATCH` for partial updates.

#### 3. **Frontend Enhancements**

- Integrate [TanStack Query](https://tanstack.com/query) for data fetching and caching.
- Support for profile photo uploads (via Azure Blob Storage).

#### 4. **Security Enhancements**

- Add email verification for address updates (e.g., send a verification link or code to confirm changes).

#### 5. **Bulk Operations**

- Implement bulk upload/edit features for users, departments, and roles.

#### 6. **Role & Department Management**

- Expand admin functionality to manage departments and roles dynamically.

#### 7. **DevOps & Tooling**

- Set up CI/CD pipelines for automated testing, linting, and deployment.

#### 8. **Refresh Token Support**

- Add refresh tokens to extend JWT-based authentication.
- Enables seamless session renewal without forcing frequent logins.

#### 9. **End-to-End (E2E) Testing**

- Add automated UI tests using Cypress or Playwright.
- Improve confidence in production-readiness and reduce regression risk.

---

## 📸 Screenshots

### ✅ Updated Swagger API

![Updated Swagger API](screenshots/updated_swagger_api.png)

### ✅ UI available in Welsh - includes a language drop-down which is automatically applied the next time they log in.

![UI available in Welsh - includes a language drop-down which is automatically applied the next time they log in](screenshots/welsh_ui.png)
