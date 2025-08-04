import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PersonAction, PersonState } from "../state/personReducer";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import PersonEditor from "./PersonEditor";
import PersonList from "./PersonList";
import PersonSummary from "./PersonSummary";
import SearchBar from "./SearchBar";
import { ADMIN_ROLE_ID } from "../constants/roles";
import theme from "../theme";
import ActionSnackbar from "../elements/ActionSnackbar";
import { usePeople, useFilteredPeople } from "../hooks/usePeopleHooks";

// Styled layout containers
const ContentWrapper = styled(Box)({
  display: "flex",
  marginTop: "2rem",
  border: "1px solid #ccc",
  borderRadius: "8px",
  overflow: "hidden",
  flexDirection: "column", // default to column (mobile)
  [theme.breakpoints.up("md")]: {
    flexDirection: "row", // row on medium+ screens
  },
});

const LeftPane = styled(Box)(({ theme }) => ({
  flex: "0 0 100%",
  padding: "1rem",
  borderRight: "none",
  borderBottom: "2px dotted #ccc",

  [theme.breakpoints.up("md")]: {
    flex: "0 0 35%",
    borderRight: "2px dotted #ccc",
    borderBottom: "none",
  },
}));

const RightPane = styled(Box)(({ theme }) => ({
  flex: "1 1 100%",
  padding: "1rem",
  [theme.breakpoints.up("md")]: {
    flex: 1,
  },
}));

const PersonConfig = ({
  state,
  dispatch,
}: {
  state: PersonState;
  dispatch: React.Dispatch<PersonAction>;
}) => {
  const { t } = useTranslation();

  const filteredPeople = useFilteredPeople(
    state.searchTerm,
    state.filterRole,
    state.filterDepartment
  );

  const [snackbarStatus, setSnackbarStatus] = useState<
    "success" | "failed" | "info" | "warning" | "closed"
  >("closed");

  const { data: people, isLoading, isError, error } = usePeople();

  // Admin filtering logic
  const isAdmin = state.loggedInUser?.role === ADMIN_ROLE_ID;

  const visiblePeople = useMemo(() => {
    if (isAdmin) return filteredPeople;
    return filteredPeople.filter((p) => p.id === state.loggedInUser!.id);
  }, [isAdmin, filteredPeople, state.loggedInUser]);

  useEffect(() => {
    if (!isAdmin) {
      dispatch({
        type: "SET_SELECTED_PERSON",
        payload: state.loggedInUser,
      });
    }
  }, [isAdmin, state.loggedInUser, dispatch]);

  useEffect(() => {
    if (people) {
      dispatch({ type: "SET_PEOPLE", payload: people });
    }
  }, [people, dispatch]);

  const handleSnackbarClose = useCallback(
    (_event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === "clickaway") {
        return;
      }
      setSnackbarStatus("closed");
    },
    []
  );

  const handleSelect = useCallback(
    async (id: number) => {
      const selectedPerson = people?.find((p) => p.id === id) || null;
      dispatch({
        type: "SET_SELECTED_PERSON",
        payload: selectedPerson,
      });
    },
    [people, dispatch]
  );

  const handleAddNew = useCallback(() => {
    dispatch({
      type: "SET_SELECTED_PERSON",
      payload: {
        id: 0,
        firstName: "",
        lastName: "",
        role: 1,
        department: 1,
        dateOfBirth: "",
        password: "",
        email: "",
        cultureCode: "en-GB",
        biography: "",
      },
    });
  }, [dispatch]);

  // Optional: handle loading and error states
  if (isLoading) return <div>{t("common.loading_people")}</div>;
  if (isError)
    return <div>Error loading people: {(error as Error).message}</div>;

  return (
    <ContentWrapper>
      {isAdmin && (
        <LeftPane>
          <SearchBar state={state} dispatch={dispatch} />
          <PersonList
            people={visiblePeople}
            onSelect={handleSelect}
            onAddNew={handleAddNew}
          />
        </LeftPane>
      )}

      <RightPane>
        {state.selectedPerson ? (
          <PersonEditor
            state={state}
            dispatch={dispatch}
            person={state.selectedPerson}
            setSnackbarStatus={setSnackbarStatus}
          />
        ) : (
          <PersonSummary isAdmin={isAdmin} />
        )}
      </RightPane>

      <ActionSnackbar
        status={snackbarStatus}
        handleClose={handleSnackbarClose}
        successText={t("actions.successText")}
        failedText={t("actions.failedText")}
        warningText={t("actions.warningText")}
        informationText={t("actions.informationText")}
      />
    </ContentWrapper>
  );
};

export default PersonConfig;
