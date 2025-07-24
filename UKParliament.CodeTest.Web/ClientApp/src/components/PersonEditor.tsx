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
import { ADMIN_ROLE_ID } from "../constants/roles";
import { RoleViewModel } from "../models/RoleViewModel";

const PersonEditor = ({
  person,
  onSave,
  onCancel,
  onDelete,
  currentUser,
  departments,
  roles,
  errors,
  setErrors,
}: {
  person: PersonViewModel;
  onSave: (person: PersonViewModel) => void;
  onCancel: () => void;
  onDelete?: (id: number) => void;
  currentUser: PersonViewModel | null;
  departments: DepartmentViewModel[];
  roles: RoleViewModel[];
  errors: { [key: string]: string[] };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>;
}) => {
  const [draft, setDraft] = useState<PersonViewModel>({ ...person });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  // Track if password was changed by the user
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    setDraft({ ...person });
    setConfirmPassword("");
    setConfirmPasswordError(null);
    setPasswordChanged(false); // reset flag on person change
  }, [person]);

  const handleChange = (field: keyof PersonViewModel, value: string) => {
    setDraft({ ...draft, [field]: value });

    // Clear field errors on change
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    if (field === "password") {
      setPasswordChanged(true); // mark password as changed on first edit
      setConfirmPasswordError(null);
    }
  };

  const canEdit =
    currentUser?.role === ADMIN_ROLE_ID || currentUser?.id === draft.id;

  const handleSaveClick = () => {
    // Only validate confirm password if password was changed
    if (passwordChanged && draft.password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }
    setConfirmPasswordError(null);

    onSave(draft);
  };

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

        {currentUser?.role === ADMIN_ROLE_ID && (
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
            disabled={!canEdit}
          >
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
          </TextField>
        )}

        {person.id !== currentUser?.id && (
          <TextField
            select
            label="Role"
            fullWidth
            value={draft.role}
            onChange={(e) =>
              setDraft({ ...draft, role: Number(e.target.value) })
            }
            error={Boolean(errors.Role)}
            helperText={errors.Role ? errors.Role.join(" ") : ""}
            disabled={!canEdit}
          >
            {roles.map((role) => (
              <MenuItem key={role.id} value={role.id}>
                {role.type}
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

        {/* Password Field */}
        <TextField
          label="Password"
          type="password"
          value={draft.password}
          onChange={(e) => handleChange("password", e.target.value)}
          fullWidth
          disabled={!canEdit}
          error={Boolean(errors.Password)}
          helperText={errors.Password ? errors.Password.join(" ") : ""}
          autoComplete="new-password"
        />

        {/* Conditionally render Confirm Password only if password was changed */}
        {passwordChanged && (
          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            disabled={!canEdit}
            error={Boolean(confirmPasswordError)}
            helperText={confirmPasswordError ?? ""}
            autoComplete="new-password"
          />
        )}

        <TextField
          label="Biography"
          value={draft.biography}
          onChange={(e) => handleChange("biography", e.target.value)}
          fullWidth
          multiline
          rows={4}
          disabled={!canEdit}
          error={Boolean(errors.Biography)}
          helperText={errors.Biography ? errors.Biography.join(" ") : ""}
        />

        {canEdit && (
          <>
            <Box display="flex" justifyContent="flex-end" gap={2} pt={2}>
              <Button variant="contained" onClick={handleSaveClick}>
                Save
              </Button>
              <Button variant="outlined" onClick={onCancel}>
                Cancel
              </Button>
              {currentUser?.role === ADMIN_ROLE_ID && (
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

            {person.id === currentUser.id &&
              currentUser?.role === ADMIN_ROLE_ID && (
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
