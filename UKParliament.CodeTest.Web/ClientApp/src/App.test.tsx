import { render, screen } from "@testing-library/react";
import App from "./App";
import MainPage from "./components/MainPage";
import { vi } from "vitest";

// Mock MainPage so tests focus on App only
vi.mock("./components/MainPage", () => {
  return {
    default: () => <div data-testid="mock-main-page" />,
  };
});

describe("App component", () => {
  it("renders the header text", () => {
    render(<App />);
    expect(screen.getByText("Person Manager")).toBeInTheDocument();
  });

  it("renders the MainPage component", () => {
    render(<App />);
    expect(screen.getByTestId("mock-main-page")).toBeInTheDocument();
  });

  it("renders a div with padding style", () => {
    const { container } = render(<App />);
    const div = container.firstChild;
    expect(div).toHaveStyle("padding: 2rem");
  });
});
