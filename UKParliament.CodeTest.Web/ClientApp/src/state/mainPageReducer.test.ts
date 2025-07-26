// mainPageReducer.test.ts
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import {
  mainPageReducer,
  initialState,
  MainPageState,
} from "./mainPageReducer";
import { PersonViewModel } from "../models/PersonViewModel";
import { DepartmentViewModel } from "../models/DepartmentViewModel";
import { RoleViewModel } from "../models/RoleViewModel";

describe("mainPageReducer", () => {
  beforeAll(() => {
    // Mock localStorage globally for these tests
    Object.defineProperty(window, "localStorage", {
      value: {
        removeItem: vi.fn(),
        setItem: vi.fn(),
        getItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the initial state if action is unknown", () => {
    // @ts-ignore
    expect(mainPageReducer(initialState, { type: "UNKNOWN" })).toEqual(
      initialState
    );
  });

  it("should handle LOGIN action", () => {
    const user: PersonViewModel = {
      id: 1,
      name: "Test User",
      email: "test@example.com",
    } as any;
    const newState = mainPageReducer(initialState, {
      type: "LOGIN",
      payload: user,
    });
    expect(newState.loggedInUser).toEqual(user);
  });

  it("should handle LOGOUT action and clear token", () => {
    const state: MainPageState = {
      ...initialState,
      loggedInUser: { id: 1, name: "User" } as any,
      tokenInvalid: false,
    };
    const newState = mainPageReducer(state, { type: "LOGOUT" });
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("token");
    expect(newState).toEqual(initialState);
  });

  it("should handle SET_PEOPLE", () => {
    const people: PersonViewModel[] = [
      { id: 1, name: "Person 1" } as any,
      { id: 2, name: "Person 2" } as any,
    ];
    const newState = mainPageReducer(initialState, {
      type: "SET_PEOPLE",
      payload: people,
    });
    expect(newState.people).toEqual(people);
  });

  it("should handle SET_SELECTED_PERSON", () => {
    const person: PersonViewModel = { id: 5, name: "Selected Person" } as any;
    const newState = mainPageReducer(initialState, {
      type: "SET_SELECTED_PERSON",
      payload: person,
    });
    expect(newState.selectedPerson).toEqual(person);
  });

  it("should handle SET_DEPARTMENTS", () => {
    const departments: DepartmentViewModel[] = [
      { id: 1, name: "Dept1" } as any,
    ];
    const newState = mainPageReducer(initialState, {
      type: "SET_DEPARTMENTS",
      payload: departments,
    });
    expect(newState.departments).toEqual(departments);
  });

  it("should handle SET_ROLES", () => {
    const roles: RoleViewModel[] = [{ id: 1, name: "Role1" } as any];
    const newState = mainPageReducer(initialState, {
      type: "SET_ROLES",
      payload: roles,
    });
    expect(newState.roles).toEqual(roles);
  });

  it("should handle SET_SEARCH_TERM", () => {
    const term = "search term";
    const newState = mainPageReducer(initialState, {
      type: "SET_SEARCH_TERM",
      payload: term,
    });
    expect(newState.searchTerm).toBe(term);
  });

  it("should handle SET_FILTER_ROLE", () => {
    const roleId = 3;
    const newState = mainPageReducer(initialState, {
      type: "SET_FILTER_ROLE",
      payload: roleId,
    });
    expect(newState.filterRole).toBe(roleId);
  });

  it("should handle SET_FILTER_DEPARTMENT", () => {
    const deptId = 7;
    const newState = mainPageReducer(initialState, {
      type: "SET_FILTER_DEPARTMENT",
      payload: deptId,
    });
    expect(newState.filterDepartment).toBe(deptId);
  });

  it("should handle SET_FILTERED_PEOPLE by calling PersonService.filterPeople", () => {
    const state: MainPageState = {
      ...initialState,
      searchTerm: "term",
      filterRole: 1,
      filterDepartment: 2,
    };

    const mockFilteredPeople = [{ id: 10, name: "Filtered User" } as any];
    const personServiceMock = {
      filterPeople: vi.fn(() => mockFilteredPeople),
    };

    const newState = mainPageReducer(state, {
      type: "SET_FILTERED_PEOPLE",
      payload: personServiceMock as any,
    });
    expect(personServiceMock.filterPeople).toHaveBeenCalledWith("term", 1, 2);
    expect(newState.filteredPeople).toEqual(mockFilteredPeople);
  });

  it("should handle UNIQUE_EMAIL_CHECK by calling PersonService.isEmailUnique", () => {
    const personServiceMock = {
      isEmailUnique: vi.fn(() => true),
    };
    const payload = {
      email: "email@example.com",
      excludePersonId: 42,
      personService: personServiceMock as any,
    };
    const newState = mainPageReducer(initialState, {
      type: "UNIQUE_EMAIL_CHECK",
      payload,
    });
    expect(personServiceMock.isEmailUnique).toHaveBeenCalledWith(
      "email@example.com",
      42
    );
    expect(newState.uniqueEmail).toBe(true);
  });

  it("should handle SET_ERRORS", () => {
    const errors = { email: "Invalid email" };
    const newState = mainPageReducer(initialState, {
      type: "SET_ERRORS",
      payload: errors,
    });
    expect(newState.errors).toEqual(errors);
  });

  it("should handle SET_AUTHENTICATING", () => {
    const newState = mainPageReducer(initialState, {
      type: "SET_AUTHENTICATING",
      payload: false,
    });
    expect(newState.isAuthenticating).toBe(false);
  });

  it("should handle SET_TOKEN_INVALID true by removing token", () => {
    const newState = mainPageReducer(initialState, {
      type: "SET_TOKEN_INVALID",
      payload: true,
    });
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("token");
    expect(newState.tokenInvalid).toBe(true);
  });

  it("should handle SET_TOKEN_INVALID false without removing token", () => {
    const newState = mainPageReducer(initialState, {
      type: "SET_TOKEN_INVALID",
      payload: false,
    });
    expect(window.localStorage.removeItem).not.toHaveBeenCalled();
    expect(newState.tokenInvalid).toBe(false);
  });
});
