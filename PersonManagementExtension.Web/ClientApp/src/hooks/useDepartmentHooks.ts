import { useQuery } from "@tanstack/react-query";
import { DepartmentViewModel } from "../models/DepartmentViewModel";
import { DepartmentService } from "../services/departmentService";

const departmentService = new DepartmentService();

export function useDepartments() {
  return useQuery<DepartmentViewModel[], Error>({
    queryKey: ["departments"],
    queryFn: () => departmentService.getAllDepartments(),
    staleTime: 5 * 60 * 1000,
  });
}
