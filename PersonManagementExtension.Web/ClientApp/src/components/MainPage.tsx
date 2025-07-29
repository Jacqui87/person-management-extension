import { useEffect, useReducer } from "react";
import { personReducer, initialState } from "../state/personReducer";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import { RoleService } from "../services/roleService";
import { PersonService } from "../services/personService";
import { DepartmentService } from "../services/departmentService";
import { login } from "../services/authService";
import LoginScreen from "./LoginScreen";
import NavBar from "./NavBar";
import PersonConfig from "./PersonConfig";

const roleService = new RoleService();
const personService = new PersonService();
const departmentService = new DepartmentService();

const MainPage = () => {
  const [state, dispatch] = useReducer(personReducer, initialState);

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

  const loadDepartments = async () => {
    const result = await departmentService.getAllDepartments();
    dispatch({ type: "SET_DEPARTMENTS", payload: result });
  };

  const loadRoles = async () => {
    const result = await roleService.getAllRoles();
    dispatch({ type: "SET_ROLES", payload: result });
  };

  const loadPeople = async () => {
    const all = await personService.getAllPeople();
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
      dispatch({ type: "SET_AUTHENTICATING", payload: false });
      return;
    }

    // If first login fails it means there is an invalid token - remove the token
    localStorage.removeItem("token");

    // Try login second time
    loginData = await login({
      email: user.email,
      password: user.password,
      token: "",
    });
    if (loginData && loginData.session && loginData.session.token) {
      await handleLoginSuccess(loginData);
      dispatch({ type: "SET_AUTHENTICATING", payload: false });
    }

    // If second login fails it means someone who isn't registered is trying to login
    dispatch({ type: "SET_TOKEN_INVALID", payload: true });
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
        <LoginScreen onLogin={handleLogin} tokenInvalid={state.tokenInvalid} />
      ) : (
        <>
          <NavBar
            state={state}
            dispatch={dispatch}
            personService={personService}
          />
          <Container>
            <PersonConfig
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
