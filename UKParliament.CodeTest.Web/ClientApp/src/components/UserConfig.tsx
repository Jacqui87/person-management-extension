import { useEffect } from "react";
import { MainPageAction, MainPageState } from "../state/mainPageReducer";
import { Box } from "@mui/material";
import { styled } from "@mui/system";
import { PersonViewModel } from "../models/PersonViewModel";
import { PersonService } from "../services/personService";
import PersonEditor from "./PersonEditor";
import PersonList from "./PersonList";
import PersonSummary from "./PersonSummary";
import SearchBar from "./SearchBar";
import { ADMIN_ROLE_ID } from "../constants/roles";

// Styled layout containers
const ContentWrapper = styled(Box)({
  display: "flex",
  marginTop: "2rem",
  border: "1px solid #ccc",
  borderRadius: "8px",
  overflow: "hidden",
});

const LeftPane = styled(Box)({
  flex: "0 0 35%",
  padding: "1rem",
  borderRight: "2px dotted #ccc",
  backgroundColor: "#f9f9f9",
});

const RightPane = styled(Box)({
  flex: "1",
  padding: "1rem",
});

const UserConfig = ({
  state,
  dispatch,
  personService,
}: {
  state: MainPageState;
  dispatch: React.Dispatch<MainPageAction>;
  personService: PersonService;
}) => {
  const loadPeople = async () => {
    const all = await personService.getAllPeople(false);
    dispatch({ type: "SET_PEOPLE", payload: all });
  };

  useEffect(() => {
    console.log("Reloading users");

    loadPeople();
  }, [state.loggedInUser]);

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
      await loadPeople();
      dispatch({ type: "SET_SELECTED_PERSON", payload: null });
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
            person={state.selectedPerson}
            onSave={handleSave}
            onCancel={() =>
              dispatch({ type: "SET_SELECTED_PERSON", payload: null })
            }
            onDelete={() => handleDelete(state.selectedPerson!.id)}
            currentUser={state.loggedInUser}
            departments={state.departments}
            roles={state.roles}
            errors={state.errors}
            setErrors={(errors) =>
              dispatch({ type: "SET_ERRORS", payload: errors })
            }
          />
        ) : (
          <PersonSummary isAdmin={isAdmin} />
        )}

        {!isAdmin && (
          <PersonEditor
            person={state.loggedInUser!}
            onSave={handleSave}
            onCancel={() =>
              dispatch({ type: "SET_SELECTED_PERSON", payload: null })
            }
            currentUser={state.loggedInUser!}
            departments={state.departments}
            roles={state.roles}
            errors={state.errors}
            setErrors={(errors) =>
              dispatch({ type: "SET_ERRORS", payload: errors })
            }
          />
        )}
      </RightPane>
    </ContentWrapper>
  );
};

export default UserConfig;
