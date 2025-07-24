import { useEffect, useReducer } from "react";
import { mainPageReducer, initialState } from "../state/mainPageReducer";
import { Container } from "@mui/material";
import { PersonService } from "../services/personService";
import { login } from "../services/authService";
import LoginScreen from "./LoginScreen";
import NavBar from "./NavBar";
import UserConfig from "./UserConfig";

const personService = new PersonService();

const MainPage = () => {
  const [state, dispatch] = useReducer(mainPageReducer, initialState);

  const loadDepartments = async () => {
    const result = await personService.getAllDepartments();
    dispatch({ type: "SET_DEPARTMENTS", payload: result });
  };

  const loadRoles = async () => {
    const result = await personService.getAllRoles();
    dispatch({ type: "SET_ROLES", payload: result });
  };

  const loadPeople = async () => {
    const all = await personService.getAllPeople(false);
    dispatch({ type: "SET_PEOPLE", payload: all });
  };

  const handleLogin = async (user: { email: string; password: string }) => {
    const loginData = await login(user);
    if (loginData.session.token) {
      localStorage.setItem("token", loginData.session.token);
      dispatch({ type: "LOGIN", payload: loginData.user });
      await loadPeople();
      await loadRoles();
      await loadDepartments();
    } else {
      alert("User not found");
    }
  };

  useEffect(() => {
    const results = personService.filterPeople(
      state.searchTerm,
      state.filterRole,
      state.filterDepartment
    );

    dispatch({ type: "SET_FILTERED_PEOPLE", payload: results });
  }, [
    state.people,
    state.searchTerm,
    state.filterRole,
    state.filterDepartment,
  ]);

  return (
    <>
      {!state.loggedInUser ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <>
          <NavBar
            state={state}
            dispatch={dispatch}
            personService={personService}
          />
          <Container>
            <UserConfig
              state={state}
              dispatch={dispatch}
              personService={personService}
            />
          </Container>
        </>
      )}
    </>
  );
};

export default MainPage;
