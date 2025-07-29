// mainPageReducer.ts
import { RoleViewModel } from "../models/RoleViewModel";
import { PersonViewModel } from "../models/PersonViewModel";
import { DepartmentViewModel } from "../models/DepartmentViewModel";
import { PersonService } from "../services/personService";

export interface MainPageState {
  loggedInUser: PersonViewModel | null;
  people: PersonViewModel[];
  selectedPerson: PersonViewModel | null;
  departments: DepartmentViewModel[];
  roles: RoleViewModel[];
  searchTerm: string;
  filterRole: number;
  filterDepartment: number;
  filteredPeople: PersonViewModel[];
  errors: Record<string, any>;
  isAuthenticating: boolean;
  tokenInvalid: boolean;
}

export const initialState: MainPageState = {
  loggedInUser: null,
  people: [],
  selectedPerson: null,
  departments: [],
  roles: [],
  searchTerm: "",
  filterRole: 0,
  filterDepartment: 0,
  filteredPeople: [],
  errors: {},
  isAuthenticating: true,
  tokenInvalid: false,
};

export type MainPageAction =
  | { type: "LOGIN"; payload: PersonViewModel }
  | { type: "LOGOUT" }
  | { type: "SET_PEOPLE"; payload: PersonViewModel[] }
  | { type: "SET_SELECTED_PERSON"; payload: PersonViewModel | null }
  | { type: "SET_DEPARTMENTS"; payload: DepartmentViewModel[] }
  | { type: "SET_ROLES"; payload: RoleViewModel[] }
  | { type: "SET_SEARCH_TERM"; payload: string }
  | { type: "SET_FILTER_ROLE"; payload: number }
  | { type: "SET_FILTER_DEPARTMENT"; payload: number }
  | { type: "SET_FILTERED_PEOPLE"; payload: PersonService }
  | { type: "SET_ERRORS"; payload: Record<string, any> }
  | { type: "SET_AUTHENTICATING"; payload: boolean }
  | { type: "SET_TOKEN_INVALID"; payload: boolean };

export function mainPageReducer(
  state: MainPageState,
  action: MainPageAction
): MainPageState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, loggedInUser: action.payload };
    case "LOGOUT":
      localStorage.removeItem("token");
      return { ...initialState };
    case "SET_PEOPLE":
      return { ...state, people: action.payload };
    case "SET_SELECTED_PERSON":
      return { ...state, selectedPerson: action.payload };
    case "SET_ROLES":
      return { ...state, roles: action.payload };
    case "SET_DEPARTMENTS":
      return { ...state, departments: action.payload };
    case "SET_SEARCH_TERM":
      return { ...state, searchTerm: action.payload };
    case "SET_FILTER_ROLE":
      return { ...state, filterRole: action.payload };
    case "SET_FILTER_DEPARTMENT":
      return { ...state, filterDepartment: action.payload };
    case "SET_FILTERED_PEOPLE":
      const results = action.payload.filterPeople(
        state.searchTerm,
        state.filterRole,
        state.filterDepartment
      );

      return { ...state, filteredPeople: results };
    case "SET_ERRORS":
      return { ...state, errors: action.payload };
    case "SET_AUTHENTICATING":
      return { ...state, isAuthenticating: action.payload };
    case "SET_TOKEN_INVALID":
      return { ...state, tokenInvalid: action.payload };
    default:
      return state;
  }
}
