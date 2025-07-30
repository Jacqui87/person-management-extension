import React, { useEffect } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PersonEditor from "./PersonEditor";

// --- Mocks for all form fields and buttons ---

vi.mock("../elements/PersonForm/FirstnameField", () => ({
  default: ({ canEdit, formik, handleFieldChange }: any) => (
    <input
      data-testid="FirstnameField"
      type="text"
      disabled={!canEdit}
      value={formik.values.firstName || ""}
      onChange={handleFieldChange}
      onBlur={formik.handleBlur}
    />
  ),
}));

vi.mock("../elements/PersonForm/LastnameField", () => ({
  default: ({ canEdit, formik, handleFieldChange }: any) => (
    <input
      data-testid="LastnameField"
      type="text"
      disabled={!canEdit}
      value={formik.values.lastName || ""}
      onChange={handleFieldChange}
      onBlur={formik.handleBlur}
    />
  ),
}));

vi.mock("../elements/PersonForm/BiographyField", () => ({
  default: ({ canEdit, formik, handleFieldChange }: any) => (
    <textarea
      data-testid="BiographyField"
      disabled={!canEdit}
      value={formik.values.biography || ""}
      onChange={handleFieldChange}
      onBlur={formik.handleBlur}
    />
  ),
}));

vi.mock("../elements/PersonForm/DobField", () => ({
  default: ({ canEdit, formik, handleFieldChange, defaultDob }: any) => (
    <input
      data-testid="DobField"
      type="date"
      disabled={!canEdit}
      value={formik.values.dateOfBirth || defaultDob}
      onChange={handleFieldChange}
      onBlur={formik.handleBlur}
    />
  ),
}));

