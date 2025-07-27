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

  it("getAllPeople with clear=true returns empty array", async () => {
    const result = await service.getAllPeople(true);
    expect(result).toEqual([]);
  });

  it("throws if no auth token is found", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn().mockReturnValue(null),
    });

    service = new PersonService();
    await expect(service.getAllPeople(false)).rejects.toThrow(
      "No authentication token found"
    );
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

  it("clears people cache when getAllPeople(true) is called", async () => {
    service["peopleCache"] = [{ id: 123, email: "a@b.com" } as any];
    const result = await service.getAllPeople(true);
    expect(service["peopleCache"]).toEqual([]);
    expect(result).toEqual([]);
  });

  it("should handle getAllDepartments API failure", async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { data: "Error!" } });
    await expect(service.getAllDepartments()).rejects.toThrow("Error!");
  });

  it("getAllDepartments caches response", async () => {
    const departments: DepartmentViewModel[] = [{ id: 1, name: "HR" }] as any;
    mockedAxios.get.mockResolvedValueOnce({ data: departments });

    const result1 = await service.getAllDepartments();
    const result2 = await service.getAllDepartments(); // should use cache

    expect(result1).toEqual(departments);
    expect(result2).toEqual(departments);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it("should handle getAllRoles API failure", async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { data: "Error!" } });
    await expect(service.getAllRoles()).rejects.toThrow("Error!");
  });

  it("getAllRoles caches response", async () => {
    const roles: RoleViewModel[] = [{ id: 1, name: "Admin" }] as any;
    mockedAxios.get.mockResolvedValueOnce({ data: roles });

    const result1 = await service.getAllRoles();
    const result2 = await service.getAllRoles(); // Should use cache

    expect(result1).toEqual(roles);
    expect(result2).toEqual(roles);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it("isEmailUnique returns false for existing email with different ID", async () => {
    service["peopleCache"] = [{ id: 10, email: "test@x.com" } as any];
    const result = await service.isEmailUnique("test@x.com", 11);
    expect(result).toBe(false);
  });

  it("isEmailUnique returns true for unique email", async () => {
    service["peopleCache"] = [{ id: 10, email: "test@x.com" } as any];
    const result = await service.isEmailUnique("unique@x.com", 0);
    expect(result).toBe(true);
  });

  it("getPerson throws if not found in cache or API", async () => {
    mockedAxios.get.mockRejectedValueOnce({ message: "Not Found" });

    await expect(service.getPerson(404)).rejects.toThrow("Not Found");
  });

  it("getPerson returns person from cache if present", async () => {
    const cachedPerson = {
      id: 5,
      firstName: "Ella",
      lastName: "Stone",
      email: "ella@example.com",
      role: 1,
      department: 2,
    } as any;

    service["peopleCache"] = [cachedPerson];
    const result = await service.getPerson(5);
    expect(result).toBe(cachedPerson);
  });

  it("getPerson fetches from API if not in cache", async () => {
    const personFromApi = {
      id: 6,
      firstName: "Luke",
      lastName: "Skywalker",
      email: "luke@x.com",
      role: 3,
      department: 1,
    } as any;

    mockedAxios.get.mockResolvedValueOnce({ data: personFromApi });

    const result = await service.getPerson(6);
    expect(result).toEqual(personFromApi);
    expect(service["peopleCache"]).toContainEqual(personFromApi);
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

  it("addPerson posts and refreshes people", async () => {
    mockedAxios.post.mockResolvedValueOnce({});
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // refreshAllPeople

    const setErrors = vi.fn();
    const result = await service.addPerson({} as any, setErrors);
    expect(result).toBe(true);
    expect(mockedAxios.post).toHaveBeenCalled();
    expect(setErrors).toHaveBeenCalledWith({});
  });

  it("updatePerson handles success", async () => {
    mockedAxios.put.mockResolvedValueOnce({});
    const setErrors = vi.fn();

    const result = await service.updatePerson({ id: 1 } as any, setErrors);
    expect(result).toBe(true);
    expect(setErrors).toHaveBeenCalledWith({});
  });

  it("updatePerson handles validation error response", async () => {
    mockedAxios.put.mockRejectedValueOnce({
      response: { data: { errors: { email: ["Invalid email"] } } },
    });

    const setErrors = vi.fn();
    const result = await service.updatePerson({ id: 1 } as any, setErrors);
    expect(result).toBe(false);
    expect(setErrors).toHaveBeenCalledWith({ email: ["Invalid email"] });
  });

  it("deletePerson deletes person and refreshes", async () => {
    mockedAxios.delete.mockResolvedValueOnce({});
    mockedAxios.get.mockResolvedValueOnce({ data: [] }); // refreshAllPeople

    await service.deletePerson(1);
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      expect.stringContaining("/1"),
      expect.anything()
    );
  });

  it("deletePerson throws on failure", async () => {
    mockedAxios.delete.mockRejectedValueOnce({ message: "fail" });

    await expect(service.deletePerson(99)).rejects.toThrow("fail");
  });
});
