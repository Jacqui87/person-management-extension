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
  errors,
  setErrors,
}: {
  person: PersonViewModel;
  onSave: (person: PersonViewModel) => void;
  onCancel: () => void;
  onDelete?: (id: number) => void;
  currentUser: PersonViewModel;
  departments: DepartmentViewModel[];
  errors: { [key: string]: string[] };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>;
}) => {
  const [draft, setDraft] = useState<PersonViewModel>({ ...person });

  useEffect(() => {
    setDraft({ ...person });
  }, [person]);

  const handleChange = (field: keyof PersonViewModel, value: string) => {
    setDraft({ ...draft, [field]: value });

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const canEdit = currentUser.role === "admin" || currentUser.id === draft.id;

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
          error={Boolean(errors.FirstName)}
          helperText={errors.FirstName ? errors.FirstName.join(" ") : ""}
        />
        <TextField
          label="Last Name"
          value={draft.lastName}
          onChange={(e) => handleChange("lastName", e.target.value)}
          fullWidth
          disabled={!canEdit}
          error={Boolean(errors.LastName)}
          helperText={errors.LastName ? errors.LastName.join(" ") : ""}
        />
        <TextField
          label="Date of Birth"
          type="date"
          value={draft.dateOfBirth ?? ""}
          onChange={(e) => handleChange("dateOfBirth", e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          disabled={!canEdit}
          error={Boolean(errors.DateOfBirth)}
          helperText={errors.DateOfBirth ? errors.DateOfBirth.join(" ") : ""}
        />

        <TextField
          select
          label="Department"
          fullWidth
          value={draft.department}
          onChange={(e) =>
            setDraft({ ...draft, department: Number(e.target.value) })
          }
          error={Boolean(errors.Department)}
          helperText={errors.Department ? errors.Department.join(" ") : ""}
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
            error={Boolean(errors.Role)}
            helperText={errors.Role ? errors.Role.join(" ") : ""}
          >
            {roles.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>
        )}

        <TextField
          label="Email"
          value={draft.email}
          onChange={(e) => handleChange("email", e.target.value)}
          fullWidth
          disabled={!canEdit}
          error={Boolean(errors.Email)}
          helperText={errors.Email ? errors.Email.join(" ") : ""}
        />
        <TextField
          label="Password"
          value={draft.password}
          onChange={(e) => handleChange("password", e.target.value)}
          fullWidth
          disabled={!canEdit}
          error={Boolean(errors.Password)}
          helperText={errors.Password ? errors.Password.join(" ") : ""}
        />

        {canEdit && (
          <>
            <Box display="flex" justifyContent="flex-end" gap={2} pt={2}>
              <Button variant="contained" onClick={() => onSave(draft)}>
                Save
              </Button>
              <Button variant="outlined" onClick={onCancel}>
                Cancel
              </Button>
              {currentUser.role === "admin" && (
                <Button
                  variant="outlined"
                  color="error"
                  disabled={person.id === currentUser.id}
                  onClick={() => onDelete?.(person.id)}
                >
                  Delete
                </Button>
              )}
            </Box>
            {person.id === currentUser.id && (
              <Typography
                align="right"
                sx={{ fontStyle: "italic" }}
                variant="body1"
                color="textSecondary"
              >
                you cannot delete yourself
              </Typography>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
};

export default PersonEditor;
