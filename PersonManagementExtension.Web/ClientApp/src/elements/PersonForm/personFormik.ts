import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import { PersonAction } from "../../state/personReducer";
import { PersonViewModel } from "../../models/PersonViewModel";
import { useAddPerson, useUpdatePerson } from "../../hooks/personHooks";
import { personSchema } from "./personSchema";

interface PersonEditorProps {
  currentUser: PersonViewModel | null;
  dispatch: React.Dispatch<PersonAction>;
  person: PersonViewModel;
  passwordChanged: boolean;
  defaultDob: string;
  setSnackbarStatus: React.Dispatch<
    React.SetStateAction<"success" | "failed" | "info" | "warning" | "closed">
  >;
}

export const personFormik = ({
  currentUser,
  dispatch,
  person,
  defaultDob,
  passwordChanged,
  setSnackbarStatus,
}: PersonEditorProps) => {
  const { t } = useTranslation();

  // React Query mutations
  const addPersonMutation = useAddPerson();
  const updatePersonMutation = useUpdatePerson();

  const initialPersonValues: PersonViewModel & { confirmPassword: string } = {
    ...person,
    confirmPassword: "",
    dateOfBirth:
      person.dateOfBirth && person.dateOfBirth.trim() !== ""
        ? person.dateOfBirth
        : defaultDob,
  };

  const schema = personSchema(t, currentUser?.role, passwordChanged);
  return useFormik<PersonViewModel & { confirmPassword: string }>({
    enableReinitialize: true,
    initialValues: initialPersonValues,
    validationSchema: useMemo(() => schema.formSchema, [schema]),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      const toSave = { ...values } as PersonViewModel;

      if (person.id === 0) {
        addPersonMutation.mutate(toSave, {
          onSuccess: () => {
            setSnackbarStatus("success");
            dispatch({ type: "SET_SELECTED_PERSON", payload: null });
          },
          onError: () => setSnackbarStatus("failed"),
        });
      } else {
        updatePersonMutation.mutate(toSave, {
          onSuccess: () => {
            setSnackbarStatus("success");
            dispatch({ type: "SET_SELECTED_PERSON", payload: null });
          },
          onError: () => setSnackbarStatus("failed"),
        });
      }
    },
  });
};
