import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NavBar from "./NavBar";

// Mock i18next useTranslation
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // simple passthrough for testing
  }),
}));

// Mock React Query's useQueryClient
const invalidateQueriesMock = vi.fn();
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: invalidateQueriesMock,
  }),
}));

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

const initialState = {
  loggedInUser: fakeUser,
  people: [],
  selectedPerson: null,
  departments: [],
  roles: [],
  searchTerm: "",
  filterRole: 0,
  filterDepartment: 0,
  filteredPeople: [],
  isAuthenticating: false,
  tokenInvalid: false,
};

describe("NavBar component", () => {
  let dispatchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    dispatchMock = vi.fn();
    invalidateQueriesMock.mockClear();
  });

  it("renders the title", () => {
    render(<NavBar state={initialState} dispatch={dispatchMock} />);
    // Check that the title text appears
    expect(screen.getByText("nav_bar.person_manager")).toBeDefined();
  });

  it("renders user full name", () => {
    render(<NavBar state={initialState} dispatch={dispatchMock} />);
    expect(screen.getByText("Jane Doe")).toBeDefined();
  });

  it("calls the dispatch and invalidates queries on logout", async () => {
    render(<NavBar state={initialState} dispatch={dispatchMock} />);

    const logoutBtn = screen.getByRole("button", { name: "nav_bar.logout" });

    await userEvent.click(logoutBtn);

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: ["people"],
    });

    expect(dispatchMock).toHaveBeenCalledTimes(3);
    expect(dispatchMock).toHaveBeenCalledWith({
      type: "SET_PEOPLE",
      payload: [],
    });
    expect(dispatchMock).toHaveBeenCalledWith({ type: "LOGOUT" });
    expect(dispatchMock).toHaveBeenCalledWith({
      type: "SET_AUTHENTICATING",
      payload: false,
    });
  });

  it("renders correctly when no logged in user", () => {
    render(
      <NavBar
        state={{ ...initialState, loggedInUser: null }}
        dispatch={dispatchMock}
      />
    );
    expect(screen.queryByText("Jane Doe")).toBeNull();

    expect(
      screen.getByRole("button", { name: "nav_bar.logout" })
    ).toBeDefined();
  });
});
