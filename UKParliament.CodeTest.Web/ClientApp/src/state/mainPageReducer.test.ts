import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import {
  mainPageReducer,
  initialState,
  MainPageState,
  MainPageAction,
} from "./mainPageReducer";
import { PersonViewModel } from "../models/PersonViewModel";

describe("mainPageReducer - additional tests", () => {
  beforeAll(() => {
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

  it("should set loggedInUser on LOGIN", () => {
    const fakeUser = { id: 1, firstName: "Alice" } as any;
    const newState = mainPageReducer(initialState, {
      type: "LOGIN",
      payload: fakeUser,
    });

    expect(newState.loggedInUser).toEqual(fakeUser);
  });

  it("should replace loggedInUser on LOGIN", () => {
    const userA = { id: 1, firstName: "Alice" } as any;
    const userB = { id: 2, firstName: "Bob" } as any;

    const state = mainPageReducer(initialState, {
      type: "LOGIN",
      payload: userA,
    });
    const newState = mainPageReducer(state, { type: "LOGIN", payload: userB });

    expect(newState.loggedInUser).toEqual(userB);
  });

  it("should reset state and remove token on LOGOUT", () => {
    const stateWithUser = {
      ...initialState,
      loggedInUser: { id: 1, firstName: "Test" } as any,
      tokenInvalid: true,
    };

    const newState = mainPageReducer(stateWithUser, { type: "LOGOUT" });

    expect(newState).toEqual(initialState);
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("token");
  });

  it("should set people on SET_PEOPLE", () => {
    const people = [{ id: 1, firstName: "Bob" }] as any;
    const newState = mainPageReducer(initialState, {
      type: "SET_PEOPLE",
      payload: people,
    });

    expect(newState.people).toEqual(people);
  });

  it("should clear selected person when payload is null", () => {
    const stateWithSelection = {
      ...initialState,
      selectedPerson: { id: 42, firstName: "Sam" } as any,
    };

    const newState = mainPageReducer(stateWithSelection, {
      type: "SET_SELECTED_PERSON",
      payload: null,
    });

    expect(newState.selectedPerson).toBeNull();
  });

  it("should set selected person on SET_SELECTED_PERSON", () => {
    const person = { id: 5, firstName: "Lee" } as any;
    const newState = mainPageReducer(initialState, {
      type: "SET_SELECTED_PERSON",
      payload: person,
    });
    expect(newState.selectedPerson).toEqual(person);
  });

  it("should set roles on SET_ROLES", () => {
    const roles = [{ id: 1, name: "Admin" }] as any;
    const newState = mainPageReducer(initialState, {
      type: "SET_ROLES",
      payload: roles,
    });
    expect(newState.roles).toEqual(roles);
  });

  it("should set departments on SET_DEPARTMENTS", () => {
    const depts = [{ id: 1, name: "HR" }] as any;
    const newState = mainPageReducer(initialState, {
      type: "SET_DEPARTMENTS",
      payload: depts,
    });
    expect(newState.departments).toEqual(depts);
  });

  it("should preserve filteredPeople when setting search term", () => {
    const state = {
      ...initialState,
      filteredPeople: [{ id: 1, firstName: "Jake" }] as any,
    };

    const newState = mainPageReducer(state, {
      type: "SET_SEARCH_TERM",
      payload: "New term",
    });

    expect(newState.filteredPeople).toEqual(state.filteredPeople);
  });

  it("filter setters do not modify unrelated state fields", () => {
    const state: MainPageState = {
      ...initialState,
      searchTerm: "old term",
      filterRole: 0,
      filterDepartment: 0,
      errors: { some: "error" },
    };

    const withNewSearchTerm = mainPageReducer(state, {
      type: "SET_SEARCH_TERM",
      payload: "new term",
    });
    expect(withNewSearchTerm.searchTerm).toBe("new term");
    expect(withNewSearchTerm.filterRole).toBe(state.filterRole);
    expect(withNewSearchTerm.errors).toEqual(state.errors);

    const withNewFilterRole = mainPageReducer(state, {
      type: "SET_FILTER_ROLE",
      payload: 42,
    });
    expect(withNewFilterRole.filterRole).toBe(42);
    expect(withNewFilterRole.searchTerm).toBe(state.searchTerm);
    expect(withNewFilterRole.errors).toEqual(state.errors);

    const withNewFilterDepartment = mainPageReducer(state, {
      type: "SET_FILTER_DEPARTMENT",
      payload: 99,
    });
    expect(withNewFilterDepartment.filterDepartment).toBe(99);
    expect(withNewFilterDepartment.searchTerm).toBe(state.searchTerm);
    expect(withNewFilterDepartment.errors).toEqual(state.errors);
  });

  it("should update filterRole on SET_FILTER_ROLE", () => {
    const newState = mainPageReducer(initialState, {
      type: "SET_FILTER_ROLE",
      payload: 3,
    });
    expect(newState.filterRole).toBe(3);
  });

  it("should update filterDepartment on SET_FILTER_DEPARTMENT", () => {
    const newState = mainPageReducer(initialState, {
      type: "SET_FILTER_DEPARTMENT",
      payload: 7,
    });
    expect(newState.filterDepartment).toBe(7);
  });

  it("should handle empty results from filterPeople", () => {
    const personServiceMock = {
      filterPeople: vi.fn(() => []),
    };

    const newState = mainPageReducer(
      {
        ...initialState,
        searchTerm: "ghost",
        filterRole: 1,
        filterDepartment: 1,
      },
      {
        type: "SET_FILTERED_PEOPLE",
        payload: personServiceMock as any,
      }
    );

    expect(newState.filteredPeople).toEqual([]);
  });

  it("should update filteredPeople correctly when filter changes", () => {
    const fakeFilteredPeople: PersonViewModel[] = [
      {
        id: 1,
        firstName: "A",
        lastName: "B",
        dateOfBirth: null,
        email: "",
        password: "",
        department: 1,
        role: 1,
      },
    ];

    const personServiceMock = {
      filterPeople: vi.fn(() => fakeFilteredPeople),
    };

    const stateWithFilters = {
      ...initialState,
      searchTerm: "search",
      filterRole: 1,
      filterDepartment: 1,
    };

    const newState = mainPageReducer(stateWithFilters, {
      type: "SET_FILTERED_PEOPLE",
      payload: personServiceMock as any,
    });

    expect(personServiceMock.filterPeople).toHaveBeenCalledWith("search", 1, 1);
    expect(newState.filteredPeople).toEqual(fakeFilteredPeople);
  });

  it("should call filterPeople with zero filters", () => {
    const personServiceMock = {
      filterPeople: vi.fn(() => []),
    };

    const state = {
      ...initialState,
      searchTerm: "",
      filterRole: 0,
      filterDepartment: 0,
    };

    const newState = mainPageReducer(state, {
      type: "SET_FILTERED_PEOPLE",
      payload: personServiceMock as any,
    });

    expect(personServiceMock.filterPeople).toHaveBeenCalledWith("", 0, 0);
  });

  it("should set errors map on SET_ERRORS", () => {
    const errors = { email: "Invalid" };
    const newState = mainPageReducer(initialState, {
      type: "SET_ERRORS",
      payload: errors,
    });

    expect(newState.errors).toEqual(errors);
  });

  it("should set multiple error fields in SET_ERRORS", () => {
    const errors = { email: "Invalid email", password: "Too short" };
    const newState = mainPageReducer(initialState, {
      type: "SET_ERRORS",
      payload: errors,
    });

    expect(newState.errors).toEqual(errors);
  });

  it("should set isAuthenticating on SET_AUTHENTICATING", () => {
    const newState = mainPageReducer(initialState, {
      type: "SET_AUTHENTICATING",
      payload: false,
    });

    expect(newState.isAuthenticating).toBe(false);
  });

  it("should set tokenInvalid to true on SET_TOKEN_INVALID", () => {
    const newState = mainPageReducer(initialState, {
      type: "SET_TOKEN_INVALID",
      payload: true,
    });

    expect(newState.tokenInvalid).toBe(true);
  });

  it("should not remove token on SET_TOKEN_INVALID false", () => {
    const action: MainPageAction = {
      type: "SET_TOKEN_INVALID",
      payload: false,
    };
    const newState = mainPageReducer(initialState, action);
    expect(window.localStorage.removeItem).not.toHaveBeenCalled();
    expect(newState.tokenInvalid).toBe(false);
  });
});
