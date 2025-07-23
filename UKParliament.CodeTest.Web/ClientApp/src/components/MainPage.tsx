import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from "@mui/material";
import { styled } from "@mui/system";
import { PersonViewModel } from "../models/PersonViewModel";
import { PersonService } from "../services/personService";
import { login } from "../services/authService";
import LoginScreen from "./LoginScreen";
import PersonEditor from "./PersonEditor";
import PersonList from "./PersonList";
import PersonSummary from "./PersonSummary";
import SearchBar from "./SearchBar";
import { DepartmentViewModel } from "../models/DepartmentViewModel";

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

const personService = new PersonService();

const MainPage = () => {
  const [loggedInUser, setLoggedInUser] = useState<PersonViewModel | null>(
    null
  );
  const [people, setPeople] = useState<PersonViewModel[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<PersonViewModel | null>(
    null
  );
  const [departments, setDepartments] = useState<DepartmentViewModel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPeople, setFilteredPeople] = useState<PersonViewModel[]>([]);

  const loadDepartments = async () => {
    const result = await personService.getAllDepartments();
    setDepartments(result);
  };

  const loadPeople = async () => {
    const all = await personService.getAllPeople();
    setPeople(all);
  };

  const handleLogin = async (user: { firstName: string; email: string }) => {
    const loginData = await login(user);
    if (loginData.session.token) {
      localStorage.removeItem("token");
      localStorage.setItem("token", loginData.session.token);
    } else {
      console.error("No token received!");
    }

    const token = localStorage.getItem("token");
    if (token && loginData !== null && loginData.session.token) {
      setLoggedInUser(loginData.user);
      await loadPeople();
      await loadDepartments();
    } else {
      alert("User not found");
    }
  };

  const handleSave = async (person: PersonViewModel) => {
    if (person.id === 0 && loggedInUser) {
      await personService.addPerson(person);
    } else {
      await personService.updatePerson(person);
    }
    await loadPeople();
    setSelectedPerson(null);
  };

  const handleDelete = async (id: number) => {
    if (id > 0 && loggedInUser && loggedInUser.id !== id) {
      await personService.deletePerson(id);
    }
    await loadPeople();
    setSelectedPerson(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedInUser(null);
    setSelectedPerson(null);
    setPeople([]);
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPeople(people);
    } else {
      const results = personService.searchPeople(searchTerm);
      setFilteredPeople(results);
    }
  }, [people, searchTerm]);

  if (!loggedInUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const isAdmin = loggedInUser.role === "admin";
  const visiblePeople = isAdmin
    ? filteredPeople
    : filteredPeople.filter((p) => p.id === loggedInUser.id);

  return (
    <>
      {/* Top App Bar */}
      <AppBar position="static" color="primary">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" component="div">
            Person Manager
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body1">
              {loggedInUser.firstName} {loggedInUser.lastName}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container>
        <ContentWrapper>
          {isAdmin && (
            <LeftPane>
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search people..."
              />
              <PersonList
                people={visiblePeople}
                onSelect={async (id: number) => {
                  const person = await personService.getPerson(id);
                  setSelectedPerson(person);
                }}
                onAddNew={() =>
                  setSelectedPerson({
                    id: 0,
                    firstName: "",
                    lastName: "",
                    role: "user",
                    department: 1,
                    dateOfBirth: "",
                    email: "",
                  })
                }
              />
            </LeftPane>
          )}

          <RightPane>
            {selectedPerson ? (
              <PersonEditor
                person={selectedPerson}
                onSave={handleSave}
                onCancel={() => setSelectedPerson(null)}
                onDelete={() => handleDelete(selectedPerson.id)}
                currentUser={loggedInUser}
                departments={departments}
              />
            ) : (
              <PersonSummary isAdmin={isAdmin} />
            )}

            {!isAdmin && (
              <PersonEditor
                person={loggedInUser}
                onSave={handleSave}
                onCancel={() => setSelectedPerson(null)}
                currentUser={loggedInUser}
                departments={departments}
              />
            )}
          </RightPane>
        </ContentWrapper>
      </Container>
    </>
  );
};

export default MainPage;
