import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { CircularProgress } from "@mui/material";
import { ADMIN_ROLE_ID } from "../constants/roles";
import { PersonState, PersonAction } from "../state/personReducer";
import { PersonViewModel } from "../models/PersonViewModel";
import { DepartmentViewModel } from "../models/DepartmentViewModel";
import { RoleViewModel } from "../models/RoleViewModel";
import { usePeople, useAddPerson, useUpdatePerson } from "../hooks/personHooks";
import FirstnameField from "../elements/PersonForm/FirstnameField";
import LastnameField from "../elements/PersonForm/LastnameField";
import DobField from "../elements/PersonForm/DobField";
import EmailField from "../elements/PersonForm/EmailField";
import LanguageSelect from "../elements/PersonForm/LanguageSelect";
import PasswordFields from "../elements/PersonForm/PasswordFields";
import RoleSelect from "../elements/PersonForm/RoleSelect";
import DepartmentSelect from "../elements/PersonForm/DepartmentSelect";
import BiographyField from "../elements/PersonForm/BiographyField";
import PersonFormButtons from "../elements/PersonForm/PersonFormButtons";
import { personFormik } from "../elements/PersonForm/personFormik";

interface PersonEditorProps {
  state: PersonState;
  dispatch: React.Dispatch<PersonAction>;
  person: PersonViewModel;
  setSnackbarStatus: React.Dispatch<
    React.SetStateAction<"success" | "failed" | "info" | "warning" | "closed">
  >;
}

const PersonEditor = ({
  state,
  dispatch,
  person,
  setSnackbarStatus,
}: PersonEditorProps) => {
  const { t } = useTranslation();
  const { isLoading } = usePeople();

  const currentUser = state.loggedInUser;
  const departments: DepartmentViewModel[] = state.departments;
  const roles: RoleViewModel[] = state.roles;

  const [passwordChanged, setPasswordChanged] = useState(false);

  const today = new Date();
  const eighteenYearsAgo = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );
  const defaultDob = eighteenYearsAgo.toISOString().split("T")[0];

  const formik = personFormik({
    currentUser: currentUser,
    dispatch: dispatch,
    person: person,
    defaultDob: defaultDob,
    passwordChanged: passwordChanged,
    setSnackbarStatus: setSnackbarStatus,
  });

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(e);

    if (e.target.name === "password") {
      setPasswordChanged(true);
    }
  };

  const canEdit =
    currentUser?.role === ADMIN_ROLE_ID || currentUser?.id === person.id;

  return (
    <>
      {!currentUser ? (
        <>{t("common.unathorised_access")}</>
      ) : (
        <>
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Box p={3}>
              <Typography variant="h5" gutterBottom>
                {person.id === 0
                  ? t("person_editor.add")
                  : t("person_editor.edit")}
              </Typography>

              <Stack spacing={2}>
                <FirstnameField
                  canEdit={canEdit}
                  formik={formik}
                  handleFieldChange={handleFieldChange}
                />

                <LastnameField
                  canEdit={canEdit}
                  formik={formik}
                  handleFieldChange={handleFieldChange}
                />

                <DobField
                  canEdit={canEdit}
                  formik={formik}
                  defaultDob={defaultDob}
                  handleFieldChange={handleFieldChange}
                />

                <EmailField
                  canEdit={canEdit}
                  formik={formik}
                  personId={person.id}
                  handleFieldChange={handleFieldChange}
                />

                <LanguageSelect
                  canEdit={canEdit}
                  formik={formik}
                  handleFieldChange={handleFieldChange}
                />

                <PasswordFields
                  canEdit={canEdit}
                  formik={formik}
                  passwordChanged={passwordChanged}
                  handleFieldChange={handleFieldChange}
                />

                {person.id !== currentUser.id &&
                  currentUser.role === ADMIN_ROLE_ID && (
                    <RoleSelect
                      canEdit={canEdit}
                      formik={formik}
                      roles={roles}
                      handleFieldChange={handleFieldChange}
                    />
                  )}

                {currentUser.role === ADMIN_ROLE_ID && (
                  <DepartmentSelect
                    canEdit={canEdit}
                    formik={formik}
                    departments={departments}
                    handleFieldChange={handleFieldChange}
                  />
                )}

                <BiographyField
                  canEdit={canEdit}
                  formik={formik}
                  handleFieldChange={handleFieldChange}
                />

                <PersonFormButtons
                  person={person}
                  currentUser={currentUser}
                  canEdit={canEdit}
                  state={state}
                  dispatch={dispatch}
                  formik={formik}
                  setSnackbarStatus={setSnackbarStatus}
                />
              </Stack>
            </Box>
          )}
        </>
      )}
    </>
  );
};

export default PersonEditor;
