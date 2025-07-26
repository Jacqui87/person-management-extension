import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import {
  mainPageReducer,
  initialState,
  MainPageState,
  MainPageAction,
} from "../state/mainPageReducer";
import { PersonViewModel } from "../models/PersonViewModel";

describe("mainPageReducer", () => {
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

  it("should handle LOGIN action", () => {
    const user: PersonViewModel = {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1980-01-01",
      email: "john.doe@example.com",
      department: 5,
      password: "password123",
      role: 2,
      biography: "Sample bio",
    };
    const action: MainPageAction = { type: "LOGIN", payload: user };
    const newState = mainPageReducer(initialState, action);
    expect(newState.loggedInUser).toEqual(user);
  });

  it("should handle LOGOUT action and clear token", () => {
    const state: MainPageState = {
      ...initialState,
      loggedInUser: {
        id: 1,
        firstName: "Jane",
        lastName: "Smith",
        dateOfBirth: "1990-05-05",
        email: "jane.smith@example.com",
        department: 3,
        password: "123456",
        role: 1,
        biography: "Bio text",
      },
      tokenInvalid: false,
    };
    const action: MainPageAction = { type: "LOGOUT" };
    const newState = mainPageReducer(state, action);
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("token");
    expect(newState).toEqual(initialState);
  });

  it("should handle SET_PEOPLE", () => {
    const people: PersonViewModel[] = [
      {
        id: 1,
        firstName: "Alice",
        lastName: "Johnson",
        dateOfBirth: "1975-10-10",
        email: "alice@example.com",
        department: 2,
        password: "alicepass",
        role: 3,
        biography: "Bio A",
      },
      {
        id: 2,
        firstName: "Bob",
        lastName: "Williams",
        dateOfBirth: null,
        email: "bob@example.com",
        department: 4,
        password: "bobpass",
        role: 4,
        biography: "Bio B",
      },
    ];
    const action: MainPageAction = { type: "SET_PEOPLE", payload: people };
    const newState = mainPageReducer(initialState, action);
    expect(newState.people).toEqual(people);
  });

  it("should handle SET_SELECTED_PERSON", () => {
    const person: PersonViewModel = {
      id: 5,
      firstName: "Selected",
      lastName: "Person",
      dateOfBirth: "2000-12-12",
      email: "selected@example.com",
      department: 7,
      password: "selectedpass",
      role: 5,
      biography: "Selected biography",
    };
    const action: MainPageAction = {
      type: "SET_SELECTED_PERSON",
      payload: person,
    };
    const newState = mainPageReducer(initialState, action);
    expect(newState.selectedPerson).toEqual(person);
  });

  // Remaining tests unchanged except using matching PersonViewModel in test data:

  it("should handle SET_FILTERED_PEOPLE by calling PersonService.filterPeople", () => {
    const state: MainPageState = {
      ...initialState,
      searchTerm: "term",
      filterRole: 1,
      filterDepartment: 2,
    };

    const mockFilteredPeople: PersonViewModel[] = [
      {
        id: 10,
        firstName: "Filtered",
        lastName: "User",
        dateOfBirth: "1995-08-20",
        email: "filtered.user@example.com",
        department: 1,
        password: "password",
        role: 1,
        biography: "filtered biography",
      },
    ];
    const personServiceMock = {
      filterPeople: vi.fn(() => mockFilteredPeople),
    };

    const action: MainPageAction = {
      type: "SET_FILTERED_PEOPLE",
      payload: personServiceMock as any,
    };
    const newState = mainPageReducer(state, action);
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
    const action: MainPageAction = { type: "UNIQUE_EMAIL_CHECK", payload };
    const newState = mainPageReducer(initialState, action);
    expect(personServiceMock.isEmailUnique).toHaveBeenCalledWith(
      "email@example.com",
      42
    );
    expect(newState.uniqueEmail).toBe(true);
  });
});
