import { useEffect } from "react";
import TextField from "@mui/material/TextField";
import { PersonViewModel } from "../../models/PersonViewModel";
import { useTranslation } from "react-i18next";
import { FormikProps } from "formik";
import { useIsEmailUnique } from "../../hooks/usePeopleHooks";

interface EmailFieldProps {
  personId: number;
  canEdit: boolean;
  formik: FormikProps<PersonViewModel & { confirmPassword: string }>;
  handleFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EmailField = ({
  personId,
  canEdit,
  formik,
  handleFieldChange,
}: EmailFieldProps) => {
  const { t } = useTranslation();
  const isEmailUnique = useIsEmailUnique(formik.values.email, personId);

  useEffect(() => {
    // If the email is invalid or empty, ignore uniqueness error for now
    if (!formik.values.email || !formik.touched.email) {
      formik.setFieldError("email", undefined);
      return;
    }

    if (isEmailUnique === false) {
      formik.setFieldError("email", t("person_editor.email_unique"));
    } else {
      // Clear uniqueness error only if that is currently set
      if (formik.errors.email === t("person_editor.email_unique")) {
        formik.setFieldError("email", undefined);
      }
    }
  }, [isEmailUnique, formik.values.email, formik.touched.email, formik, t]);

  return (
    <TextField
      label={`${t("person_editor.email")} *`}
      name="email"
      fullWidth
      value={formik.values.email}
      onChange={handleFieldChange}
      onBlur={formik.handleBlur}
      disabled={!canEdit}
      error={formik.touched.email && Boolean(formik.errors.email)}
      helperText={formik.touched.email && formik.errors.email}
    />
  );
};

export default EmailField;
