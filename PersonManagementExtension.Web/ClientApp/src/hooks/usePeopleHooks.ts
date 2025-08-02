import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PersonViewModel } from "../models/PersonViewModel";
import { PersonService } from "../services/personService";
import { compare } from "fast-json-patch";
import { useMemo } from "react";

const personService = new PersonService();

export function usePeople() {
  return useQuery<PersonViewModel[], Error>({
    queryKey: ["people"],
    queryFn: () => personService.getAllPeople(),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePerson(id: number) {
  return useQuery<PersonViewModel, Error>({
    queryKey: ["person", id],
    queryFn: () => personService.getById(id),
    enabled: !!id, // don't fetch if no id
  });
}

export function useAddPerson() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, PersonViewModel>({
    mutationFn: (newPerson) => personService.add(newPerson),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, PersonViewModel>({
    mutationFn: (updatedPerson) => {
      const people =
        queryClient.getQueryData<PersonViewModel[]>(["people"]) || [];
      const originalPerson = people.find((p) => p.id === updatedPerson.id);

      if (!originalPerson) {
        throw new Error(
          `Original person with id ${updatedPerson.id} not found in cache`
        );
      }

      // Generate JSON Patch document comparing original and updated person
      const patch = compare(originalPerson, updatedPerson);
      return personService.update(updatedPerson.id, patch);
    },
    onSuccess: (_, person) => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
      queryClient.invalidateQueries({ queryKey: ["person", person.id] });
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => personService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });
}

export function useIsEmailUnique(
  email: string,
  excludePersonId?: number
): boolean | undefined {
  const queryClient = useQueryClient();
  const people = queryClient.getQueryData<PersonViewModel[]>(["people"]);

  if (!people || !email.trim()) return undefined;

  const emailToCheck = email.toLowerCase().trim();

  const isUnique = !people.some(
    (p) =>
      p.email.toLowerCase().trim() === emailToCheck && p.id !== excludePersonId
  );

  return isUnique;
}

export function useFilteredPeople(
  searchTerm: string,
  roleFilter: number,
  departmentFilter: number
): PersonViewModel[] {
  const queryClient = useQueryClient();
  const people = queryClient.getQueryData<PersonViewModel[]>(["people"]) || [];

  const loweredSearch = searchTerm.toLowerCase().trim();

  // useMemo so this calculation only runs when dependencies change
  return useMemo(() => {
    return people.filter((p) => {
      const matchesSearch =
        loweredSearch.length === 0 ||
        p.firstName.toLowerCase().includes(loweredSearch) ||
        p.lastName.toLowerCase().includes(loweredSearch) ||
        p.email.toLowerCase().includes(loweredSearch);

      const matchesRole = roleFilter === 0 || p.role === roleFilter;

      const matchesDepartment =
        departmentFilter === 0 || p.department === departmentFilter;

      return matchesSearch && matchesRole && matchesDepartment;
    });
  }, [people, loweredSearch, roleFilter, departmentFilter]);
}
