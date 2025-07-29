import axios from "axios";
import { DepartmentViewModel } from "../models/DepartmentViewModel";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/department`;

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

export class DepartmentService {
  private departmentsCache: DepartmentViewModel[] = [];

  // Use Axios to get all departments
  async getAllDepartments(): Promise<DepartmentViewModel[]> {
    if (this.departmentsCache.length > 0) return this.departmentsCache;

    try {
      const res = await axios.get<DepartmentViewModel[]>(BASE_URL, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      this.departmentsCache = res.data;
      return this.departmentsCache;
    } catch (error: any) {
      const message =
        error.response?.data || error.message || "Error fetching departments";
      throw new Error(message);
    }
  }
}
