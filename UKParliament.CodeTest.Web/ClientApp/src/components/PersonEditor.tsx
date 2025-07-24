import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  MenuItem,
} from "@mui/material";
import { PersonViewModel } from "../models/PersonViewModel";
import { DepartmentViewModel } from "../models/DepartmentViewModel";

const roles = ["user", "admin"];

const PersonEditor = ({
  person,
  onSave,
  onCancel,
  onDelete,
  currentUser,
  departments,
}: {
  person: PersonViewModel;
  onSave: (person: PersonViewModel) => void;
  onCancel: () => void;
  onDelete?: (id: number) => void;
  currentUser: PersonViewModel;
  departments: DepartmentViewModel[];
}) => {
  const [draft, setDraft] = useState<PersonViewModel>({ ...person });

  useEffect(() => {
    setDraft({ ...person });
  }, [person]);

  const handleChange = (field: keyof PersonViewModel, value: string) => {
    setDraft({ ...draft, [field]: value });
  };

  const canEdit = currentUser.role == "admin" || currentUser.id === draft.id;

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        {draft.id === 0 ? "Add Person" : "Edit Person"}
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="First Name"
          value={draft.firstName}
          onChange={(e) => handleChange("firstName", e.target.value)}
          fullWidth
          disabled={!canEdit}
        />
        <TextField
          label="Last Name"
          value={draft.lastName}
          onChange={(e) => handleChange("lastName", e.target.value)}
          fullWidth
          disabled={!canEdit}
        />
        <TextField
          label="Email"
          value={draft.email}
          onChange={(e) => handleChange("email", e.target.value)}
          fullWidth
          disabled={!canEdit}
        />
        <TextField
          label="Password"
          value={draft.password}
          onChange={(e) => handleChange("password", e.target.value)}
          fullWidth
          disabled={!canEdit}
        />

        <TextField
          select
          label="Department"
          fullWidth
          value={draft.department}
          onChange={(e) =>
            setDraft({ ...draft, department: Number(e.target.value) })
          }
        >
          {departments.map((dept) => (
            <MenuItem key={dept.id} value={dept.id}>
              {dept.name}
            </MenuItem>
          ))}
        </TextField>

        {person.id !== currentUser.id && (
          <TextField
            label="Role"
            value={draft.role}
            onChange={(e) => handleChange("role", e.target.value)}
            fullWidth
            select
            disabled={!canEdit}
          >
            {roles.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>
        )}

        <TextField
          label="Date of Birth"
          type="date"
          value={draft.dateOfBirth ?? ""}
          onChange={(e) => handleChange("dateOfBirth", e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          disabled={!canEdit}
        />

        {canEdit && (
          <Box display="flex" justifyContent="flex-end" gap={2} pt={2}>
            <Button variant="contained" onClick={() => onSave(draft)}>
              Save
            </Button>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            {currentUser.role === "admin" && person.id !== currentUser.id && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => onDelete?.(person.id)}
              >
                Delete
              </Button>
            )}
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default PersonEditor;
