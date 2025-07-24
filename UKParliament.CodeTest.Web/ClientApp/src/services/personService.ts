import axios from "axios";
import { PersonViewModel } from "../models/PersonViewModel";
import { DepartmentViewModel } from "../models/DepartmentViewModel";

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
  private departmentsCache: DepartmentViewModel[] = [];

  // Use Axios to get all people
  async getAllPeople(): Promise<PersonViewModel[]> {
    if (this.peopleCache.length > 0) return this.peopleCache;

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

  // Local search in cache, unchanged
  searchPeople(query: string): PersonViewModel[] {
    if (!query) return this.peopleCache;

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

  invalidatePeopleCache() {
    this.peopleCache = [];
  }

  // Get one person by ID with Axios
  async getPerson(id: number): Promise<PersonViewModel> {
    try {
      const res = await axios.get<PersonViewModel>(`${BASE_URL}/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
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
      const res = await axios.post(BASE_URL, person, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      setErrors({});
      this.invalidatePeopleCache();

      return true;
    } catch (error: any) {
      const message = error.response?.data || error.message;
      console.error("Add person failed:", message);
      throw new Error(message);
      return false;
    }
  }

  // Update person
  async updatePerson(
    person: PersonViewModel,
    setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>
  ): Promise<boolean> {
    try {
      const res = await axios.put(`${BASE_URL}/${person.id}`, person, {
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
      const res = await axios.delete(`${BASE_URL}/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      this.invalidatePeopleCache();
    } catch (error: any) {
      const message = error.response?.data || error.message || "Delete failed";
      throw new Error(message);
    }
  }
}
