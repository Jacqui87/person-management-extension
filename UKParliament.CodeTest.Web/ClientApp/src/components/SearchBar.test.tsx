import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "./SearchBar";
import type { MainPageState, MainPageAction } from "../state/mainPageReducer";

describe("SearchBar", () => {
  const roles = [
    { id: 1, type: "Admin" },
    { id: 2, type: "User" },
  ];

  const departments = [
    { id: 10, name: "HR" },
    { id: 20, name: "IT" },
  ];

  const baseState: MainPageState = {
    loggedInUser: null,
    people: [],
    selectedPerson: null,
    departments,
    roles,
    searchTerm: "initial search",
    filterRole: 2,
    filterDepartment: 10,
    filteredPeople: [],
    errors: {},
  };

  it.skip("renders search input, role select, and department select with correct initial values", () => {
    const mockDispatch = vi.fn();

    render(<SearchBar state={baseState} dispatch={mockDispatch} />);

    const searchInput = screen.getByLabelText(/search people/i);
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue("initial search");

    const roleSelect = screen.getByLabelText(/role/i);
    expect(roleSelect).toBeInTheDocument();
    expect(roleSelect).toHaveValue("2");

    const departmentSelect = screen.getByLabelText(/department/i);
    expect(departmentSelect).toBeInTheDocument();
    expect(departmentSelect).toHaveValue("10");

    // Check role options include "All roles" and roles from state
    expect(
      screen.getByRole("option", { name: "All roles" })
    ).toBeInTheDocument();
    roles.forEach((role) => {
      expect(
        screen.getByRole("option", { name: role.type })
      ).toBeInTheDocument();
    });

    // Check department options include "All departments" and departments from state
    expect(
      screen.getByRole("option", { name: "All departments" })
    ).toBeInTheDocument();
    departments.forEach((dept) => {
      expect(
        screen.getByRole("option", { name: dept.name })
      ).toBeInTheDocument();
    });
  });

  it("dispatches SET_SEARCH_TERM action with new value on search input change", () => {
    const mockDispatch = vi.fn();

    render(<SearchBar state={baseState} dispatch={mockDispatch} />);

    const searchInput = screen.getByLabelText(/search people/i);

    fireEvent.change(searchInput, { target: { value: "new search" } });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_SEARCH_TERM",
      payload: "new search",
    });
  });

  it.skip("dispatches SET_FILTER_ROLE action with correct number on role select change", () => {
    const mockDispatch = vi.fn();

    render(<SearchBar state={baseState} dispatch={mockDispatch} />);

    const roleSelect = screen.getByLabelText(/role/i);

    fireEvent.change(roleSelect, { target: { value: "1" } });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_FILTER_ROLE",
      payload: 1,
    });
  });

  it.skip("dispatches SET_FILTER_DEPARTMENT action with correct number on department select change", () => {
    const mockDispatch = vi.fn();

    render(<SearchBar state={baseState} dispatch={mockDispatch} />);

    const departmentSelect = screen.getByLabelText(/department/i);

    fireEvent.change(departmentSelect, { target: { value: "20" } });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_FILTER_DEPARTMENT",
      payload: 20,
    });
  });
});
