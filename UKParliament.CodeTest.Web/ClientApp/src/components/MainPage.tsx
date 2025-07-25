import { useEffect, useReducer } from "react";
import { mainPageReducer, initialState } from "../state/mainPageReducer";
import { Box, CircularProgress, Container } from "@mui/material";
import { PersonService } from "../services/personService";
import { login } from "../services/authService";
import LoginScreen from "./LoginScreen";
import NavBar from "./NavBar";
import UserConfig from "./UserConfig";

const personService = new PersonService();

const MainPage = () => {
  const [state, dispatch] = useReducer(mainPageReducer, initialState);

  useEffect(() => {
    const doLogin = async () => {
      dispatch({ type: "SET_AUTHENTICATING", payload: true });

      // Get token and try login
      const token = localStorage.getItem("token");
      if (token) {
        const data = await login({ password: "", email: "", token });
        if (data != null && data.user) {
          handleLogin(data.user);
        } else {
          dispatch({ type: "SET_AUTHENTICATING", payload: false });
        }
      } else {
        dispatch({ type: "SET_AUTHENTICATING", payload: false });
      }
    };
    doLogin();
  }, []);

  useEffect(() => {
    dispatch({ type: "SET_FILTERED_PEOPLE", payload: personService });
  }, [
    state.people,
    state.searchTerm,
    state.filterRole,
    state.filterDepartment,
  ]);

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

  const handleLogin = async (user: {
    email: string | null;
    password: string | null;
    token: string | null;
  }) => {
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

    dispatch({ type: "SET_AUTHENTICATING", payload: false });
  };

  return (
    <>
      {state.isAuthenticating ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : !state.loggedInUser ? (
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
