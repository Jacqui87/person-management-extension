import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { DepartmentService } from "./departmentService";
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

describe("DepartmentService", () => {
  let service: DepartmentService;
  const token = "test-token";

  beforeEach(() => {
    service = new DepartmentService();

    // Simulate localStorage for token
    vi.stubGlobal("localStorage", {
      getItem: vi
        .fn()
        .mockImplementation((key) => (key === "token" ? token : null)),
    });

    vi.clearAllMocks();
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
});
