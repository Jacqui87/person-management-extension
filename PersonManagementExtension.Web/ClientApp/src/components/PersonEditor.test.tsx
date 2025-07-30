import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import PersonEditor from "./PersonEditor";
import { PersonViewModel } from "../models/PersonViewModel";
import { PersonState } from "../state/personReducer";
import { ADMIN_ROLE_ID } from "../constants/roles";

// Dummy personService for Yup validations
const dummyPersonService = {
  isEmailUnique: vi.fn(() => Promise.resolve(true)),
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
    cultureCode: "en-GB",
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
    cultureCode: "en-GB",
    biography: "",
  };

  const userState: PersonState = {
    loggedInUser: adminUser,
    people: [],
    selectedPerson: basePerson,
    departments: [{ id: 1, name: "Dept 1" }],
    roles: [{ id: 2, type: "Role 1" }],
    searchTerm: "",
    filterRole: 0,
    filterDepartment: 0,
    filteredPeople: [],
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
      /person_editor.add/i
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
      /person_editor.edit/i
    );
  });

  it("renders and enables form fields", () => {
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
      screen.getByLabelText(/person_editor.first_name/i)
    ).not.toBeDisabled();
    expect(screen.getByLabelText(/person_editor.email/i)).toHaveValue(
      "jane.doe@example.com"
    );
    expect(screen.getByRole("button", { name: /common.save/i })).toBeEnabled();
  });

  it.skip("shows Confirm Password input after changing password", async () => {
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
      screen.queryByLabelText(/person_editor.confirm_password/i)
    ).not.toBeInTheDocument();

    // Type into Password input (should set passwordChanged = true)
    const passwordInput = screen.getByLabelText(/person_editor.password/i);
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, "Password1!");
    await userEvent.tab(); // move focus away to trigger blur validation

    // Confirm Password field appears now
    const confirmPasswordInput = await screen.findByLabelText(
      /person_editor.confirm_password/i
    );

    await waitFor(() => {
      expect(confirmPasswordInput).toBeInTheDocument();
    });
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

    // Type into Password input (should set passwordChanged = true)
    const passwordInput = screen.getByLabelText(/person_editor.password/i);
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, "Password1!");
    await userEvent.tab(); // move focus away to trigger blur validation

    // Confirm Password field appears now
    const confirmPasswordInput = await screen.findByLabelText(
      /person_editor.confirm_password/i
    );

    // Type mismatching confirm password
    await userEvent.clear(confirmPasswordInput);
    await userEvent.type(confirmPasswordInput, "Mismatch1!");
    await userEvent.tab(); // trigger blur and validation on confirmPassword

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /common.save/i })
      ).toBeDisabled();
      expect(
        screen.getByText(/person_editor.passwords_do_not_match/i)
      ).toBeInTheDocument();
    });

    // onSave should not be called since form is invalid
    expect(onSave).not.toHaveBeenCalled();
  });

  it.skip("calls onSave with updated form data if valid", async () => {
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
    // Type into Password input (should set passwordChanged = true)
    const passwordInput = screen.getByLabelText(/person_editor.password/i);
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, "Password1!");
    await userEvent.tab(); // move focus away to trigger blur validation

    // Confirm Password field appears now
    const confirmPasswordInput = await screen.findByLabelText(
      /person_editor.confirm_password/i
    );

    // Type mismatching confirm password
    await userEvent.clear(confirmPasswordInput);
    await userEvent.type(confirmPasswordInput, "Password1!");
    await userEvent.tab(); // trigger blur and validation on confirmPassword

    await userEvent.clear(screen.getByLabelText(/person_editor.first_name/i));
    await userEvent.type(
      screen.getByLabelText(/person_editor.first_name/i),
      "Janet"
    );

    const saveBtn = await screen.getByRole("button", { name: /common.save/i });
    await waitFor(() => expect(saveBtn).toBeEnabled());
    await userEvent.click(saveBtn);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: "Janet", password: "Password1!" })
      );
    });
  });

  it("calls onDelete with person id if delete clicked", () => {
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
    const del = screen.getByRole("button", { name: /common.delete/i });
    expect(del).not.toBeDisabled();
    fireEvent.click(del);
    expect(onDelete).toHaveBeenCalledWith(basePerson.id);
  });

  it("disables delete button when editing self", () => {
    const stateSelf: PersonState = { ...userState, loggedInUser: basePerson };
    render(
      <PersonEditor
        state={stateSelf}
        dispatch={dispatch}
        person={basePerson}
        onSave={onSave}
        onDelete={onDelete}
        personService={dummyPersonService as any}
        setSnackbarStatus={setSnackbarStatus}
      />
    );
    expect(
      screen.getByRole("button", { name: /common.delete/i })
    ).toBeDisabled();
  });

  it.skip("resets form and clears person on cancel", async () => {
    render(
      <PersonEditor
        state={userState}
        dispatch={dispatch}
        person={{ ...basePerson, firstName: "Original" }}
        onSave={onSave}
        onDelete={onDelete}
        personService={dummyPersonService as any}
        setSnackbarStatus={setSnackbarStatus}
      />
    );
    const input = screen.getByLabelText(/person_editor.first_name/i);
    await userEvent.clear(input);
    await userEvent.type(input, "Changed");
    await userEvent.click(
      screen.getByRole("button", { name: /common.cancel/i })
    );
    expect(input).toHaveValue("Original");
    expect(dispatch).toHaveBeenCalledWith({
      type: "SET_SELECTED_PERSON",
      payload: null,
    });
    expect(setSnackbarStatus).toHaveBeenCalledWith("info");
  });
});
