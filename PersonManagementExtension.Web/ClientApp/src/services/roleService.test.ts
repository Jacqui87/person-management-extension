import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import { RoleService } from "./roleService";
import type { RoleViewModel } from "../models/RoleViewModel";

vi.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("RoleService", () => {
  const tokenValue = "fake-jwt-token";
  const baseUrl = `${import.meta.env.VITE_BASE_URL}/api/role`;
  let service: RoleService;

  beforeEach(() => {
    service = new RoleService();
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      if (key === "token") return tokenValue;
      return null;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });

  it("should throw error if token not found", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValueOnce(null);

    await expect(service.getAllRoles()).rejects.toThrowError(
      "No authentication token found"
    );
  });

  it("getAllRoles should call axios.get with correct headers and URL and return data", async () => {
    const rolesMock: RoleViewModel[] = [
      { id: 1, type: "Admin" },
      { id: 2, type: "User" },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: rolesMock });

    const result = await service.getAllRoles();

    expect(mockedAxios.get).toHaveBeenCalledWith(baseUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenValue}`,
      },
      withCredentials: true,
    });

    expect(result).toEqual(rolesMock);
  });
});
