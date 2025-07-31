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
  async getAllDepartments(): Promise<DepartmentViewModel[]> {
    const res = await axios.get<DepartmentViewModel[]>(BASE_URL, {
      headers: getAuthHeaders(),
      withCredentials: true,
    });
    return res.data;
  }
}
