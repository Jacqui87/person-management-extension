import { PersonViewModel } from "../models/PersonViewModel";
import { DepartmentViewModel } from "../models/DepartmentViewModel";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/person`;

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export class PersonService {
  private peopleCache: PersonViewModel[] = [];
  private departmentsCache: DepartmentViewModel[] = [];

  async getAllPeople(): Promise<PersonViewModel[]> {
    if (this.peopleCache.length > 0) {
      return this.peopleCache;
    }

    const res = await fetch(BASE_URL, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error fetching people: ${text || res.statusText}`);
    }

    this.peopleCache = await res.json();
    return this.peopleCache;
  }

  async getAllDepartments(): Promise<DepartmentViewModel[]> {
    if (this.departmentsCache.length > 0) {
      return this.departmentsCache;
    }

    const res = await fetch(`${BASE_URL}/departments`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error fetching departments: ${text || res.statusText}`);
    }

    this.departmentsCache = await res.json();
    return this.departmentsCache;
  }

  // The local search - filter cache by matching any field (case-insensitive)
  searchPeople(query: string): PersonViewModel[] {
    if (!query) {
      return this.peopleCache;
    }

    const lowerQuery = query.toLowerCase();

    return this.peopleCache.filter((p) => {
      return (
        p.firstName.toLowerCase().includes(lowerQuery) ||
        p.lastName.toLowerCase().includes(lowerQuery) ||
        p.email.toLowerCase().includes(lowerQuery) ||
        p.role.toLowerCase().includes(lowerQuery)
      );
    });
  }

  // Invalidate cache (call after add/update/delete)
  invalidatePeopleCache() {
    this.peopleCache = [];
  }

  // Similarly for other methods you still do with fetch
  async getPerson(id: number): Promise<PersonViewModel> {
    const res = await fetch(`${BASE_URL}/${id}`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Error fetching person with ID ${id}: ${text || res.statusText}`
      );
    }

    return res.json();
  }

  async addPerson(person: PersonViewModel): Promise<void> {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(person),
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Add person failed:", text);
      throw new Error(`Failed to add person: ${text || res.statusText}`);
    }

    this.invalidatePeopleCache(); // Clear cache to fetch fresh later
  }

  async updatePerson(person: PersonViewModel): Promise<void> {
    const res = await fetch(`${BASE_URL}/${person.id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(person),
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Update failed:", text);
      throw new Error(`Failed to update person: ${text || res.statusText}`);
    }

    this.invalidatePeopleCache();
  }

  async deletePerson(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to delete person: ${text || res.statusText}`);
    }

    this.invalidatePeopleCache();
  }
}
