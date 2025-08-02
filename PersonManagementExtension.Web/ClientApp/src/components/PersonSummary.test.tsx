import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PersonSummary from "./PersonSummary";

// --- Mock i18next useTranslation ---
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // simple passthrough for testing
  }),
}));

describe("PersonSummary", () => {
  it("renders admin message when isAdmin is true", () => {
    render(<PersonSummary isAdmin={true} />);
    expect(screen.getByText("person_summary.isAdmin")).toBeInTheDocument();
  });

  it("renders user message when isAdmin is false", () => {
    render(<PersonSummary isAdmin={false} />);
    expect(screen.getByText("person_summary.isUser")).toBeInTheDocument();
  });
});