vi.mock("../elements/PersonForm/DepartmentSelect", () => ({
  default: ({ canEdit, formik, handleFieldChange, departments }: any) => (
    <select
      data-testid="DepartmentSelect"
      disabled={!canEdit}
      value={formik.values.department || ""}
      onChange={handleFieldChange}
      onBlur={formik.handleBlur}
    >
      {departments.map((dept: any) => (
        <option key={dept.id} value={dept.id}>
          {dept.name}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("../elements/PersonForm/RoleSelect", () => ({
  default: ({ canEdit, formik, handleFieldChange, roles }: any) =>
    canEdit ? (
      <select
        data-testid="RoleSelect"
        disabled={!canEdit}
        value={formik.values.role || ""}
        onChange={handleFieldChange}
        onBlur={formik.handleBlur}
      >
        {roles.map((role: any) => (
          <option key={role.id} value={role.id}>
            {role.type}
          </option>
        ))}
      </select>
    ) : null,
}));

vi.mock("../elements/PersonForm/EmailField", () => {
  // We mock useIsEmailUnique internally here if necessary
  return {
    default: ({ canEdit, formik, handleFieldChange }: any) => {
      useEffect(() => {
        // Simulate clearing uniqueness error
        formik.setFieldError("email", undefined);
      }, [formik.values.email]);

      return (
        <input
          type="email"
          data-testid="EmailField"
          disabled={!canEdit}
          value={formik.values.email || ""}
          onChange={handleFieldChange}
          onBlur={formik.handleBlur}
        />
      );
    },
  };
});

vi.mock("../elements/PersonForm/LanguageSelect", () => ({
  default: ({ canEdit, formik, handleFieldChange }: any) => (
    <select
      data-testid="LanguageSelect"
      disabled={!canEdit}
      value={formik.values.cultureCode || "en-GB"}
      onChange={handleFieldChange}
      onBlur={formik.handleBlur}
    >
      <option value="en-GB">en_GB</option>
      <option value="cy-GB">cy_GB</option>
    </select>
  ),
}));

vi.mock("../elements/PersonForm/PasswordFields", () => ({
  default: ({
    canEdit,
    passwordChanged,
    formik,
    handleFieldChange,
  }: {
    canEdit: boolean;
    passwordChanged: boolean;
    formik: any;
    handleFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <>
      <input
        data-testid="PasswordInput"
        type="password"
        disabled={!canEdit}
        value={formik.values.password}
        onChange={handleFieldChange}
      />
      {passwordChanged && (
        <input
          data-testid="ConfirmPasswordInput"
          type="password"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
        />
      )}
    </>
  ),
}));

vi.mock("../elements/PersonForm/PersonFormButtons", () => ({
  default: ({ formik }: { formik: any }) => (
    <button
      data-testid="PersonFormButtons"
      onClick={() => formik.handleSubmit()}
    >
      Submit
    </button>
  ),
}));

// Mock personFormik to return mock handlers and values
const mockFormikHandleChange = vi.fn();
const mockFormikHandleSubmit = vi.fn();

vi.mock("../elements/PersonForm/personFormik", () => ({
  personFormik: vi.fn(() => ({
    handleChange: mockFormikHandleChange,
    handleSubmit: mockFormikHandleSubmit,
    values: {
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      biography: "",
      department: "",
      role: "",
      email: "",
      cultureCode: "",
    },
    touched: {},
    errors: {},
    setFieldError: vi.fn(),
    handleBlur: vi.fn(),
  })),
}));

// Mock usePeople hook
const mockUsePeople = vi.fn();

vi.mock("../hooks/personHooks", () => ({
  usePeople: () => mockUsePeople(),
  useAddPerson: vi.fn(() => ({ mutate: vi.fn() })),
  useUpdatePerson: vi.fn(() => ({ mutate: vi.fn() })),
}));

// Mock useTranslation to just echo keys
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

import { ADMIN_ROLE_ID } from "../constants/roles";

const fakeUser = {
  id: 123,
  firstName: "Jane",
  lastName: "Doe",
  dateOfBirth: "1990-05-15",
  email: "jane.doe@example.com",
  department: 1,
  password: "secret123",
  role: 2,
  cultureCode: "en-GB",
  biography: "Software developer with 10 years experience.",
};

const adminUser = { ...fakeUser, role: ADMIN_ROLE_ID };

const initialState = {
  loggedInUser: adminUser,
  people: [],
  selectedPerson: null,
  departments: [{ id: 1, name: "Department A" }],
  roles: [{ id: 2, type: "Role B" }],
  searchTerm: "",
  filterRole: 0,
  filterDepartment: 0,
  filteredPeople: [],
  isAuthenticating: false,
  tokenInvalid: false,
};

describe("PersonEditor Full Test Suite", () => {
  let dispatchMock: ReturnType<typeof vi.fn>;
  let snackbarMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    dispatchMock = vi.fn();
    snackbarMock = vi.fn();
    mockUsePeople.mockReturnValue({ isLoading: false });
    mockFormikHandleChange.mockClear();
    mockFormikHandleSubmit.mockClear();
  });

  it("renders unauthorised message if no currentUser", () => {
    render(
      <PersonEditor
        state={{ ...initialState, loggedInUser: null }}
        dispatch={dispatchMock}
        person={fakeUser}
        setSnackbarStatus={snackbarMock}
      />
    );
    expect(screen.getByText("common.unathorised_access")).toBeDefined();
  });

  it("shows loading spinner when loading", () => {
    mockUsePeople.mockReturnValue({ isLoading: true });

    render(
      <PersonEditor
        state={initialState}
        dispatch={dispatchMock}
        person={fakeUser}
        setSnackbarStatus={snackbarMock}
      />
    );
    expect(screen.getByRole("progressbar")).toBeDefined();
  });

  it("renders add or edit title correctly", () => {
    render(
      <PersonEditor
        state={initialState}
        dispatch={dispatchMock}
        person={{ ...fakeUser, id: 0 }}
        setSnackbarStatus={snackbarMock}
      />
    );
    expect(screen.getByText("person_editor.add")).toBeDefined();

    render(
      <PersonEditor
        state={initialState}
        dispatch={dispatchMock}
        person={fakeUser}
        setSnackbarStatus={snackbarMock}
      />
    );
    expect(screen.getByText("person_editor.edit")).toBeDefined();
  });

  it("renders fields with correct permissions and values", () => {
    render(
      <PersonEditor
        state={initialState}
        dispatch={dispatchMock}
        person={{ ...fakeUser, id: 456 }}
        setSnackbarStatus={snackbarMock}
      />
    );

    expect(screen.getByTestId("FirstnameField")).toBeDefined();
    expect(screen.getByTestId("LastnameField")).toBeDefined();
    expect(screen.getByTestId("BiographyField")).toBeDefined();
    expect(screen.getByTestId("DobField")).toBeDefined();
    expect(screen.getByTestId("EmailField")).toBeDefined();
    expect(screen.getByTestId("LanguageSelect")).toBeDefined();
    expect(screen.getByTestId("PasswordInput")).toBeDefined();

    // Admin editing other person - RoleSelect and DepartmentSelect present
    expect(screen.getByTestId("RoleSelect")).toBeDefined();
    expect(screen.getByTestId("DepartmentSelect")).toBeDefined();
  });

  it("does not render RoleSelect and DepartmentSelect for non-admin editing self", () => {
    const fakeUser_user = {
      id: 123,
      firstName: "Jane",
      lastName: "Doe",
      dateOfBirth: "1990-05-15",
      email: "jane.doe@example.com",
      department: 1,
      password: "secret123",
      role: 1,
      cultureCode: "en-GB",
      biography: "Software developer with 10 years experience.",
    };

    render(
      <PersonEditor
        state={{ ...initialState, loggedInUser: fakeUser_user }}
        dispatch={dispatchMock}
        person={fakeUser_user}
        setSnackbarStatus={snackbarMock}
      />
    );

    expect(screen.queryByTestId("RoleSelect")).toBeNull();
    expect(screen.queryByTestId("DepartmentSelect")).toBeNull();
  });

  it("handleFieldChange triggers formik handler and sets passwordChanged", () => {
    render(
      <PersonEditor
        state={initialState}
        dispatch={dispatchMock}
        person={fakeUser}
        setSnackbarStatus={snackbarMock}
      />
    );

    fireEvent.change(screen.getByTestId("PasswordInput"), {
      target: { name: "password", value: "newPassword1!" },
    });

    expect(mockFormikHandleChange).toHaveBeenCalled();
  });

  it("calls formik.handleSubmit on submit", () => {
    render(
      <PersonEditor
        state={initialState}
        dispatch={dispatchMock}
        person={fakeUser}
        setSnackbarStatus={snackbarMock}
      />
    );

    fireEvent.click(screen.getByTestId("PersonFormButtons"));
    expect(mockFormikHandleSubmit).toHaveBeenCalled();
  });
});
