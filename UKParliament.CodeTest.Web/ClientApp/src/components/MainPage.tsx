import { useEffect, useReducer } from "react";
import { mainPageReducer, initialState } from "../state/mainPageReducer";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
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
    // A helper to handle successful login
    const handleLoginSuccess = async (loginData: any) => {
      dispatch({ type: "SET_TOKEN_INVALID", payload: false });
      localStorage.setItem("token", loginData.session.token);
      dispatch({ type: "LOGIN", payload: loginData.user });
      await loadPeople();
      await loadRoles();
      await loadDepartments();
    };

    // Try login once
    let loginData = await login(user);
    if (loginData && loginData.session && loginData.session.token) {
      await handleLoginSuccess(loginData);
      return;
    }

    // If first login fails, set token invalid
    dispatch({ type: "SET_TOKEN_INVALID", payload: true });

    // Try login second time
    loginData = await login(user);
    if (loginData && loginData.session && loginData.session.token) {
      await handleLoginSuccess(loginData);
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
