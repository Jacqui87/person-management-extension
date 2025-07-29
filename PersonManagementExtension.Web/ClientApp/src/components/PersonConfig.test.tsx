import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import {
  personReducer,
  initialState,
  PersonState,
  PersonAction,
} from "../state/personReducer";
import { PersonViewModel } from "../models/PersonViewModel";

describe("personReducer", () => {
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
    const action: PersonAction = { type: "LOGIN", payload: user };
    const newState = personReducer(initialState, action);
    expect(newState.loggedInUser).toEqual(user);
  });

  it("should handle LOGOUT action and clear token", () => {
    const state: PersonState = {
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
    const action: PersonAction = { type: "LOGOUT" };
    const newState = personReducer(state, action);
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
    const action: PersonAction = { type: "SET_PEOPLE", payload: people };
    const newState = personReducer(initialState, action);
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
    const action: PersonAction = {
      type: "SET_SELECTED_PERSON",
      payload: person,
    };
    const newState = personReducer(initialState, action);
    expect(newState.selectedPerson).toEqual(person);
  });

  // Remaining tests unchanged except using matching PersonViewModel in test data:

  it("should handle SET_FILTERED_PEOPLE by calling PersonService.filterPeople", () => {
    const state: PersonState = {
      ...initialState,
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

    const action: PersonAction = {
      type: "SET_FILTERED_PEOPLE",
      payload: mockFilteredPeople as PersonViewModel[],
    };
    const newState = personReducer(state, action);
    expect(newState.filteredPeople).toEqual(mockFilteredPeople);
  });
});
