import { PersonService } from "../services/personService";
import { PersonState, PersonAction } from "../state/personReducer";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";

const NavBar = ({
  state,
  dispatch,
  personService,
}: {
  state: PersonState;
  dispatch: React.Dispatch<PersonAction>;
  personService: PersonService;
}) => {
  const { t } = useTranslation();

  const handleLogout = async () => {
    const all = personService.invalidatePeopleCache();
    dispatch({ type: "SET_PEOPLE", payload: all });

    dispatch({ type: "LOGOUT" });
    dispatch({ type: "SET_AUTHENTICATING", payload: false });
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6" component="div">
          {t("nav_bar.person_manager")}
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body1">
            {state.loggedInUser?.firstName} {state.loggedInUser?.lastName}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            {t("nav_bar.logout")}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
