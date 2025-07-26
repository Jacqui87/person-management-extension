import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ADMIN_ROLE_ID } from "../constants/roles";
import { MainPageState, MainPageAction } from "../state/mainPageReducer";
import { PersonViewModel } from "../models/PersonViewModel";
import { DepartmentViewModel } from "../models/DepartmentViewModel";
import { RoleViewModel } from "../models/RoleViewModel";
import { PersonService } from "../services/personService";

// Create dynamic Yup validation schema based on user role and passwordChanged status
const makeValidationSchema = (
  person: PersonViewModel,
  personService: PersonService,
  dispatch: React.Dispatch<MainPageAction>,
  uniqueEmail: boolean,
  userRole?: number,
  passwordChanged?: boolean
) =>
  Yup.object({
    firstName: Yup.string().required("First Name is required"),
    lastName: Yup.string().required("Last Name is required"),
    dateOfBirth: Yup.string()
      .required("Date of Birth is required")
      .matches(
        /^\d{4}-\d{2}-\d{2}$/,
        "Date of Birth must be in YYYY-MM-DD format"
      ),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required")
      .test("email-unique", "Email must be unique", function (value) {
        if (!personService) return true; // skip if no service
        dispatch({
          type: "UNIQUE_EMAIL_CHECK",
          payload: {
            email: value,
            excludePersonId: person.id,
            personService: personService,
          },
        });
        return uniqueEmail;
      }),
    password: Yup.string().test(
      "password-length-if-changed",
      "Password must be at least 6 characters",
      (value) => {
        if (passwordChanged) {
          return !!value && value.length >= 6;
        }
        return true; // skip if password not changed
      }
    ),
    biography: Yup.string().max(
      500,
      "Biography must be 500 characters or less"
    ),
    department:
      userRole === ADMIN_ROLE_ID
        ? Yup.number().required("Department is required")
        : Yup.number().notRequired(),
    role:
      userRole === ADMIN_ROLE_ID
        ? Yup.number().required("Role is required")
        : Yup.number().notRequired(),
  });

interface PersonEditorProps {
  state: MainPageState;
  dispatch: React.Dispatch<MainPageAction>;
  person: PersonViewModel;
  onSave: (person: PersonViewModel) => void;
  onDelete?: (id: number) => void;
  personService: PersonService;
  setSnackbarStatus: React.Dispatch<
    React.SetStateAction<"success" | "failed" | "info" | "warning" | "closed">
  >;
}

