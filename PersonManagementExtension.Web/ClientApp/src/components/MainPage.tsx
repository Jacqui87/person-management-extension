import { useCallback, useEffect, useReducer } from "react";
import { personReducer, initialState } from "../state/personReducer";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import { RoleService } from "../services/roleService";
import { DepartmentService } from "../services/departmentService";
import { login } from "../services/authService";
import LoginScreen from "./LoginScreen";
import NavBar from "./NavBar";
import i18n from "../i18n";
import PersonConfig from "./PersonConfig";
import { LoginCredentialsViewModel } from "../models/LoginCredentialsViewModel";

const roleService = new RoleService();
const departmentService = new DepartmentService();

const MainPage = () => {
  const [state, dispatch] = useReducer(personReducer, initialState);

  const handleLogin = useCallback(
    async (user: {
      email: string | null;
      password: string | null;
      token: string | null;
    }) => {
      // A helper to handle successful login
      const handleLoginSuccess = async (
        loginData: LoginCredentialsViewModel | null
      ) => {
        if (loginData != null) {
          const lang = loginData.user.cultureCode || "en-GB";
          i18n.changeLanguage(lang);

          dispatch({ type: "SET_TOKEN_INVALID", payload: false });
          localStorage.setItem("token", loginData.session.token);
          dispatch({ type: "LOGIN", payload: loginData.user });

          await loadRoles();
          await loadDepartments();
        }
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
    },
    []
  );

  useEffect(() => {
    let mounted = true;

    const doLogin = async () => {
      dispatch({ type: "SET_AUTHENTICATING", payload: true });

      // Get token and try login
      const token = localStorage.getItem("token");
      if (token) {
        const data = await login({ password: "", email: "", token });
        if (mounted) {
          if (data != null && data.user) {
            handleLogin({
              email: data.user.email,
              password: data.user.password,
              token: data.session.token,
            });
          } else {
            dispatch({ type: "SET_AUTHENTICATING", payload: false });
          }
        }
      } else {
        if (mounted) dispatch({ type: "SET_AUTHENTICATING", payload: false });
      }
    };

    doLogin();

    return () => {
      mounted = false;
    };
  }, [handleLogin]);

  const loadDepartments = async () => {
    const result = await departmentService.getAllDepartments();
    dispatch({ type: "SET_DEPARTMENTS", payload: result });
  };

  const loadRoles = async () => {
    const result = await roleService.getAllRoles();
    dispatch({ type: "SET_ROLES", payload: result });
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
          <NavBar state={state} dispatch={dispatch} />
          <Container>
            <PersonConfig state={state} dispatch={dispatch} />
          </Container>
        </>
      )}
    </>
  );
};

export default MainPage;
