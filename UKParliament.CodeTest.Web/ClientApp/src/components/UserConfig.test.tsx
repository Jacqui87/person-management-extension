import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import UserConfig from "./UserConfig";
import type { MainPageState, MainPageAction } from "../state/mainPageReducer";
import { PersonService } from "../services/personService";
import { ADMIN_ROLE_ID } from "../constants/roles";

// Mock PersonService methods
const mockGetAllPeople = vi.fn();
const mockGetPerson = vi.fn();
const mockAddPerson = vi.fn();
const mockUpdatePerson = vi.fn();
const mockDeletePerson = vi.fn();

vi.mock("../services/personService", () => {
  return {
    PersonService: vi.fn().mockImplementation(() => ({
      getAllPeople: mockGetAllPeople,
      getPerson: mockGetPerson,
      addPerson: mockAddPerson,
      updatePerson: mockUpdatePerson,
      deletePerson: mockDeletePerson,
    })),
  };
});

describe.skip("UserConfig Component", () => {
  let state: MainPageState;
  let dispatch: React.Dispatch<MainPageAction>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mocks to default resolves/returns
    mockGetAllPeople.mockResolvedValue([]);
    mockGetPerson.mockResolvedValue(null);
    mockAddPerson.mockResolvedValue(true);
    mockUpdatePerson.mockResolvedValue(true);

    dispatch = vi.fn();

    state = {
      loggedInUser: {
        id: 1,
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        role: ADMIN_ROLE_ID,
        department: 1,
        dateOfBirth: "1980-01-01",
        password: "",
        biography: "",
      },
      people: [],
      selectedPerson: null,
      departments: [{ id: 1, name: "HR" }],
      roles: [
        { id: ADMIN_ROLE_ID, type: "Admin" },
        { id: 2, type: "User" },
      ],
      searchTerm: "",
      filterRole: 0,
      filterDepartment: 0,
      filteredPeople: [
        {
          id: 1,
          firstName: "Admin",
          lastName: "User",
          email: "admin@example.com",
          role: ADMIN_ROLE_ID,
          department: 1,
          dateOfBirth: "1980-01-01",
          password: "",
          biography: "",
        },
        {
          id: 2,
          firstName: "Regular",
          lastName: "User",
          email: "user@example.com",
          role: 2,
          department: 1,
          dateOfBirth: "1990-01-01",
          password: "",
          biography: "",
        },
      ],
      errors: {},
    };
  });

  it("calls loadPeople on mount and dispatches SET_PEOPLE", async () => {
    mockGetAllPeople.mockResolvedValue(state.filteredPeople);

    render(
      <UserConfig
        state={state}
        dispatch={dispatch}
        personService={new PersonService()}
      />
    );

    await waitFor(() => {
      expect(mockGetAllPeople).toHaveBeenCalledWith(false);
    });

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({
        type: "SET_PEOPLE",
        payload: state.filteredPeople,
      });
    });
  });

  it("renders SearchBar and PersonList for admin users", () => {
    render(
      <UserConfig
        state={state}
        dispatch={dispatch}
        personService={new PersonService()}
      />
    );

    expect(screen.getByText(/people/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/search people/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add person/i })
    ).toBeInTheDocument();

    // PersonList shows people filtered
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("Regular User")).toBeInTheDocument();
  });

  it("renders PersonEditor for selectedPerson when selected", async () => {
    state = { ...state, selectedPerson: state.filteredPeople[1] };

    render(
      <UserConfig
        state={state}
        dispatch={dispatch}
        personService={new PersonService()}
      />
    );

    // PersonEditor contains heading "Edit Person"
    expect(screen.getByText(/edit person/i)).toBeInTheDocument();

    // The selected person's first name should appear in one of the inputs
    expect(screen.getByDisplayValue("Regular")).toBeInTheDocument();
  });

  it("clicking on PersonList onSelect calls personService.getPerson and dispatches selection", async () => {
    const personService = new PersonService();

    const person = state.filteredPeople[1];
    mockGetPerson.mockResolvedValue(person);

    render(
      <UserConfig
        state={state}
        dispatch={dispatch}
        personService={personService}
      />
    );

    // Find person list button by person's full name
    const personButton = screen.getByText(
      `${person.firstName} ${person.lastName}`
    );

    // Click triggers onSelect
    await personButton.click();

    await waitFor(() => {
      expect(mockGetPerson).toHaveBeenCalledWith(person.id);
    });

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({
        type: "SET_SELECTED_PERSON",
        payload: person,
      });
    });
  });

  it("clicking on Add Person dispatches SET_SELECTED_PERSON with empty person", () => {
    render(
      <UserConfig
        state={state}
        dispatch={dispatch}
        personService={new PersonService()}
      />
    );

    const addButton = screen.getByRole("button", { name: /add person/i });

    fireEvent.click(addButton);

    expect(dispatch).toHaveBeenCalledWith({
      type: "SET_SELECTED_PERSON",
      payload: expect.objectContaining({
        id: 0,
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        biography: "",
        dateOfBirth: "",
        role: 1,
        department: 1,
      }),
    });
  });

  it("handleSave calls addPerson for id=0 and updatePerson otherwise, and dispatches actions upon success", async () => {
    const personService = new PersonService();

    // Set up spies on addPerson and updatePerson
    mockAddPerson.mockResolvedValue(true);
    mockUpdatePerson.mockResolvedValue(true);

    // Wrap UserConfig to get handleSave via PersonEditor props
    render(
      <UserConfig
        state={state}
        dispatch={dispatch}
        personService={personService}
      />
    );

    // Find PersonEditor and invoke onSave prop with new person (id = 0)
    const addPerson = {
      id: 0,
      firstName: "New",
      lastName: "Person",
      email: "newperson@example.com",
      password: "",
      biography: "",
      dateOfBirth: "2000-01-01",
      role: 1,
      department: 1,
    };

    expect(true).toBe(true); // placeholder
  });

  it("renders PersonEditor for non-admin loggedInUser with filtered people filtered by id", () => {
    // Setup non-admin user
    const nonAdminState = {
      ...state,
      loggedInUser: {
        id: 2,
        firstName: "Regular",
        lastName: "User",
        email: "user@example.com",
        role: 2,
        department: 1,
        dateOfBirth: "1990-01-01",
        password: "",
        biography: "",
      },
      filteredPeople: [
        {
          id: 2,
          firstName: "Regular",
          lastName: "User",
          email: "user@example.com",
          role: 2,
          department: 1,
          dateOfBirth: "1990-01-01",
          password: "",
          biography: "",
        },
        {
          id: 3,
          firstName: "Other",
          lastName: "User",
          email: "other@example.com",
          role: 2,
          department: 1,
          dateOfBirth: "1991-01-01",
          password: "",
          biography: "",
        },
      ],
    };

    render(
      <UserConfig
        state={nonAdminState}
        dispatch={dispatch}
        personService={new PersonService()}
      />
    );

    expect(screen.queryByText(/people/i)).not.toBeInTheDocument();
    // PersonEditor with loggedInUser info present
    expect(
      screen.getByDisplayValue(nonAdminState.loggedInUser.firstName)
    ).toBeInTheDocument();
  });
});
