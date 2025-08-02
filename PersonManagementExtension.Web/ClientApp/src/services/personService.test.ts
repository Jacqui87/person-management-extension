import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import { PersonService } from "./personService";
import type { PersonViewModel } from "../models/PersonViewModel";
import { Operation } from "fast-json-patch";

vi.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("PersonService", () => {
  const tokenValue = "fake-jwt-token";
  const baseUrl = `${import.meta.env.VITE_BASE_URL}/api/person`;
  let service: PersonService;

  // Set up localStorage mock
  beforeEach(() => {
    service = new PersonService();
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

    await expect(service.getAllPeople()).rejects.toThrowError(
      "No authentication token found"
    );
  });

  it("getAllPeople should call axios.get with correct headers and URL and return data", async () => {
    const peopleMock: PersonViewModel[] = [
      {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-05-15",
        email: "john@example.com",
        department: 1,
        password: "pass",
        role: 2,
        cultureCode: "en-GB",
        biography: "",
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: peopleMock });

    const result = await service.getAllPeople();

    expect(mockedAxios.get).toHaveBeenCalledWith(baseUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenValue}`,
      },
      withCredentials: true,
    });
    expect(result).toEqual(peopleMock);
  });

  it("getById should call axios.get with correct URL, headers and return data", async () => {
    const personMock: PersonViewModel = {
      id: 42,
      firstName: "Alice",
      lastName: "Smith",
      dateOfBirth: "1990-05-15",
      email: "alice@example.com",
      department: 1,
      password: "pass",
      role: 2,
      cultureCode: "en-GB",
      biography: "",
    };

    mockedAxios.get.mockResolvedValueOnce({ data: personMock });

    const result = await service.getById(42);

    expect(mockedAxios.get).toHaveBeenCalledWith(`${baseUrl}/42`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenValue}`,
      },
      withCredentials: true,
    });
    expect(result).toEqual(personMock);
  });

  it("add should call axios.post with person and correct headers", async () => {
    const personToAdd: PersonViewModel = {
      id: 0,
      firstName: "New",
      lastName: "Person",
      dateOfBirth: "1990-05-15",
      email: "new@example.com",
      department: 1,
      password: "pass",
      role: 2,
      cultureCode: "en-GB",
      biography: "",
    };

    mockedAxios.post.mockResolvedValueOnce({});

    await service.add(personToAdd);

    expect(mockedAxios.post).toHaveBeenCalledWith(baseUrl, personToAdd, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenValue}`,
      },
      withCredentials: true,
    });
  });

  it("update should call axios.patch with person and correct URL and headers", async () => {
    const id = 5;
    const patch: Operation[] = [
      { op: "replace", path: "/firstName", value: "Updated" },
      { op: "replace", path: "/email", value: "updated@example.com" },
    ];

    mockedAxios.patch.mockResolvedValueOnce({});

    await service.update(id, patch);

    expect(mockedAxios.patch).toHaveBeenCalledWith(`${baseUrl}/5`, patch, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenValue}`,
      },
      withCredentials: true,
    });
  });

  it("delete should call axios.delete with correct URL and headers", async () => {
    const idToDelete = 7;

    mockedAxios.delete.mockResolvedValueOnce({});

    await service.delete(idToDelete);

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `${baseUrl}/${idToDelete}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenValue}`,
        },
        withCredentials: true,
      }
    );
  });
});
