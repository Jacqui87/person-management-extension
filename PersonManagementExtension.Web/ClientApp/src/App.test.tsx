import { act } from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { vi } from "vitest";

// --- Mock i18next useTranslation ---
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // simple passthrough for testing
  }),
}));

// Mock MainPage so tests focus on App only
vi.mock("./components/MainPage", () => {
  return {
    default: () => <div data-testid="mock-main-page" />,
  };
});

describe("App component", () => {
  it("renders the header text", async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText("nav_bar.person_manager")).toBeInTheDocument();
  });

  it("renders the MainPage component", async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByTestId("mock-main-page")).toBeInTheDocument();
  });

  it("renders a div with padding style", () => {
    const { container } = render(<App />);
    const div = container.firstChild;
    expect(div).toHaveStyle("padding: 2rem");
  });
});
