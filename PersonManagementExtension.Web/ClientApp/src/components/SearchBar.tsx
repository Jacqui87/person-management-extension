import React from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import { useTranslation } from "react-i18next";
import { PersonState, PersonAction } from "../state/personReducer";

const SearchBar = ({
  state,
  dispatch,
}: {
  state: PersonState;
  dispatch: React.Dispatch<PersonAction>;
}) => {
  const { t } = useTranslation();

  const { searchTerm, filterRole, filterDepartment, departments, roles } =
    state;

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
      <TextField
        label={t("search_bar.search_people")}
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
        label={t("person_editor.role")}
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
          {t("search_bar.all_roles")}
        </MenuItem>
        {roles.map((role) => (
          <MenuItem key={role.id} value={role.id}>
            {role.type}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label={t("person_editor.department")}
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
          {t("search_bar.all_departments")}
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
