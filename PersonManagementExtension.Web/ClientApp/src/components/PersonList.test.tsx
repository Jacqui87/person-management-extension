import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PersonList from "./PersonList";
import type { PersonViewModel } from "../models/PersonViewModel";

describe("PersonList Component", () => {
  const samplePeople: PersonViewModel[] = [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    } as any,
    {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
    } as any,
  ];

  it("renders the list of people with full names and emails", () => {
    render(
      <PersonList people={samplePeople} onSelect={vi.fn()} onAddNew={vi.fn()} />
    );

    expect(screen.getByText("common.people")).toBeInTheDocument();

    for (const person of samplePeople) {
      expect(
        screen.getByText(`${person.firstName} ${person.lastName}`)
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          new RegExp(`person_editor.email: ${person.email}`, "i")
        )
      ).toBeInTheDocument();
    }
  });

  it("calls onSelect with correct id when a person is clicked", async () => {
    const onSelect = vi.fn();
    render(
      <PersonList
        people={samplePeople}
        onSelect={onSelect}
        onAddNew={vi.fn()}
      />
    );

    // Click on the first person's ListItemButton
    const firstPersonButton = screen.getByRole("button", {
      name: new RegExp(
        `${samplePeople[0].firstName} ${samplePeople[0].lastName}`,
        "i"
      ),
    });
    expect(firstPersonButton).not.toBeNull();

    await fireEvent.click(firstPersonButton);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(samplePeople[0].id);
  });

  it("calls onAddNew when Add Person button is clicked", () => {
    const onAddNew = vi.fn();
    render(<PersonList people={[]} onSelect={vi.fn()} onAddNew={onAddNew} />);

    const addButton = screen.getByRole("button", {
      name: /person_editor.add/i,
    });

    fireEvent.click(addButton);

    expect(onAddNew).toHaveBeenCalledTimes(1);
  });
});
