import { useQuery } from "@tanstack/react-query";
import { RoleViewModel } from "../models/RoleViewModel";
import { RoleService } from "../services/roleService";

const roleService = new RoleService();

export function useRoles() {
  return useQuery<RoleViewModel[], Error>({
    queryKey: ["roles"],
    queryFn: () => roleService.getAllRoles(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache freshness
  });
}
