import axios from "axios";
import { PersonViewModel } from "../models/PersonViewModel";
import { DepartmentViewModel } from "../models/DepartmentViewModel";
import { RoleViewModel } from "../models/RoleViewModel";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/person`;

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export class PersonService {
  private peopleCache: PersonViewModel[] = [];
  private rolesCache: RoleViewModel[] = [];
  private departmentsCache: DepartmentViewModel[] = [];

  // Use Axios to get all people
  async getAllPeople(clear: boolean): Promise<PersonViewModel[]> {
    if (clear) return (this.peopleCache = []);
    if (this.peopleCache.length > 0) return this.peopleCache;
    return await this.allPeople();
  }

  async refreshAllPeople(): Promise<PersonViewModel[]> {
    this.invalidatePeopleCache();
    return await this.allPeople();
  }

  async allPeople(): Promise<PersonViewModel[]> {
    try {
      const res = await axios.get<PersonViewModel[]>(BASE_URL, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      this.peopleCache = res.data;
      return this.peopleCache;
    } catch (error: any) {
      const message =
        error.response?.data || error.message || "Error fetching people";
      throw new Error(message);
    }
  }

  // Use Axios to get all departments
  async getAllDepartments(): Promise<DepartmentViewModel[]> {
    if (this.departmentsCache.length > 0) return this.departmentsCache;

    try {
      const res = await axios.get<DepartmentViewModel[]>(
        `${BASE_URL}/departments`,
        {
          headers: getAuthHeaders(),
          withCredentials: true,
        }
      );

      this.departmentsCache = res.data;
      return this.departmentsCache;
    } catch (error: any) {
      const message =
        error.response?.data || error.message || "Error fetching departments";
      throw new Error(message);
    }
  }

  // Use Axios to get all roles
  async getAllRoles(): Promise<RoleViewModel[]> {
    if (this.rolesCache.length > 0) return this.rolesCache;

    try {
      const res = await axios.get<RoleViewModel[]>(`${BASE_URL}/roles`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      this.rolesCache = res.data;
      return this.rolesCache;
    } catch (error: any) {
      const message =
        error.response?.data || error.message || "Error fetching roles";
      throw new Error(message);
    }
  }

  // Search people based on search term and filters
  filterPeople(
    searchTerm: string,
    roleFilter: number,
    departmentFilter: number
  ): PersonViewModel[] {
    const loweredSearch = searchTerm.toLowerCase().trim();

    return this.peopleCache.filter((p) => {
      const matchesSearch =
        loweredSearch.length === 0 ||
        p.firstName.toLowerCase().includes(loweredSearch) ||
        p.lastName.toLowerCase().includes(loweredSearch) ||
        p.email.toLowerCase().includes(loweredSearch);

      const matchesRole = roleFilter === 0 || p.role === roleFilter;

      const matchesDepartment =
        departmentFilter === 0 || p.department === departmentFilter;

      // Include if ANY filter matches:
      return matchesSearch && matchesRole && matchesDepartment;
    });
  }

  isEmailUnique(
    email: string,
    excludePersonId: number | undefined
  ): Promise<boolean> {
    const emailToCheck = email.toLowerCase().trim();
    const isUnique =
      excludePersonId === 0
        ? !this.peopleCache.some(
            (p) => p.email.toLowerCase().trim() === emailToCheck
          )
        : !this.peopleCache.some(
            (p) =>
              p.email.toLowerCase().trim() === emailToCheck &&
              p.id !== excludePersonId
          );
    return Promise.resolve(isUnique);
  }

  // Invalidate the people cache
  invalidatePeopleCache() {
    this.peopleCache = [];
  }

  // Get one person by ID with Axios
  async getPerson(id: number): Promise<PersonViewModel> {
    // Try to find the person in the cache first
    const cachedPerson = this.peopleCache.find((p) => p.id === id);
    if (cachedPerson) {
      return cachedPerson;
    }

    // If not in cache, fetch from API and optionally add to cache
    try {
      const res = await axios.get<PersonViewModel>(`${BASE_URL}/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      // Optionally add/update the person in the cache
      // This depends on your cache update strategy
      // If you want to keep cache in sync, you can add/update here:
      const index = this.peopleCache.findIndex((p) => p.id === id);
      if (index !== -1) {
        this.peopleCache[index] = res.data;
      } else {
        this.peopleCache.push(res.data);
      }

      return res.data;
    } catch (error: any) {
      const message =
        error.response?.data ||
        `Error fetching person with ID ${id}: ${error.message}`;
      throw new Error(message);
    }
  }

  // Add person with Axios post
  async addPerson(
    person: PersonViewModel,
    setErrors: React.Dispatch<React.SetStateAction<{}>>
  ): Promise<boolean> {
    try {
      await axios.post(BASE_URL, person, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      setErrors({});
      this.invalidatePeopleCache();
      await this.refreshAllPeople();

      return true;
    } catch (error: any) {
      const message = error.response?.data || error.message;
      console.error("Add person failed:", message);
      throw new Error(message);
    }
  }

  // Update person
  async updatePerson(
    person: PersonViewModel,
    setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>
  ): Promise<boolean> {
    try {
      await axios.put(`${BASE_URL}/${person.id}`, person, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      setErrors({});
      this.invalidatePeopleCache();

      return true;
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: [error.message || "Unknown error"] });
      }
      return false;
    }
  }

  // Delete person using Axios
  async deletePerson(id: number): Promise<void> {
    try {
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      this.invalidatePeopleCache();
      await this.refreshAllPeople();
    } catch (error: any) {
      console.error("Delete person failed:", error);

      const message = error.response?.data || error.message || "Delete failed";
      throw new Error(message);
    }
  }
}
