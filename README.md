# Person Manager Application

A full-stack web application for managing person records, built with React and ASP.NET Core 8.

This project began as an implementation of the [UK Parliament's product-senior-developer-home-exercise](https://github.com/ukparliament/product-senior-developer-home-exercise), originally developed and submitted [here](https://github.com/Jacqui87/product-senior-developer-home-exercise). That version needed to be completed within a 7-day window and included a section outlining additional improvements I would pursue with more time.

This repository is a continuation of that work — with the goal of evolving it toward a more robust, production-ready application. It addresses the “What I would do given more time to complete this task” section, turning aspirations into implementation.

# Improvements in Progress

## Completed

1. Codebase Refinement

   - Extracted all **role** and **department** logic from PersonController.cs, PersonService.cs, and personService.ts.
   - Created dedicated modules: RoleService and DepartmentService (both backend and frontend), RoleController and DepartmentController.
   - This enhances separation of concerns, simplifies testing, and prepares the codebase for scaling.

2. Targeted Testing Improvements

   - Separated existing tests to match the new service boundaries (PersonService, RoleService, DepartmentService, PersonController, RoleController, DepartmentController).
   - This makes the test suite more modular, easier to navigate, and more aligned with single-responsibility principles.
   - It also improves maintainability by ensuring tests target the appropriate domain logic rather than broad controller interactions.

## Planned Enhancements

**_(adapted and expanded from the original "[What I would do given more time to complete this task](https://github.com/Jacqui87/product-senior-developer-home-exercise?tab=readme-ov-file#what-i-would-do-given-more-time-to-complete-this-task) list)_**

1. Testing coverage frontend & backend:

   - Increase coverage and add more tests dealing with edge cases.
   - Fix or remove skipped tests - there are currently 4 skipped tests.

2. API Improvements:

   - Move from PUT to PATCH for partial updates.

3. Frontend Enhancements:

   - Use TanStack Query for data fetching/caching, for example in the personService.ts.
   - Add i18n support for accessibility and wider reach (e.g. Welsh/English support).
   - Improve UX with features like clearable search, better dropdowns (MUI AutoComplete), and profile photo support (using Azure Blob Storage).

4. Security:

   - Add email verification for updates with an email to the updated address with either a link to click on or a verification code to verify the change.

5. Bulk Operations:

   - Add bulk upload/edit for users, departments, and roles.

6. Department and Role Management:

   - Implement a department and role management system

7. DevOps & Tooling:

   - Research how to add CI/CD pipelines for automated testing, linting, and deployment.

8. Implement refresh token support:

   - Add refresh tokens to complement JWT access tokens, allowing the frontend to renew sessions transparently.
   - This would ensure that the current logged-in user is continuously validated and still authorized to access the application.
   - It would prevent stale or invalid sessions by requiring periodic revalidation without forcing users to frequently log in again.

9. Add end-to-end (E2E) testing:
   - Implement automated UI tests using a tool like Cypress or Playwright to cover critical user journeys.
   - Ensure comprehensive test coverage beyond unit and integration tests to validate application workflows from the user perspective.
   - This would improve confidence in production readiness and reduce regression risks.

---

# Screenshots

- Updated Swagger API

![Updated Swagger API](screenshots/updated_swagger_api.png)
