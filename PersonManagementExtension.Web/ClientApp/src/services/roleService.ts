import axios from "axios";
import { RoleViewModel } from "../models/RoleViewModel";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/api/role`;

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

export class RoleService {
  async getAllRoles(): Promise<RoleViewModel[]> {
    const res = await axios.get<RoleViewModel[]>(BASE_URL, {
      headers: getAuthHeaders(),
      withCredentials: true,
    });
    return res.data;
  }
}
