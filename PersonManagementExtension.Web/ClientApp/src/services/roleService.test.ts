import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { RoleService } from "./roleService";
import type { RoleViewModel } from "../models/RoleViewModel";

// Vitest way to mock axios
vi.mock("axios");
const mockedAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe("RoleService", () => {
  let service: RoleService;
  const token = "test-token";

  beforeEach(() => {
    service = new RoleService();

    // Simulate localStorage for token
    vi.stubGlobal("localStorage", {
      getItem: vi
        .fn()
        .mockImplementation((key) => (key === "token" ? token : null)),
    });

    vi.clearAllMocks();
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
});
