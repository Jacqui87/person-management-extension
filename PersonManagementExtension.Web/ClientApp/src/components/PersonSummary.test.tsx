import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PersonSummary from "./PersonSummary";

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
