import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { PersonService } from "./personService";
import type { PersonViewModel } from "../models/PersonViewModel";
import type { DepartmentViewModel } from "../models/DepartmentViewModel";
import type { RoleViewModel } from "../models/RoleViewModel";

// Vitest way to mock axios
vi.mock("axios");
const mockedAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe("PersonService", () => {
  let service: PersonService;
  const token = "test-token";

  beforeEach(() => {
    service = new PersonService();

    // Simulate localStorage for token
    vi.stubGlobal("localStorage", {
      getItem: vi
        .fn()
        .mockImplementation((key) => (key === "token" ? token : null)),
    });

    vi.clearAllMocks();
  });

  it("should return people data from API and cache", async () => {
    const fakePeople: PersonViewModel[] = [
      {
        id: 1,
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@x.com",
        role: 1,
        department: 1,
      } as any,
    ];
    mockedAxios.get.mockResolvedValueOnce({ data: fakePeople });

    const result = await service.getAllPeople(false);
    expect(result).toEqual(fakePeople);
    expect(service["peopleCache"]).toEqual(fakePeople);
  });

  it("should filter people by name", () => {
    service["peopleCache"] = [
      {
        id: 2,
        firstName: "Anna",
        lastName: "Smith",
        email: "anna@x.com",
        role: 2,
        department: 2,
      } as any,
    ];
    const result = service.filterPeople("anna", 0, 0);
    expect(result[0].firstName).toBe("Anna");
  });

  it("should handle getAllDepartments API failure", async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { data: "Error!" } });
    await expect(service.getAllDepartments()).rejects.toThrow("Error!");
  });

  // Add more test cases as needed for updatePerson, addPerson, deletePerson, etc.
});
