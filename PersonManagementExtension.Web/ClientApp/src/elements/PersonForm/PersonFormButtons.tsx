import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { ADMIN_ROLE_ID } from "../../constants/roles";
import { PersonViewModel } from "../../models/PersonViewModel";
import { useTranslation } from "react-i18next";
import { FormikProps } from "formik";
import { PersonState, PersonAction } from "../../state/personReducer";
import { useDeletePerson, usePeople } from "../../hooks/personHooks";

interface PersonFormButtonsProps {
  person: PersonViewModel;
  currentUser: PersonViewModel;
  canEdit: boolean;
  state: PersonState;
  dispatch: React.Dispatch<PersonAction>;
  formik: FormikProps<PersonViewModel & { confirmPassword: string }>;
  setSnackbarStatus: React.Dispatch<
    React.SetStateAction<"success" | "failed" | "info" | "warning" | "closed">
  >;
}

const PersonFormButtons = ({
  person,
  currentUser,
  canEdit,
  state,
  dispatch,
  formik,
  setSnackbarStatus,
}: PersonFormButtonsProps) => {
  const { t } = useTranslation();

  const { data: people, error } = usePeople();
  const deletePersonMutation = useDeletePerson();

  const handleDelete = async (id: number) => {
    try {
      if (id > 0 && state.loggedInUser && state.loggedInUser.id !== id) {
        deletePersonMutation.mutate(id, {
          onSuccess: () => {
            setSnackbarStatus("success");

            dispatch({ type: "SET_PEOPLE", payload: people });
            dispatch({ type: "SET_SELECTED_PERSON", payload: null });
          },
          onError: () => setSnackbarStatus("failed"),
        });
      }
    } catch (err) {
      setSnackbarStatus("failed");
      console.error("Error deleting person:", err);
    }
  };

  const handleCancel = () => {
    formik.resetForm();
    setSnackbarStatus("info");
    dispatch({ type: "SET_SELECTED_PERSON", payload: null });
  };

  return (
    <>
      {canEdit && (
        <>
          <Box display="flex" justifyContent="flex-end" gap={2} pt={2}>
            <Button
              variant="contained"
              onClick={() => formik.handleSubmit()}
              disabled={
                !formik.isValid || formik.isSubmitting || error !== null
              }
            >
              {t("common.save")}
            </Button>
            <Button variant="outlined" onClick={handleCancel}>
              {t("common.cancel")}
            </Button>
            {currentUser.role === ADMIN_ROLE_ID && (
              <Button
                variant="outlined"
                color="error"
                disabled={person.id === currentUser.id}
                onClick={() => handleDelete(person.id)}
              >
                {t("common.delete")}
              </Button>
            )}
          </Box>

          {person.id === currentUser.id &&
            currentUser.role === ADMIN_ROLE_ID && (
              <Typography component="p" color="info.main" align="right">
                <FontAwesomeIcon icon={faInfoCircle} />
                {t("person_editor.cannot_delete_self")}
              </Typography>
            )}
        </>
      )}
    </>
  );
};

export default PersonFormButtons;
