import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PersonEditor from "./PersonEditor";
import { ADMIN_ROLE_ID } from "../constants/roles";

// Minimal mock for MainPageState, PersonViewModel, etc.
const baseState = {
  loggedInUser: {
    id: 1,
    role: ADMIN_ROLE_ID,
    firstName: "Admin",
    lastName: "User",
    department: 1,
    dateOfBirth: "1980-01-01",
    email: "admin@example.com",
    biography: "",
    password: "",
  },
  departments: [
    { id: 1, name: "IT" },
    { id: 2, name: "HR" },
  ],
  roles: [
    { id: 1, type: "Admin" },
    { id: 2, type: "User" },
  ],
  errors: {}, // no server errors initially
};

describe("PersonEditor", () => {
  let dispatchMock: any;
  let onSaveMock: any;
  let onDeleteMock: any;

  beforeEach(() => {
    dispatchMock = vi.fn();
    onSaveMock = vi.fn();
    onDeleteMock = vi.fn();
  });

  it("renders fields with initial values and buttons", () => {
    render(
      <PersonEditor
        state={baseState as any}
        dispatch={dispatchMock}
        person={baseState.loggedInUser}
        onSave={onSaveMock}
        onDelete={onDeleteMock}
      />
    );

    expect(screen.getByText(/edit person/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/first name/i)).toHaveValue("Admin");
    expect(screen.getByLabelText(/last name/i)).toHaveValue("User");
    expect(screen.getByLabelText(/date of birth/i)).toHaveValue("1980-01-01");
    expect(screen.getByLabelText(/email/i)).toHaveValue("admin@example.com");

    // Buttons present
    expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeEnabled();
    // Delete disabled because editing self
    expect(screen.getByRole("button", { name: /delete/i })).toBeDisabled();
  });

  it.skip("disables fields if user cannot edit", () => {
    // loggedInUser is someone else => cannot edit person with id 2
    const state = {
      ...baseState,
      loggedInUser: {
        ...baseState.loggedInUser,
        id: 99,
        role: 2, // Not admin
      },
    };

    render(
      <PersonEditor
        state={state as any}
        dispatch={dispatchMock}
        person={{ ...baseState.loggedInUser, id: 2 }}
        onSave={onSaveMock}
      />
    );

    // Fields should be disabled because currentUser can't edit this person
    expect(screen.getByLabelText(/first name/i)).toBeDisabled();
    expect(screen.getByLabelText(/email/i)).toBeDisabled();

    // Save and cancel buttons not shown because can't edit
    expect(screen.queryByRole("button", { name: /save/i })).toBeNull();
  });

  it("shows validation error if required fields are empty and blurred", async () => {
    render(
      <PersonEditor
        state={baseState as any}
        dispatch={dispatchMock}
        person={baseState.loggedInUser}
        onSave={onSaveMock}
      />
    );

    const firstNameInput = screen.getByLabelText(/first name/i);
    // Clear field
    userEvent.clear(firstNameInput);
    fireEvent.blur(firstNameInput);

    expect(
      await screen.findByText(/first name is required/i)
    ).toBeInTheDocument();
  });

  it.skip("dispatches error clearing when changing a field with server error", () => {
    const stateWithErrors = {
      ...baseState,
      errors: { FirstName: ["Server error"] },
    };

    render(
      <PersonEditor
        state={stateWithErrors as any}
        dispatch={dispatchMock}
        person={baseState.loggedInUser}
        onSave={onSaveMock}
      />
    );

    const firstNameInput = screen.getByLabelText(/first name/i);
    fireEvent.change(firstNameInput, { target: { value: "NewName" } });

    expect(dispatchMock).toHaveBeenCalledWith({
      type: "SET_ERRORS",
      payload: {}, // Error cleared for FirstName
    });
  });

  it("shows confirm password input after changing password", async () => {
    render(
      <PersonEditor
        state={baseState as any}
        dispatch={dispatchMock}
        person={baseState.loggedInUser}
        onSave={onSaveMock}
      />
    );

    expect(screen.queryByLabelText(/confirm password/i)).toBeNull();

    const passwordInput = screen.getByLabelText(/^password$/i);
    await userEvent.type(passwordInput, "mypassword");

    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("does not call onSave if passwords do not match on submit", async () => {
    render(
      <PersonEditor
        state={baseState as any}
        dispatch={dispatchMock}
        person={baseState.loggedInUser}
        onSave={onSaveMock}
      />
    );

    const passwordInput = screen.getByLabelText(/^password$/i);
    const saveButton = screen.getByRole("button", { name: /save/i });

    await userEvent.type(passwordInput, "mypassword");

    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    await userEvent.type(confirmPasswordInput, "different");

    fireEvent.click(saveButton);

    // onSave should NOT be called because passwords don't match
    expect(onSaveMock).not.toBeCalled();

    // Confirm password error should show
    expect(
      await screen.findByText(/passwords do not match/i)
    ).toBeInTheDocument();
  });

  it("calls onSave with form values on valid submit", async () => {
    render(
      <PersonEditor
        state={baseState as any}
        dispatch={dispatchMock}
        person={baseState.loggedInUser}
        onSave={onSaveMock}
      />
    );

    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: baseState.loggedInUser.id,
          firstName: baseState.loggedInUser.firstName,
        })
      );
    });
  });

  it("dispatches SET_SELECTED_PERSON null on cancel click", () => {
    render(
      <PersonEditor
        state={baseState as any}
        dispatch={dispatchMock}
        person={baseState.loggedInUser}
        onSave={onSaveMock}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(dispatchMock).toHaveBeenCalledWith({
      type: "SET_SELECTED_PERSON",
      payload: null,
    });
  });

  it.skip("delete button calls onDelete with person id and is disabled when editing self", async () => {
    render(
      <PersonEditor
        state={baseState as any}
        dispatch={dispatchMock}
        person={baseState.loggedInUser}
        onSave={onSaveMock}
        onDelete={onDeleteMock}
      />
    );

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    expect(deleteButton).toBeDisabled();

    // Re-render with another person
    const otherPerson = { ...baseState.loggedInUser, id: 2 };
    render(
      <PersonEditor
        state={baseState as any}
        dispatch={dispatchMock}
        person={otherPerson}
        onSave={onSaveMock}
        onDelete={onDeleteMock}
      />
    );

    const deleteButton2 = screen.getByRole("button", { name: /delete/i });
    expect(deleteButton2).toBeEnabled();

    fireEvent.click(deleteButton2);
    expect(onDeleteMock).toHaveBeenCalledWith(2);
  });
});
