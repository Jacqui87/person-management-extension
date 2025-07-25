import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PersonSummary from "./PersonSummary";

describe("PersonSummary", () => {
  it("renders admin message when isAdmin is true", () => {
    render(<PersonSummary isAdmin={true} />);
    expect(
      screen.getByText(
        /select a person from the list or click 'add person' to begin\./i
      )
    ).toBeInTheDocument();
  });

  it("renders user message when isAdmin is false", () => {
    render(<PersonSummary isAdmin={false} />);
    expect(
      screen.getByText(/you are logged in - view or edit your own details\./i)
    ).toBeInTheDocument();
  });
});
