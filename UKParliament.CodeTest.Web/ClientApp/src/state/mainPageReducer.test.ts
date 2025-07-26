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

  it("should not remove token on SET_TOKEN_INVALID false", () => {
    const action: MainPageAction = {
      type: "SET_TOKEN_INVALID",
      payload: false,
    };
    const newState = mainPageReducer(initialState, action);
    expect(window.localStorage.removeItem).not.toHaveBeenCalled();
    expect(newState.tokenInvalid).toBe(false);
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

  it.skip("UNIQUE_EMAIL_CHECK returns current uniqueEmail when personService is missing (edge case)", () => {
    const action: MainPageAction = {
      type: "UNIQUE_EMAIL_CHECK",
      payload: {
        email: "test@example.com",
        personService: undefined as any,
      },
    };

    const state = { ...initialState, uniqueEmail: true };
    const newState = mainPageReducer(state, action);

    expect(newState.uniqueEmail).toBe(true);
  });

  it("filter setters do not modify unrelated state fields", () => {
    const state: MainPageState = {
      ...initialState,
      searchTerm: "old term",
      filterRole: 0,
      filterDepartment: 0,
      errors: { some: "error" },
      uniqueEmail: false,
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
});
