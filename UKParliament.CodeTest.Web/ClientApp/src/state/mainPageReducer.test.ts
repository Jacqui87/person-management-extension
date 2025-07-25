import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  mainPageReducer,
  initialState,
  MainPageState,
  MainPageAction,
} from "./mainPageReducer";
import type { PersonViewModel } from "../models/PersonViewModel";
import type { DepartmentViewModel } from "../models/DepartmentViewModel";
import type { RoleViewModel } from "../models/RoleViewModel";

describe("mainPageReducer", () => {
  // Mock localStorage.removeItem before each test
  beforeEach(() => {
    vi.spyOn(localStorage, "removeItem").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockPerson: PersonViewModel = {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    role: 1,
    department: 1,
  } as any;

  const mockDepartment: DepartmentViewModel = {
    id: 10,
    name: "HR",
  } as any;

  const mockRole: RoleViewModel = {
    id: 5,
    name: "Admin",
  } as any;

  it("should return initial state for unknown action", () => {
    const unknownAction = { type: "UNKNOWN" } as any;
    const newState = mainPageReducer(initialState, unknownAction);
    expect(newState).toEqual(initialState);
  });

  it("should handle LOGIN action", () => {
    const action: MainPageAction = { type: "LOGIN", payload: mockPerson };
    const newState = mainPageReducer(initialState, action);
    expect(newState.loggedInUser).toEqual(mockPerson);
  });

  it.skip("should handle LOGOUT action and clear token", () => {
    const loggedInState: MainPageState = {
      ...initialState,
      loggedInUser: mockPerson,
    };
    const action: MainPageAction = { type: "LOGOUT" };
    const newState = mainPageReducer(loggedInState, action);
    expect(localStorage.removeItem).toHaveBeenCalledWith("token");
    expect(newState).toEqual(initialState);
  });

  it("should handle SET_PEOPLE action", () => {
    const peopleArray = [mockPerson];
    const action: MainPageAction = { type: "SET_PEOPLE", payload: peopleArray };
    const newState = mainPageReducer(initialState, action);
    expect(newState.people).toBe(peopleArray);
  });

  it("should handle SET_SELECTED_PERSON action", () => {
    const action: MainPageAction = {
      type: "SET_SELECTED_PERSON",
      payload: mockPerson,
    };
    const newState = mainPageReducer(initialState, action);
    expect(newState.selectedPerson).toEqual(mockPerson);
  });

  it("should handle SET_DEPARTMENTS action", () => {
    const departmentsArray = [mockDepartment];
    const action: MainPageAction = {
      type: "SET_DEPARTMENTS",
      payload: departmentsArray,
    };
    const newState = mainPageReducer(initialState, action);
    expect(newState.departments).toBe(departmentsArray);
  });

  it("should handle SET_ROLES action", () => {
    const rolesArray = [mockRole];
    const action: MainPageAction = { type: "SET_ROLES", payload: rolesArray };
    const newState = mainPageReducer(initialState, action);
    expect(newState.roles).toBe(rolesArray);
  });

  it("should handle SET_SEARCH_TERM action", () => {
    const searchTerm = "search text";
    const action: MainPageAction = {
      type: "SET_SEARCH_TERM",
      payload: searchTerm,
    };
    const newState = mainPageReducer(initialState, action);
    expect(newState.searchTerm).toBe(searchTerm);
  });

  it("should handle SET_FILTER_ROLE action", () => {
    const filterRole = 3;
    const action: MainPageAction = {
      type: "SET_FILTER_ROLE",
      payload: filterRole,
    };
    const newState = mainPageReducer(initialState, action);
    expect(newState.filterRole).toBe(filterRole);
  });

  it("should handle SET_FILTER_DEPARTMENT action", () => {
    const filterDepartment = 2;
    const action: MainPageAction = {
      type: "SET_FILTER_DEPARTMENT",
      payload: filterDepartment,
    };
    const newState = mainPageReducer(initialState, action);
    expect(newState.filterDepartment).toBe(filterDepartment);
  });

  it("should handle SET_FILTERED_PEOPLE action", () => {
    const filteredPeople = [mockPerson];
    const action: MainPageAction = {
      type: "SET_FILTERED_PEOPLE",
      payload: filteredPeople,
    };
    const newState = mainPageReducer(initialState, action);
    expect(newState.filteredPeople).toBe(filteredPeople);
  });

  it("should handle SET_ERRORS action", () => {
    const errors = { email: ["Invalid email"] };
    const action: MainPageAction = { type: "SET_ERRORS", payload: errors };
    const newState = mainPageReducer(initialState, action);
    expect(newState.errors).toBe(errors);
  });
});
