import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { PersonState, PersonAction } from "../state/personReducer";

const NavBar = ({
  state,
  dispatch,
}: {
  state: PersonState;
  dispatch: React.Dispatch<PersonAction>;
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    // Invalidate React Query cache for people data
    await queryClient.invalidateQueries({ queryKey: ["people"] });

    dispatch({ type: "SET_PEOPLE", payload: [] });
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
