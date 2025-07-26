import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import PersonEditor from "./PersonEditor";
import { PersonViewModel } from "../models/PersonViewModel";
import { MainPageState } from "../state/mainPageReducer";
import { ADMIN_ROLE_ID } from "../constants/roles";

// Dummy personService for Yup validations
const dummyPersonService = {
  isEmailUnique: vi.fn(() => true),
};

describe("PersonEditor", () => {
  let dispatch: ReturnType<typeof vi.fn>;
  let onSave: ReturnType<typeof vi.fn>;
  let onDelete: ReturnType<typeof vi.fn>;
  let setSnackbarStatus: ReturnType<typeof vi.fn>;

  const basePerson: PersonViewModel = {
    id: 2,
    firstName: "Jane",
    lastName: "Doe",
    dateOfBirth: "1990-01-01",
    email: "jane.doe@example.com",
    department: 1,
    password: "",
    role: 2,
    biography: "A short biography",
  };

  const adminUser: PersonViewModel = {
    id: 1,
    firstName: "Admin",
    lastName: "User",
    dateOfBirth: "1980-12-12",
    email: "admin@example.com",
    department: 1,
    password: "",
    role: ADMIN_ROLE_ID,
    biography: "",
  };

  const userState: MainPageState = {
    loggedInUser: adminUser,
    people: [],
    selectedPerson: basePerson,
    departments: [{ id: 1, name: "Dept 1" }],
    roles: [{ id: 2, type: "Role 1" }],
    searchTerm: "",
    filterRole: 0,
    filterDepartment: 0,
    filteredPeople: [],
    uniqueEmail: true,
    errors: {},
    isAuthenticating: false,
    tokenInvalid: false,
  };

  beforeEach(() => {
    dispatch = vi.fn();
    onSave = vi.fn();
    onDelete = vi.fn();
    setSnackbarStatus = vi.fn();
    dummyPersonService.isEmailUnique.mockClear();
  });

  it("renders Add Person title when person id is 0", () => {
    render(
      <PersonEditor
        state={userState}
        dispatch={dispatch}
        person={{ ...basePerson, id: 0 }}
        onSave={onSave}
        onDelete={onDelete}
        personService={dummyPersonService as any}
        setSnackbarStatus={setSnackbarStatus}
      />
    );
    expect(screen.getByRole("heading", { level: 5 })).toHaveTextContent(
      /Add Person/i
    );
  });

  it("renders Edit Person title when person id is not 0", () => {
    render(
      <PersonEditor
        state={userState}
        dispatch={dispatch}
        person={basePerson}
        onSave={onSave}
        onDelete={onDelete}
        personService={dummyPersonService as any}
        setSnackbarStatus={setSnackbarStatus}
      />
    );
    expect(screen.getByRole("heading", { level: 5 })).toHaveTextContent(
      /Edit Person/i
    );
  });

  it("enables inputs if user can edit (admin role)", () => {
    render(
      <PersonEditor
        state={userState}
        dispatch={dispatch}
        person={basePerson}
        onSave={onSave}
        onDelete={onDelete}
        personService={dummyPersonService as any}
        setSnackbarStatus={setSnackbarStatus}
      />
    );

    const firstNameInput = screen.getByLabelText(/First Name/i);
    expect(firstNameInput).not.toHaveAttribute("disabled");
  });

  it("removes server error from field on change and dispatches SET_ERRORS", () => {
    const stateWithErrors: MainPageState = {
      ...userState,
      errors: {
        firstName: ["Error on firstName"],
        email: ["Email error"],
      },
    };

    render(
      <PersonEditor
        state={stateWithErrors}
        dispatch={dispatch}
        person={basePerson}
        onSave={onSave}
        onDelete={onDelete}
        personService={dummyPersonService as any}
        setSnackbarStatus={setSnackbarStatus}
      />
    );

    const firstNameInput = screen.getByLabelText(/First Name/i);

    userEvent.clear(firstNameInput);
    userEvent.type(firstNameInput, "NewValue");

    // The dispatch should be called asynchronously due to formik handleChange
    expect(dispatch).toHaveBeenCalledWith({
      type: "SET_ERRORS",
      payload: { email: ["Email error"] }, // firstName error removed
    });
  });

  it("shows Confirm Password input after changing password", async () => {
    render(
      <PersonEditor
        state={userState}
        dispatch={dispatch}
        person={basePerson}
        onSave={onSave}
        onDelete={onDelete}
        personService={dummyPersonService as any}
        setSnackbarStatus={setSnackbarStatus}
      />
    );

    expect(
      screen.queryByLabelText(/Confirm Password/i)
    ).not.toBeInTheDocument();

    const passwordInput = screen.getByLabelText(/Password/i);
    await act(async () => {
      userEvent.type(passwordInput, "newpassword");
    });

    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
  });

  it.skip("shows error and prevents save if passwords do not match", async () => {
    render(
      <PersonEditor
        state={userState}
        dispatch={dispatch}
        person={basePerson}
        onSave={onSave}
        onDelete={onDelete}
        personService={dummyPersonService as any}
        setSnackbarStatus={setSnackbarStatus}
      />
    );

    const passwordInput = screen.getByLabelText(/Password/i);
    userEvent.type(passwordInput, "pass1");

    const confirmPasswordInput = await screen.findByLabelText(
      /Confirm Password/i
    );
    userEvent.type(confirmPasswordInput, "pass2");

    const saveBtn = screen.getByRole("button", { name: /Save/i });
    userEvent.click(saveBtn);

    expect(
      await screen.findByText(/Passwords do not match/i)
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it.skip("calls onSave with form data when passwords match and form submitted", async () => {
    render(
      <PersonEditor
        state={userState}
        dispatch={dispatch}
        person={basePerson}
        onSave={onSave}
        onDelete={onDelete}
        personService={dummyPersonService as any}
        setSnackbarStatus={setSnackbarStatus}
      />
    );

    const passwordInput = screen.getByLabelText(/Password/i);
    await userEvent.type(passwordInput, "password123");

    // Confirm Password field appears after password change, so find it
    const confirmPasswordInput = await screen.findByLabelText(
      /Confirm Password/i
    );
    await userEvent.type(confirmPasswordInput, "password123");

    const firstNameInput = screen.getByLabelText(/First Name/i);
    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, "Janet");

    const saveBtn = screen.getByRole("button", { name: /Save/i });
    await userEvent.click(saveBtn);

    // Wait for onSave to be called asynchronously
    await screen.findByRole("button", { name: /Save/i }); // can also use `waitFor`

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        password: "password123",
        firstName: "Janet",
      })
    );
  });

  it("handleCancel resets form, calls setSnackbarStatus, and dispatches clear selected person", async () => {
    render(
      <PersonEditor
        state={userState}
        dispatch={dispatch}
        person={{ ...basePerson, firstName: "OriginalName" }}
        onSave={onSave}
        onDelete={onDelete}
        personService={dummyPersonService as any}
        setSnackbarStatus={setSnackbarStatus}
      />
    );

    const firstNameInput = screen.getByLabelText(/First Name/i);

    await act(async () => {
      userEvent.clear(firstNameInput);
      userEvent.type(firstNameInput, "ChangedName");
    });
    expect(firstNameInput).toHaveValue("ChangedName");

    const cancelBtn = screen.getByRole("button", { name: /Cancel/i });

    await act(async () => {
      userEvent.click(cancelBtn);
    });

    expect(firstNameInput).toHaveValue("OriginalName");
    expect(setSnackbarStatus).toHaveBeenCalledWith("info");
    expect(dispatch).toHaveBeenCalledWith({
      type: "SET_SELECTED_PERSON",
      payload: null,
    });
  });

  it("delete button calls onDelete callback when enabled", () => {
    render(
      <PersonEditor
        state={userState}
        dispatch={dispatch}
        person={basePerson}
        onSave={onSave}
        onDelete={onDelete}
        personService={dummyPersonService as any}
        setSnackbarStatus={setSnackbarStatus}
      />
    );

    const deleteBtn = screen.getByRole("button", { name: /Delete/i });
    expect(deleteBtn).toBeEnabled();

    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith(basePerson.id);
  });

  it("delete button is disabled when editing self", () => {
    const stateSelfEdit: MainPageState = {
      ...userState,
      loggedInUser: basePerson, // logged in user same as person edited
    };

    render(
      <PersonEditor
        state={stateSelfEdit}
        dispatch={dispatch}
        person={basePerson}
        onSave={onSave}
        onDelete={onDelete}
        personService={dummyPersonService as any}
        setSnackbarStatus={setSnackbarStatus}
      />
    );

    const deleteBtn = screen.getByRole("button", { name: /Delete/i });
    expect(deleteBtn).toBeDisabled();
  });
});
