import { render, screen, fireEvent } from "@testing-library/react";
import ActionSnackbar from "./ActionSnackbar";
import { vi, describe, it, expect } from "vitest";

describe("ActionSnackbar", () => {
  const handleClose = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders with severity 'success' and shows successText", () => {
    render(
      <ActionSnackbar
        status="success"
        handleClose={handleClose}
        successText="Success message"
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Success message");
    expect(screen.getByRole("alert")).toHaveClass("MuiAlert-filledSuccess");
  });

  it("renders with severity 'error' and shows failedText", () => {
    render(
      <ActionSnackbar
        status="failed"
        handleClose={handleClose}
        failedText="Failure message"
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Failure message");
    expect(screen.getByRole("alert")).toHaveClass("MuiAlert-filledError");
  });

  it("renders with severity 'info' and shows informationText", () => {
    render(
      <ActionSnackbar
        status="info"
        handleClose={handleClose}
        informationText="Information message"
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Information message");
    expect(screen.getByRole("alert")).toHaveClass("MuiAlert-filledInfo");
  });

  it("renders with severity 'warning' and shows warningText for unknown status", () => {
    render(
      <ActionSnackbar
        status="warning"
        handleClose={handleClose}
        warningText="Warning message"
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Warning message");
    expect(screen.getByRole("alert")).toHaveClass("MuiAlert-filledWarning");
  });

  it("calls handleClose when alert is closed", () => {
    render(
      <ActionSnackbar
        status="success"
        handleClose={handleClose}
        successText="Success"
      />
    );
    // The Alert component has an onClose on the close button, simulate click on close icon:
    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });
});
