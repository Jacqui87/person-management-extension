import React from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Autocomplete from "@mui/material/Autocomplete";
import { useTranslation } from "react-i18next";
import { PersonState, PersonAction } from "../state/personReducer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimesCircle } from "@fortawesome/free-solid-svg-icons";

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

  const roleOptions = [{ id: 0, type: t("search_bar.all_roles") }, ...roles];
  const departmentOptions = [
    { id: 0, name: t("search_bar.all_departments") },
    ...departments,
  ];

  // Reusable clear button
  const ClearButton = ({ onClick }: { onClick: () => void }) => (
    <InputAdornment position="end">
      <IconButton size="small" onClick={onClick} aria-label={t("common.clear")}>
        <FontAwesomeIcon icon={faTimesCircle} />
      </IconButton>
    </InputAdornment>
  );

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
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FontAwesomeIcon icon={faSearch} />
            </InputAdornment>
          ),
          endAdornment: searchTerm ? (
            <ClearButton
              onClick={() => dispatch({ type: "SET_SEARCH_TERM", payload: "" })}
            />
          ) : null,
        }}
      />

      <Autocomplete
        fullWidth
        options={roleOptions}
        getOptionLabel={(option) => option.type}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={roleOptions.find((r) => r.id === filterRole) || null}
        onChange={(_, newValue) =>
          dispatch({
            type: "SET_FILTER_ROLE",
            payload: newValue ? newValue.id : 0,
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label={t("person_editor.role")}
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {filterRole !== 0 && (
                    <ClearButton
                      onClick={() =>
                        dispatch({ type: "SET_FILTER_ROLE", payload: 0 })
                      }
                    />
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      <Autocomplete
        fullWidth
        options={departmentOptions}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={departmentOptions.find((d) => d.id === filterDepartment) || null}
        onChange={(_, newValue) =>
          dispatch({
            type: "SET_FILTER_DEPARTMENT",
            payload: newValue ? newValue.id : 0,
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label={t("person_editor.department")}
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {filterDepartment !== 0 && (
                    <ClearButton
                      onClick={() =>
                        dispatch({ type: "SET_FILTER_DEPARTMENT", payload: 0 })
                      }
                    />
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </Box>
  );
};

export default SearchBar;
