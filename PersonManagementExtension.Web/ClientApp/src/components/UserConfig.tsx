import { useState, useEffect } from "react";
import { MainPageAction, MainPageState } from "../state/mainPageReducer";
import Box from "@mui/material/Box";
import { styled } from "@mui/system";
import { PersonViewModel } from "../models/PersonViewModel";
import { PersonService } from "../services/personService";
import PersonEditor from "./PersonEditor";
import PersonList from "./PersonList";
import PersonSummary from "./PersonSummary";
import SearchBar from "./SearchBar";
import { ADMIN_ROLE_ID } from "../constants/roles";
import theme from "../theme";
import ActionSnackbar from "../elements/ActionSnackbar";

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

const UserConfig = ({
  state,
  dispatch,
  personService,
}: {
  state: MainPageState;
  dispatch: React.Dispatch<MainPageAction>;
  personService: PersonService;
}) => {
  const [snackbarStatus, setSnackbarStatus] = useState<
    "success" | "failed" | "info" | "warning" | "closed"
  >("closed");

  const loadPeople = async () => {
    const all = await personService.getAllPeople(false);
    dispatch({ type: "SET_PEOPLE", payload: all });
  };

  useEffect(() => {
    loadPeople();
  }, [state.loggedInUser]);

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    // Prevent closing on clickaway if you want
    if (reason === "clickaway") {
      return;
    }
    setSnackbarStatus("closed");
  };

  const handleSave = async (person: PersonViewModel) => {
    let success = false;
    if (person.id === 0 && state.loggedInUser) {
      success = await personService.addPerson(person, (errors: any) =>
        dispatch({ type: "SET_ERRORS", payload: errors })
      );
    } else {
      success = await personService.updatePerson(person, (errors: any) =>
        dispatch({ type: "SET_ERRORS", payload: errors })
      );
    }
    if (success) {
      setSnackbarStatus("success");
      await loadPeople();
      dispatch({ type: "SET_SELECTED_PERSON", payload: null });
    } else {
      setSnackbarStatus("failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (id > 0 && state.loggedInUser && state.loggedInUser.id !== id) {
      await personService.deletePerson(id);
    }
    await loadPeople();
    dispatch({ type: "SET_SELECTED_PERSON", payload: null });
  };

  const isAdmin = state.loggedInUser?.role === ADMIN_ROLE_ID;
  const visiblePeople = isAdmin
    ? state.filteredPeople
    : state.filteredPeople.filter((p) => p.id === state.loggedInUser!.id);

  return (
    <ContentWrapper>
      {isAdmin && (
        <LeftPane>
          <SearchBar state={state} dispatch={dispatch} />
          <PersonList
            people={visiblePeople}
            onSelect={async (id: number) => {
              const person = await personService.getPerson(id);
              dispatch({ type: "SET_SELECTED_PERSON", payload: person });
            }}
            onAddNew={() =>
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
                  biography: "",
                },
              })
            }
          />
        </LeftPane>
      )}

      <RightPane>
        {state.selectedPerson ? (
          <PersonEditor
            state={state}
            dispatch={dispatch}
            person={state.selectedPerson}
            personService={personService}
            onSave={handleSave}
            onDelete={() => handleDelete(state.selectedPerson!.id)}
            setSnackbarStatus={setSnackbarStatus}
          />
        ) : (
          <PersonSummary isAdmin={isAdmin} />
        )}

        {!isAdmin && (
          <PersonEditor
            state={state}
            dispatch={dispatch}
            person={state.loggedInUser!}
            personService={personService}
            onSave={handleSave}
            onDelete={() => handleDelete(state.selectedPerson!.id)}
            setSnackbarStatus={setSnackbarStatus}
          />
        )}
      </RightPane>

      <ActionSnackbar
        status={snackbarStatus}
        handleClose={handleSnackbarClose}
        successText="Action was successful!"
        failedText="Action failed. Please try again."
        warningText="Warning: Check your inputs."
        informationText="Action cancelled."
      />
    </ContentWrapper>
  );
};

export default UserConfig;
