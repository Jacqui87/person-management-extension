import { useState, useEffect, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import Tooltip from "@mui/material/Tooltip";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ADMIN_ROLE_ID } from "../constants/roles";
import { MainPageState, MainPageAction } from "../state/mainPageReducer";
import { PersonViewModel } from "../models/PersonViewModel";
import { DepartmentViewModel } from "../models/DepartmentViewModel";
import { RoleViewModel } from "../models/RoleViewModel";
import { PersonService } from "../services/personService";
import useTheme from "@mui/material/styles/useTheme";

// Create dynamic Yup validation schema based on user role and passwordChanged status
const makeValidationSchema = (userRole?: number, passwordChanged?: boolean) =>
  Yup.object({
    firstName: Yup.string()
      .required("First Name is required")
      .max(50, "First Name must be 50 characters or less"),
    lastName: Yup.string()
      .required("Last Name is required")
      .max(50, "Last Name must be 50 characters or less"),
    dateOfBirth: Yup.string()
      .required("Date of Birth is required")
      .matches(
        /^\d{4}-\d{2}-\d{2}$/,
        "Date of Birth must be in YYYY-MM-DD format"
      ),
    email: Yup.string()
      .required("Email is required")
      .email("Invalid email address")
      .test(
        "strict-domain",
        "Email domain must contain at least one dot and valid characters",
        (value) => {
          if (!value) return false;
          const [localPart, domain] = value.split("@");
          if (!localPart || !domain) return false;

          // Check domain contains at least one dot and valid domain format
          if (!/\.[a-zA-Z]{2,}$/.test(domain)) return false;

          // Optional: Additional character restrictions on local and domain parts
          // Basic regex for allowed characters in local part (simplified)
          const localValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(
            localPart
          );
          // Basic regex for allowed characters in domain part
          const domainValid = /^[a-zA-Z0-9.-]+$/.test(domain);

          return localValid && domainValid;
        }
      ),
    password: Yup.string().test(
      "password-strength-if-changed",
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      (value) => {
        if (passwordChanged) {
          if (!value) return false;

          const minLength = value.length >= 8;
          const hasUppercase = /[A-Z]/.test(value);
          const hasLowercase = /[a-z]/.test(value);
          const hasNumber = /\d/.test(value);
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

          return (
            minLength &&
            hasUppercase &&
            hasLowercase &&
            hasNumber &&
            hasSpecialChar
          );
        }
        return true; // skip if password not changed
      }
    ),
    confirmPassword: passwordChanged
      ? Yup.string()
          .oneOf([Yup.ref("password")], "Passwords do not match")
          .required("Confirm Password is required")
      : Yup.string().notRequired(),
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
  const theme = useTheme();
  const currentUser = state.loggedInUser;
  const departments: DepartmentViewModel[] = state.departments;
  const roles: RoleViewModel[] = state.roles;
  const serverErrors = state.errors;

  const [passwordChanged, setPasswordChanged] = useState(false);
  const [emailUniqueError, setEmailUniqueError] = useState<string | null>(null);

  const today = new Date();
  const maxDate = today.toISOString().split("T")[0];
  const eighteenYearsAgo = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );
  const defaultDob = eighteenYearsAgo.toISOString().split("T")[0];

  useEffect(() => {
    setPasswordChanged(false);
  }, [person]);

  if (!currentUser) {
    return null;
  }

  const canEdit =
    currentUser.role === ADMIN_ROLE_ID || currentUser.id === person.id;

  const getValidationSchema = useCallback(
    () => makeValidationSchema(currentUser.role, passwordChanged),
    [currentUser.role, passwordChanged]
  );

  const initialPersonValues: PersonViewModel & { confirmPassword: string } = {
    ...person,
    confirmPassword: "",
    dateOfBirth:
      person.dateOfBirth && person.dateOfBirth.trim() !== ""
        ? person.dateOfBirth
        : defaultDob,
  };

  const formik = useFormik<PersonViewModel & { confirmPassword: string }>({
    enableReinitialize: true,
    initialValues: initialPersonValues,
    validationSchema: useMemo(
      () => getValidationSchema(),
      [getValidationSchema]
    ),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      onSave({
        ...values,
        confirmPassword: undefined,
      } as PersonViewModel);
    },
  });

  useEffect(() => {
    if (!canEdit) return; // skip if no permission

    const email = formik.values.email;
    if (!email) {
      setEmailUniqueError(null);
      return;
    }

    let isMounted = true;

    // Call personService to check if email is unique (assume personService.hasEmailUniqueAsync returns Promise<boolean>)
    personService
      .isEmailUnique(email, person.id) // pass exclude id to skip current person
      .then((isUnique: boolean) => {
        if (isMounted) {
          setEmailUniqueError(isUnique ? null : "Email must be unique");
        }
      })
      .catch(() => {
        if (isMounted) {
          setEmailUniqueError(null); // or some error message if desired
        }
      });

    return () => {
      isMounted = false;
    };
  }, [formik.values.email, person.id, personService, canEdit]);

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
          label={
            <Box display="flex" alignItems="center" gap={0.5}>
              First Name *
              <Tooltip
                title={
                  <span style={{ whiteSpace: "pre-line", fontSize: 12 }}>
                    First Name Rules:
                    {"\n"}- Required
                    {"\n"}- No more than 50 characters
                  </span>
                }
                arrow
                placement="right"
              >
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  style={{ color: theme.palette.info.main, cursor: "pointer" }}
                />
              </Tooltip>
            </Box>
          }
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
          label={
            <Box display="flex" alignItems="center" gap={0.5}>
              Last Name *
              <Tooltip
                title={
                  <span style={{ whiteSpace: "pre-line", fontSize: 12 }}>
                    Last Name Rules:
                    {"\n"}- Required
                    {"\n"}- No more than 50 characters
                  </span>
                }
                arrow
                placement="right"
              >
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  style={{ color: theme.palette.info.main, cursor: "pointer" }}
                />
              </Tooltip>
            </Box>
          }
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
          label="Date of Birth *"
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
            label="Department *"
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
            label="Role *"
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
          label="Email *"
          name="email"
          fullWidth
          value={formik.values.email}
          onChange={handleFieldChange}
          onBlur={formik.handleBlur}
          disabled={!canEdit}
          helperText={
            (formik.touched.email && formik.errors.email) ??
            emailUniqueError ??
            (serverErrors.Email ? serverErrors.Email.join(" ") : "")
          }
          error={
            (formik.touched.email && Boolean(formik.errors.email)) ||
            Boolean(emailUniqueError) ||
            Boolean(serverErrors.Email)
          }
        />

        <TextField
          label={
            <Box display="flex" alignItems="center" gap={0.5}>
              Password *
              <Tooltip
                title={
                  <span style={{ whiteSpace: "pre-line", fontSize: 12 }}>
                    Password Rules:
                    {"\n"}- At least 8 characters
                    {"\n"}- At least 1 uppercase letter
                    {"\n"}- At least 1 lowercase letter
                    {"\n"}- At least 1 number
                    {"\n"}- At least 1 special character (e.g., !@#$%^&*)
                  </span>
                }
                arrow
                placement="right"
              >
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  style={{ color: theme.palette.info.main, cursor: "pointer" }}
                />
              </Tooltip>
            </Box>
          }
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

        {passwordChanged && formik.touched.password && (
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.confirmPassword &&
              Boolean(formik.errors.confirmPassword)
            }
            helperText={
              formik.touched.confirmPassword && formik.errors.confirmPassword
            }
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
          <>
            <Box display="flex" justifyContent="flex-end" gap={2} pt={2}>
              <Button
                variant="contained"
                onClick={() => formik.handleSubmit()}
                disabled={
                  !formik.isValid ||
                  formik.isSubmitting ||
                  Boolean(emailUniqueError)
                }
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

            {person.id === currentUser.id &&
              currentUser.role === ADMIN_ROLE_ID && (
                <Typography component="p" color="info.main" align="right">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  You cannot delete yourself
                </Typography>
              )}
          </>
        )}
      </Stack>
    </Box>
  );
};

export default PersonEditor;
