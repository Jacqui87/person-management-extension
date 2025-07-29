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
  private rolesCache: RoleViewModel[] = [];

  // Invalidate the people cache
  invalidateRolesCache() {
    this.rolesCache = [];
  }

  async refreshAllRoles(): Promise<RoleViewModel[]> {
    this.invalidateRolesCache();
    return await this.get();
  }

  // Use Axios to get all roles
  async getAllRoles(): Promise<RoleViewModel[]> {
    if (this.rolesCache.length > 0) return this.rolesCache;
    return await this.get();
  }

  // Use Axios to get all roles
  async get(): Promise<RoleViewModel[]> {
    if (this.rolesCache.length > 0) return this.rolesCache;

    try {
      const res = await axios.get<RoleViewModel[]>(BASE_URL, {
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
}