const PersonEditor = ({
  state,
  dispatch,
  person,
  onSave,
  onDelete,
  personService,
  setSnackbarStatus,
}: PersonEditorProps) => {
  const currentUser = state.loggedInUser;
  const departments: DepartmentViewModel[] = state.departments;
  const roles: RoleViewModel[] = state.roles;
  const serverErrors = state.errors;

  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const today = new Date();
  const maxDate = today.toISOString().split("T")[0];
  const eighteenYearsAgo = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );
  const defaultDob = eighteenYearsAgo.toISOString().split("T")[0];

  useEffect(() => {
    // Reset confirm password and flags when person changes
    setConfirmPassword("");
    setConfirmPasswordError(null);
    setPasswordChanged(false);
  }, [person]);

  if (!currentUser) {
    return null;
  }

  const canEdit =
    currentUser.role === ADMIN_ROLE_ID || currentUser.id === person.id;

  const validationSchema = useCallback(
    () =>
      makeValidationSchema(
        person,
        personService,
        dispatch,
        state.uniqueEmail,
        currentUser.role,
        passwordChanged
      ),
    [
      person,
      personService,
      dispatch,
      currentUser.role,
      passwordChanged,
      state.uniqueEmail,
    ]
  );

  const initialPersonValues: PersonViewModel = {
    ...person,
    dateOfBirth:
      person.dateOfBirth && person.dateOfBirth.trim() !== ""
        ? person.dateOfBirth
        : defaultDob,
  };

  const formik = useFormik<PersonViewModel>({
    enableReinitialize: true,
    initialValues: initialPersonValues,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      if (passwordChanged && values.password !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match");
        return;
      }
      setConfirmPasswordError(null);
      onSave(values);
    },
  });

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.handleChange(e);

    if (serverErrors[name]) {
      const newErrors = { ...serverErrors };
      delete newErrors[name];
      dispatch({ type: "SET_ERRORS", payload: newErrors });
    }

    if (name === "password") {
      setPasswordChanged(true);
      setConfirmPasswordError(null);
    }
  };

  const handleCancel = () => {
    formik.resetForm();
    setSnackbarStatus("info");
    dispatch({ type: "SET_SELECTED_PERSON", payload: null });
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        {person.id === 0 ? "Add Person" : "Edit Person"}
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="First Name"
          name="firstName"
          value={formik.values.firstName}
          onChange={handleFieldChange}
          onBlur={formik.handleBlur}
          fullWidth
          disabled={!canEdit}
          error={
            (formik.touched.firstName && Boolean(formik.errors.firstName)) ||
            Boolean(serverErrors.FirstName)
          }
          helperText={
            (formik.touched.firstName && formik.errors.firstName) ??
            (serverErrors.FirstName ? serverErrors.FirstName.join(" ") : "")
          }
        />

        <TextField
          label="Last Name"
          name="lastName"
          value={formik.values.lastName}
          onChange={handleFieldChange}
          onBlur={formik.handleBlur}
          fullWidth
          disabled={!canEdit}
          error={
            (formik.touched.lastName && Boolean(formik.errors.lastName)) ||
            Boolean(serverErrors.LastName)
          }
          helperText={
            (formik.touched.lastName && formik.errors.lastName) ??
            (serverErrors.LastName ? serverErrors.LastName.join(" ") : "")
          }
        />

        <TextField
          label="Date of Birth"
          type="date"
          name="dateOfBirth"
          value={formik.values.dateOfBirth ?? defaultDob}
          onChange={handleFieldChange}
          onBlur={formik.handleBlur}
          InputLabelProps={{ shrink: true }}
          fullWidth
          disabled={!canEdit}
          error={
            (formik.touched.dateOfBirth &&
              Boolean(formik.errors.dateOfBirth)) ||
            Boolean(serverErrors.DateOfBirth)
          }
          helperText={
            (formik.touched.dateOfBirth && formik.errors.dateOfBirth) ??
            (serverErrors.DateOfBirth ? serverErrors.DateOfBirth.join(" ") : "")
          }
          inputProps={{
            max: maxDate,
          }}
        />

        {currentUser.role === ADMIN_ROLE_ID && (
          <TextField
            select
            label="Department"
            name="department"
            fullWidth
            value={formik.values.department}
            onChange={handleFieldChange}
            onBlur={formik.handleBlur}
            disabled={!canEdit}
            error={
              (formik.touched.department &&
                Boolean(formik.errors.department)) ||
              Boolean(serverErrors.Department)
            }
            helperText={
              (formik.touched.department && formik.errors.department) ??
              (serverErrors.Department ? serverErrors.Department.join(" ") : "")
            }
          >
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
          </TextField>
        )}

        {person.id !== currentUser.id && currentUser.role === ADMIN_ROLE_ID && (
          <TextField
            select
            label="Role"
            name="role"
            fullWidth
            value={formik.values.role}
            onChange={handleFieldChange}
            onBlur={formik.handleBlur}
            disabled={!canEdit}
            error={
              (formik.touched.role && Boolean(formik.errors.role)) ||
              Boolean(serverErrors.Role)
            }
            helperText={
              (formik.touched.role && formik.errors.role) ??
              (serverErrors.Role ? serverErrors.Role.join(" ") : "")
            }
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
          name="email"
          fullWidth
          value={formik.values.email}
          onChange={handleFieldChange}
          onBlur={formik.handleBlur}
          disabled={!canEdit}
          error={
            (formik.touched.email && Boolean(formik.errors.email)) ||
            Boolean(serverErrors.Email)
          }
          helperText={
            (formik.touched.email && formik.errors.email) ??
            (serverErrors.Email ? serverErrors.Email.join(" ") : "")
          }
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          fullWidth
          value={formik.values.password}
          onChange={handleFieldChange}
          onBlur={formik.handleBlur}
          disabled={!canEdit}
          error={
            (formik.touched.password && Boolean(formik.errors.password)) ||
            Boolean(serverErrors.Password)
          }
          helperText={
            (formik.touched.password && formik.errors.password) ??
            (serverErrors.Password ? serverErrors.Password.join(" ") : "")
          }
          autoComplete="new-password"
        />

        {passwordChanged && (
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={formik.handleBlur}
            disabled={!canEdit}
            error={Boolean(confirmPasswordError)}
            helperText={confirmPasswordError ?? ""}
            autoComplete="new-password"
          />
        )}

        <TextField
          label="Biography"
          name="biography"
          fullWidth
          multiline
          rows={4}
          value={formik.values.biography}
          onChange={handleFieldChange}
          onBlur={formik.handleBlur}
          disabled={!canEdit}
          error={
            (formik.touched.biography && Boolean(formik.errors.biography)) ||
            Boolean(serverErrors.Biography)
          }
          helperText={
            (formik.touched.biography && formik.errors.biography) ??
            (serverErrors.Biography ? serverErrors.Biography.join(" ") : "")
          }
        />

        {canEdit && (
          <Box display="flex" justifyContent="flex-end" gap={2} pt={2}>
            <Button
              variant="contained"
              onClick={() => formik.handleSubmit()}
              disabled={!formik.isValid} // Only disable if invalid, allow save even if untouched but valid
            >
              Save
            </Button>
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            {currentUser.role === ADMIN_ROLE_ID && (
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
        )}
      </Stack>
    </Box>
  );
};

export default PersonEditor;
