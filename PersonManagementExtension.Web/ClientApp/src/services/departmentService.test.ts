import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import { DepartmentService } from "./departmentService";
import type { DepartmentViewModel } from "../models/DepartmentViewModel";

vi.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("DepartmentService", () => {
  const tokenValue = "fake-jwt-token";
  const baseUrl = `${import.meta.env.VITE_BASE_URL}/api/department`;
  let service: DepartmentService;

  beforeEach(() => {
    service = new DepartmentService();
    // Mock localStorage.getItem to return token
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) => {
      if (key === "token") return tokenValue;
      return null;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetAllMocks();
  });

  it("should throw error if no authentication token found", async () => {
    // Mock to simulate missing token
    vi.spyOn(Storage.prototype, "getItem").mockReturnValueOnce(null);

    await expect(service.getAllDepartments()).rejects.toThrowError(
      "No authentication token found"
    );
  });

  it("getAllDepartments should call axios.get with correct headers and url and return data", async () => {
    const departmentsMock: DepartmentViewModel[] = [
      { id: 1, name: "Dept A" },
      { id: 2, name: "Dept B" },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: departmentsMock });

    const result = await service.getAllDepartments();

    expect(mockedAxios.get).toHaveBeenCalledWith(baseUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenValue}`,
      },
      withCredentials: true,
    });

    expect(result).toEqual(departmentsMock);
  });
});
