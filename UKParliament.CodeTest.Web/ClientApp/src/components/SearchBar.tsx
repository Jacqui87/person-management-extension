import React from "react";
import { TextField, Box, MenuItem } from "@mui/material";
import { MainPageState, MainPageAction } from "../state/mainPageReducer";

const SearchBar = ({
  state,
  dispatch,
}: {
  state: MainPageState;
  dispatch: React.Dispatch<MainPageAction>;
}) => {
  const { searchTerm, filterRole, filterDepartment, departments, roles } =
    state;

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
      <TextField
        label="Search people..."
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) =>
          dispatch({ type: "SET_SEARCH_TERM", payload: e.target.value })
        }
        sx={{ flexGrow: 1, minWidth: 200 }}
      />

      <TextField
        select
        label="Role"
        fullWidth
        value={filterRole}
        onChange={(e) =>
          dispatch({
            type: "SET_FILTER_ROLE",
            payload: Number(e.target.value),
          })
        }
      >
        <MenuItem key={99} value={0}>
          All roles
        </MenuItem>
        {roles.map((role) => (
          <MenuItem key={role.id} value={role.id}>
            {role.type}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Department"
        fullWidth
        value={filterDepartment}
        onChange={(e) =>
          dispatch({
            type: "SET_FILTER_DEPARTMENT",
            payload: Number(e.target.value),
          })
        }
      >
        <MenuItem key={99} value={0}>
          All departments
        </MenuItem>
        {departments.map((dept) => (
          <MenuItem key={dept.id} value={dept.id}>
            {dept.name}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default SearchBar;
