import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SearchBar from "./SearchBar";
import { PersonState, PersonAction } from "../state/personReducer";

describe("SearchBar", () => {
  const baseState: PersonState = {
    loggedInUser: null,
    people: [],
    selectedPerson: null,
    departments: [
      { id: 1, name: "Dept 1" },
      { id: 2, name: "Dept 2" },
    ],
    roles: [
      { id: 10, type: "Role 10" },
      { id: 20, type: "Role 20" },
    ],
    searchTerm: "initial search",
    filterRole: 20,
    filterDepartment: 2,
    filteredPeople: [],
    errors: {},
    isAuthenticating: false,
    tokenInvalid: false,
  };

  let dispatch: React.Dispatch<PersonAction>;

  beforeEach(() => {
    dispatch = vi.fn();
  });

  it("renders search input with initial value", () => {
    render(<SearchBar state={baseState} dispatch={dispatch} />);
    const searchInput = screen.getByLabelText(/search_bar.search_people/i);
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue("initial search");
  });

  it("renders Role and Department selects with correct labels and initial values", () => {
    render(<SearchBar state={baseState} dispatch={dispatch} />);

    const roleInput = screen.getByRole("combobox", {
      name: /^person_editor.role$/i,
    });
    expect(roleInput).toBeInTheDocument();
    expect(roleInput).toHaveValue("Role 20");

    const deptInput = screen.getByRole("combobox", {
      name: /^person_editor.department$/i,
    });
    expect(deptInput).toBeInTheDocument();
    expect(deptInput).toHaveValue("Dept 2");
  });

  it("dispatches SET_SEARCH_TERM when typing in search input", () => {
    render(<SearchBar state={baseState} dispatch={dispatch} />);
    const searchInput = screen.getByLabelText(/search_bar.search_people/i);
    fireEvent.change(searchInput, { target: { value: "new query" } });
    expect(dispatch).toHaveBeenCalledWith({
      type: "SET_SEARCH_TERM",
      payload: "new query",
    });
  });

  it("dispatches SET_FILTER_ROLE when selecting a role", () => {
    render(<SearchBar state={baseState} dispatch={dispatch} />);
    const roleSelect = screen.getByRole("combobox", {
      name: /^person_editor.role$/i,
    });

    // Open role select menu
    fireEvent.mouseDown(roleSelect);

    // The popup listbox container appears; query options inside it
    const listbox = screen.getByRole("listbox");
    const optionRole10 = within(listbox).getByText("Role 10");
    fireEvent.click(optionRole10);

    expect(dispatch).toHaveBeenCalledWith({
      type: "SET_FILTER_ROLE",
      payload: 10,
    });
  });

  it("dispatches SET_FILTER_DEPARTMENT when selecting a department", () => {
    render(<SearchBar state={baseState} dispatch={dispatch} />);
    const deptSelect = screen.getByRole("combobox", {
      name: /^person_editor.department$/i,
    });

    // Open department select menu
    fireEvent.mouseDown(deptSelect);

    const listbox = screen.getByRole("listbox");
    const optionDept1 = within(listbox).getByText("Dept 1");
    fireEvent.click(optionDept1);

    expect(dispatch).toHaveBeenCalledWith({
      type: "SET_FILTER_DEPARTMENT",
      payload: 1,
    });
  });

  it("allows selecting 'All roles' and dispatches 0 as payload", () => {
    render(<SearchBar state={baseState} dispatch={dispatch} />);
    const roleSelect = screen.getByRole("combobox", {
      name: /^person_editor.role$/i,
    });

    fireEvent.mouseDown(roleSelect);

    const listbox = screen.getByRole("listbox");
    const allRolesOption = within(listbox).getByText(/search_bar.all_roles/i);
    fireEvent.click(allRolesOption);

    expect(dispatch).toHaveBeenCalledWith({
      type: "SET_FILTER_ROLE",
      payload: 0,
    });
  });

  it("allows selecting 'All departments' and dispatches 0 as payload", () => {
    render(<SearchBar state={baseState} dispatch={dispatch} />);
    const deptSelect = screen.getByRole("combobox", {
      name: /^person_editor.department$/i,
    });

    fireEvent.mouseDown(deptSelect);

    const listbox = screen.getByRole("listbox");
    const allDeptsOption = within(listbox).getByText(
      /search_bar.all_departments/i
    );
    fireEvent.click(allDeptsOption);

    expect(dispatch).toHaveBeenCalledWith({
      type: "SET_FILTER_DEPARTMENT",
      payload: 0,
    });
  });
});
